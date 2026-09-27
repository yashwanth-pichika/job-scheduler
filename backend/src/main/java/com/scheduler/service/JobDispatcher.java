package com.scheduler.service;

import com.scheduler.model.*;
import com.scheduler.repository.ExecutionRepository;
import com.scheduler.repository.JobRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class JobDispatcher {

    private final ExecutionRepository executionRepository;
    private final JobRepository jobRepository;
    private final HeartbeatService heartbeatService;
    private final WorkerSimulationService workerSimulationService;

    public JobDispatcher(ExecutionRepository executionRepository,
                         JobRepository jobRepository,
                         HeartbeatService heartbeatService,
                         WorkerSimulationService workerSimulationService) {
        this.executionRepository = executionRepository;
        this.jobRepository = jobRepository;
        this.heartbeatService = heartbeatService;
        this.workerSimulationService = workerSimulationService;
    }

    @Scheduled(fixedRate = 1000)
    @Transactional
    public void dispatchPendingExecutions() {
        List<ExecutionStatus> pendingStatuses = List.of(ExecutionStatus.PENDING, ExecutionStatus.RETRYING);
        List<JobExecution> pendingList = executionRepository.findAll()
                .stream()
                .filter(e -> pendingStatuses.contains(e.getStatus()) && e.getWorkerNodeId() == null)
                .toList();

        if (pendingList.isEmpty()) return;

        List<NodeInfo> healthyNodes = heartbeatService.getHealthyNodes()
                .stream()
                .filter(n -> !n.isLeader() && workerSimulationService.isWorkerAlive(n.getNodeId()))
                .toList();

        if (healthyNodes.isEmpty()) return;

        for (JobExecution execution : pendingList) {
            // Select worker with lowest active threads (Least-Loaded strategy)
            Optional<NodeInfo> bestNode = healthyNodes.stream()
                    .min(Comparator.comparingInt(NodeInfo::getActiveThreads));

            if (bestNode.isPresent()) {
                NodeInfo targetNode = bestNode.get();
                Optional<JobDefinition> jobOpt = jobRepository.findById(execution.getJobId());
                if (jobOpt.isPresent()) {
                    execution.setWorkerNodeId(targetNode.getNodeId());
                    execution.setStatus(ExecutionStatus.DISPATCHED);
                    executionRepository.save(execution);

                    // Execute on targeted worker pool
                    workerSimulationService.executeJobAsync(execution, jobOpt.get(), targetNode.getNodeId());
                }
            }
        }
    }
}
