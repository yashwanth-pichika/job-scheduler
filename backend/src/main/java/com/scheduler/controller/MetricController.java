package com.scheduler.controller;

import com.scheduler.model.ExecutionStatus;
import com.scheduler.model.JobStatus;
import com.scheduler.model.NodeStatus;
import com.scheduler.repository.ExecutionRepository;
import com.scheduler.repository.JobRepository;
import com.scheduler.repository.NodeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/metrics")
@CrossOrigin(origins = "*")
public class MetricController {

    private final JobRepository jobRepository;
    private final ExecutionRepository executionRepository;
    private final NodeRepository nodeRepository;

    public MetricController(JobRepository jobRepository,
                            ExecutionRepository executionRepository,
                            NodeRepository nodeRepository) {
        this.jobRepository = jobRepository;
        this.executionRepository = executionRepository;
        this.nodeRepository = nodeRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getSystemMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        long totalJobs = jobRepository.count();
        long activeJobs = jobRepository.findByStatus(JobStatus.ACTIVE).size();

        long healthyNodes = nodeRepository.findByStatus(NodeStatus.HEALTHY).size();
        long deadNodes = nodeRepository.findByStatus(NodeStatus.DEAD).size();
        long totalNodes = nodeRepository.count();

        long totalSuccess = executionRepository.countByStatus(ExecutionStatus.SUCCESS);
        long totalFailed = executionRepository.countByStatus(ExecutionStatus.FAILED);
        long totalRunning = executionRepository.countByStatus(ExecutionStatus.RUNNING);
        long totalPending = executionRepository.countByStatus(ExecutionStatus.PENDING);
        long totalExecutions = executionRepository.count();

        double successRate = totalExecutions > 0 ? (double) totalSuccess / totalExecutions * 100.0 : 100.0;

        metrics.put("totalJobs", totalJobs);
        metrics.put("activeJobs", activeJobs);
        metrics.put("healthyNodes", healthyNodes);
        metrics.put("deadNodes", deadNodes);
        metrics.put("totalNodes", totalNodes);
        metrics.put("totalExecutions", totalExecutions);
        metrics.put("successCount", totalSuccess);
        metrics.put("failedCount", totalFailed);
        metrics.put("runningCount", totalRunning);
        metrics.put("pendingCount", totalPending);
        metrics.put("successRate", Math.round(successRate * 10.0) / 10.0);

        return ResponseEntity.ok(metrics);
    }
}
