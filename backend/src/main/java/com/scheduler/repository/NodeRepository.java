package com.scheduler.repository;

import com.scheduler.model.NodeInfo;
import com.scheduler.model.NodeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NodeRepository extends JpaRepository<NodeInfo, String> {
    List<NodeInfo> findByStatus(NodeStatus status);
    List<NodeInfo> findByStatusIn(List<NodeStatus> statuses);
    List<NodeInfo> findByLastHeartbeatBefore(LocalDateTime cutoff);
}
