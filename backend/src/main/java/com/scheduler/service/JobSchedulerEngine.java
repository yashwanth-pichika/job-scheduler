package com.scheduler.service;

import com.scheduler.model.*;
import com.scheduler.repository.ExecutionRepository;
import com.scheduler.repository.JobRepository;
import com.scheduler.repository.LogRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class JobSchedulerEngine {

    private final JobRepository jobRepository;
    private final ExecutionRepository executionRepository;
    private final LogRepository logRepository;
    private final ScheduleCalculator scheduleCalculator;

    public JobSchedulerEngine(JobRepository jobRepository,
                               ExecutionRepository executionRepository,
                               LogRepository logRepository,
                               ScheduleCalculator scheduleCalculator) {
        this.jobRepository = jobRepository;
        this.executionRepository = executionRepository;
        this.logRepository = logRepository;
        this.scheduleCalculator = scheduleCalculator;
    }

    @Scheduled(fixedRateString = "${scheduler.poll-interval-ms:1000}")
    @Transactional
    public void schedulePendingJobs() {
        LocalDateTime now = LocalDateTime.now();
        List<JobDefinition> dueJobs = jobRepository.findJobsDueForExecution(now);

        for (JobDefinition job : dueJobs) {
            // Create job execution record
            JobExecution execution = new JobExecution(job.getId(), job.getName());
            execution.setStatus(ExecutionStatus.PENDING);
            JobExecution savedExecution = executionRepository.save(execution);

            logRepository.save(new ExecutionLog(savedExecution.getId(), job.getId(), "LEADER", LogLevel.INFO,
                    "Job trigger fired for [" + job.getName() + "]. Queued execution #" + savedExecution.getId()));

            // Update job definition schedule times
            job.setLastRunAt(now);
            LocalDateTime nextRun = scheduleCalculator.calculateNextRunTime(job, now);
            job.setNextRunAt(nextRun);
            if (job.getType() == JobType.ONE_TIME) {
                job.setStatus(JobStatus.COMPLETED);
            }
            jobRepository.save(job);
        }
    }

    @Transactional
    public JobExecution triggerManualExecution(Long jobId) {
        JobDefinition job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found with ID: " + jobId));

        JobExecution execution = new JobExecution(job.getId(), job.getName());
        execution.setStatus(ExecutionStatus.PENDING);
        JobExecution savedExecution = executionRepository.save(execution);

        logRepository.save(new ExecutionLog(savedExecution.getId(), job.getId(), "LEADER", LogLevel.INFO,
                "Manual execution requested for job [" + job.getName() + "]. Created execution #" + savedExecution.getId()));

        return savedExecution;
    }
}
