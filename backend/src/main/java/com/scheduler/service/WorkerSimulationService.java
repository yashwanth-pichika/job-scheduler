package com.scheduler.service;

import com.scheduler.model.*;
import com.scheduler.repository.ExecutionRepository;
import com.scheduler.repository.JobRepository;
import com.scheduler.repository.LogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;

@Service
public class WorkerSimulationService {

    private final HeartbeatService heartbeatService;
    private final ExecutionRepository executionRepository;
    private final JobRepository jobRepository;
    private final LogRepository logRepository;
    private final ScheduleCalculator scheduleCalculator;

    private final Map<String, ExecutorService> workerThreadPools = new ConcurrentHashMap<>();
    private final Map<String, Integer> activeThreadsMap = new ConcurrentHashMap<>();
    private final Set<String> deadWorkers = ConcurrentHashMap.newKeySet();

    @Autowired
    public WorkerSimulationService(HeartbeatService heartbeatService,
                                   ExecutionRepository executionRepository,
                                   JobRepository jobRepository,
                                   LogRepository logRepository,
                                   ScheduleCalculator scheduleCalculator) {
        this.heartbeatService = heartbeatService;
        this.executionRepository = executionRepository;
        this.jobRepository = jobRepository;
        this.logRepository = logRepository;
        this.scheduleCalculator = scheduleCalculator;

        // Initialize default cluster workers
        startWorker("worker-1", 5);
        startWorker("worker-2", 5);
        startWorker("worker-3", 5);
    }

    public synchronized void startWorker(String workerId, int maxThreads) {
        deadWorkers.remove(workerId);
        if (!workerThreadPools.containsKey(workerId)) {
            workerThreadPools.put(workerId, Executors.newFixedThreadPool(maxThreads));
            activeThreadsMap.put(workerId, 0);
            heartbeatService.registerNode(workerId, "node-" + workerId, "192.168.1." + (100 + workerId.hashCode() % 50), maxThreads, false);
        }
    }

    public synchronized void stopWorker(String workerId) {
        deadWorkers.add(workerId);
        ExecutorService pool = workerThreadPools.remove(workerId);
        if (pool != null) {
            pool.shutdownNow();
        }
        activeThreadsMap.remove(workerId);
        heartbeatService.markNodeDead(workerId);
    }

    public boolean isWorkerAlive(String workerId) {
        return workerThreadPools.containsKey(workerId) && !deadWorkers.contains(workerId);
    }

    public List<String> getActiveWorkerIds() {
        List<String> list = new ArrayList<>();
        for (String id : workerThreadPools.keySet()) {
            if (!deadWorkers.contains(id)) {
                list.add(id);
            }
        }
        return list;
    }

    @Scheduled(fixedRate = 2000)
    public void sendHeartbeats() {
        for (String workerId : workerThreadPools.keySet()) {
            if (!deadWorkers.contains(workerId)) {
                int active = activeThreadsMap.getOrDefault(workerId, 0);
                double cpu = Math.min(99.0, Math.round((0.05 + (active * 0.15) + (Math.random() * 0.1)) * 100.0) / 100.0);
                double mem = Math.round((120.0 + (active * 25.0) + (Math.random() * 20.0)) * 10.0) / 10.0;
                heartbeatService.sendHeartbeat(workerId, active, cpu, mem);
            }
        }
    }

    public void executeJobAsync(JobExecution execution, JobDefinition job, String workerId) {
        ExecutorService pool = workerThreadPools.get(workerId);
        if (pool == null || deadWorkers.contains(workerId)) {
            // Worker is dead, reset execution to pending for failover
            execution.setStatus(ExecutionStatus.PENDING);
            execution.setWorkerNodeId(null);
            executionRepository.save(execution);
            return;
        }

        activeThreadsMap.merge(workerId, 1, Integer::sum);
        execution.setStatus(ExecutionStatus.RUNNING);
        execution.setWorkerNodeId(workerId);
        execution.setStartTime(LocalDateTime.now());
        executionRepository.save(execution);

        logRepository.save(new ExecutionLog(execution.getId(), job.getId(), workerId, LogLevel.INFO,
                "Job execution assigned to worker node [" + workerId + "]"));

        pool.submit(() -> {
            try {
                logRepository.save(new ExecutionLog(execution.getId(), job.getId(), workerId, LogLevel.INFO,
                        "Executing payload: " + (job.getPayload() != null ? job.getPayload() : "{}")));

                // Simulate realistic job duration (1 to 4 seconds)
                long workDuration = 1000 + (long)(Math.random() * 3000);
                Thread.sleep(workDuration);

                // Check if worker was killed during execution
                if (deadWorkers.contains(workerId)) {
                    logRepository.save(new ExecutionLog(execution.getId(), job.getId(), workerId, LogLevel.ERROR,
                            "Worker node [" + workerId + "] crashed during execution!"));
                    return;
                }

                // Simulate random small failure chance (10%) unless payload contains "fail"
                boolean shouldFail = (job.getPayload() != null && job.getPayload().toLowerCase().contains("fail"))
                        || (Math.random() < 0.10 && execution.getRetryCount() < job.getMaxRetries());

                LocalDateTime endTime = LocalDateTime.now();
                long duration = Duration.between(execution.getStartTime(), endTime).toMillis();
                execution.setEndTime(endTime);
                execution.setDurationMs(duration);

                if (shouldFail) {
                    if (execution.getRetryCount() < job.getMaxRetries()) {
                        execution.setStatus(ExecutionStatus.RETRYING);
                        execution.setRetryCount(execution.getRetryCount() + 1);
                        execution.setErrorMessage("Simulated transient error during job execution. Will retry.");
                        executionRepository.save(execution);

                        logRepository.save(new ExecutionLog(execution.getId(), job.getId(), workerId, LogLevel.WARN,
                                "Execution failed (Attempt " + execution.getRetryCount() + "/" + job.getMaxRetries() + "). Re-queueing for retry..."));
                    } else {
                        execution.setStatus(ExecutionStatus.FAILED);
                        execution.setErrorMessage("Maximum retry limit (" + job.getMaxRetries() + ") reached. Job failed.");
                        executionRepository.save(execution);

                        logRepository.save(new ExecutionLog(execution.getId(), job.getId(), workerId, LogLevel.ERROR,
                                "Job failed after maximum retries. Reason: Simulated task exception."));
                    }
                } else {
                    execution.setStatus(ExecutionStatus.SUCCESS);
                    execution.setResult("Successfully processed payload in " + duration + "ms.");
                    executionRepository.save(execution);

                    logRepository.save(new ExecutionLog(execution.getId(), job.getId(), workerId, LogLevel.INFO,
                            "Job execution completed successfully in " + duration + "ms. Output: SUCCESS_OK"));
                }

            } catch (InterruptedException e) {
                execution.setStatus(ExecutionStatus.CANCELLED);
                execution.setErrorMessage("Thread interrupted during execution.");
                executionRepository.save(execution);
            } catch (Exception e) {
                execution.setStatus(ExecutionStatus.FAILED);
                execution.setErrorMessage("Execution error: " + e.getMessage());
                executionRepository.save(execution);
            } finally {
                activeThreadsMap.computeIfPresent(workerId, (k, current) -> Math.max(0, current - 1));
            }
        });
    }
}
