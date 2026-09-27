package com.scheduler.service;

import com.scheduler.model.*;
import com.scheduler.repository.ExecutionRepository;
import com.scheduler.repository.LogRepository;
import com.scheduler.repository.NodeRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FailoverManager {

    private final ExecutionRepository executionRepository;
    private final NodeRepository nodeRepository;
    private final LogRepository logRepository;

    public FailoverManager(ExecutionRepository executionRepository,
                           NodeRepository nodeRepository,
                           LogRepository logRepository) {
        this.executionRepository = executionRepository;
        this.nodeRepository = nodeRepository;
        this.logRepository = logRepository;
    }

    @Scheduled(fixedRateString = "${scheduler.failover-check-ms:5000}")
    @Transactional
    public void detectAndRecoverOrphanedJobs() {
        List<NodeInfo> deadNodes = nodeRepository.findByStatus(NodeStatus.DEAD);
        List<ExecutionStatus> activeStatuses = List.of(ExecutionStatus.DISPATCHED, ExecutionStatus.RUNNING);

        for (NodeInfo deadNode : deadNodes) {
            List<JobExecution> orphanedExecutions = executionRepository
                    .findByWorkerNodeIdAndStatusIn(deadNode.getNodeId(), activeStatuses);

            for (JobExecution execution : orphanedExecutions) {
                logRepository.save(new ExecutionLog(execution.getId(), execution.getJobId(), "FAILOVER_MANAGER", LogLevel.WARN,
                        "CRITICAL: Worker node [" + deadNode.getNodeId() + "] declared DEAD. Recovering orphaned execution #" + execution.getId()));

                execution.setStatus(ExecutionStatus.PENDING);
                execution.setWorkerNodeId(null);
                execution.setErrorMessage("Rescheduled due to node crash failover on " + deadNode.getNodeId());
                executionRepository.save(execution);
            }
        }
    }
}
