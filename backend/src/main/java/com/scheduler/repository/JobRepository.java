package com.scheduler.repository;

import com.scheduler.model.JobDefinition;
import com.scheduler.model.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<JobDefinition, Long> {
    Optional<JobDefinition> findByName(String name);
    List<JobDefinition> findByStatus(JobStatus status);

    @Query("SELECT j FROM JobDefinition j WHERE j.status = 'ACTIVE' AND (j.nextRunAt IS NULL OR j.nextRunAt <= :now)")
    List<JobDefinition> findJobsDueForExecution(LocalDateTime now);
}
