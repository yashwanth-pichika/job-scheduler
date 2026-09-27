package com.scheduler.repository;

import com.scheduler.model.ExecutionStatus;
import com.scheduler.model.JobExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExecutionRepository extends JpaRepository<JobExecution, Long> {
    List<JobExecution> findByJobIdOrderByIdDesc(Long jobId);
    List<JobExecution> findTop50ByOrderByIdDesc();
    List<JobExecution> findByWorkerNodeIdAndStatusIn(String workerNodeId, List<ExecutionStatus> statuses);
    
    @Query("SELECT COUNT(e) FROM JobExecution e WHERE e.status = :status")
    long countByStatus(ExecutionStatus status);
}
