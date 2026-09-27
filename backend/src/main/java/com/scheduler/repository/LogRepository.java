package com.scheduler.repository;

import com.scheduler.model.ExecutionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LogRepository extends JpaRepository<ExecutionLog, Long> {
    List<ExecutionLog> findByExecutionIdOrderByIdAsc(Long executionId);
    List<ExecutionLog> findTop100ByOrderByIdDesc();
}
