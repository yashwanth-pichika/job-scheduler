package com.scheduler.controller;

import com.scheduler.model.*;
import com.scheduler.repository.ExecutionRepository;
import com.scheduler.repository.JobRepository;
import com.scheduler.repository.LogRepository;
import com.scheduler.service.JobSchedulerEngine;
import com.scheduler.service.ScheduleCalculator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    private final JobRepository jobRepository;
    private final ExecutionRepository executionRepository;
    private final LogRepository logRepository;
    private final JobSchedulerEngine jobSchedulerEngine;
    private final ScheduleCalculator scheduleCalculator;

    public JobController(JobRepository jobRepository,
                         ExecutionRepository executionRepository,
                         LogRepository logRepository,
                         JobSchedulerEngine jobSchedulerEngine,
                         ScheduleCalculator scheduleCalculator) {
        this.jobRepository = jobRepository;
        this.executionRepository = executionRepository;
        this.logRepository = logRepository;
        this.jobSchedulerEngine = jobSchedulerEngine;
        this.scheduleCalculator = scheduleCalculator;
    }

    @GetMapping
    public List<JobDefinition> getAllJobs() {
        return jobRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDefinition> getJobById(@PathVariable Long id) {
        return jobRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody JobDefinition job) {
        if (job.getName() == null || job.getName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Job name is required"));
        }
        if (jobRepository.findByName(job.getName()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Job with name '" + job.getName() + "' already exists"));
        }

        if (job.getType() == JobType.CRON && !scheduleCalculator.isValidCron(job.getCronExpression())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid CRON expression format"));
        }

        LocalDateTime now = LocalDateTime.now();
        job.setCreatedAt(now);
        job.setUpdatedAt(now);
        job.setNextRunAt(scheduleCalculator.calculateNextRunTime(job, now));

        JobDefinition saved = jobRepository.save(job);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @RequestBody JobDefinition updated) {
        return jobRepository.findById(id).map(existing -> {
            existing.setName(updated.getName());
            existing.setDescription(updated.getDescription());
            existing.setType(updated.getType());
            existing.setCronExpression(updated.getCronExpression());
            existing.setIntervalSeconds(updated.getIntervalSeconds());
            existing.setPayload(updated.getPayload());
            existing.setPriority(updated.getPriority());
            existing.setMaxRetries(updated.getMaxRetries());
            existing.setTimeoutSeconds(updated.getTimeoutSeconds());
            existing.setUpdatedAt(LocalDateTime.now());
            existing.setNextRunAt(scheduleCalculator.calculateNextRunTime(existing, LocalDateTime.now()));

            JobDefinition saved = jobRepository.save(existing);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        if (!jobRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        jobRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Job deleted successfully"));
    }

    @PostMapping("/{id}/trigger")
    public ResponseEntity<?> triggerJob(@PathVariable Long id) {
        try {
            JobExecution execution = jobSchedulerEngine.triggerManualExecution(id);
            return ResponseEntity.ok(execution);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleJobStatus(@PathVariable Long id) {
        return jobRepository.findById(id).map(job -> {
            if (job.getStatus() == JobStatus.ACTIVE) {
                job.setStatus(JobStatus.PAUSED);
            } else {
                job.setStatus(JobStatus.ACTIVE);
                job.setNextRunAt(scheduleCalculator.calculateNextRunTime(job, LocalDateTime.now()));
            }
            JobDefinition saved = jobRepository.save(job);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/executions")
    public List<JobExecution> getRecentExecutions() {
        return executionRepository.findTop50ByOrderByIdDesc();
    }

    @GetMapping("/{id}/executions")
    public List<JobExecution> getJobExecutions(@PathVariable Long id) {
        return executionRepository.findByJobIdOrderByIdDesc(id);
    }

    @GetMapping("/executions/{executionId}/logs")
    public List<ExecutionLog> getExecutionLogs(@PathVariable Long executionId) {
        return logRepository.findByExecutionIdOrderByIdAsc(executionId);
    }

    @GetMapping("/logs")
    public List<ExecutionLog> getRecentLogs() {
        return logRepository.findTop100ByOrderByIdDesc();
    }
}
