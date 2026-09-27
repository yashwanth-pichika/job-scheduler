package com.scheduler.service;

import com.scheduler.model.NodeInfo;
import com.scheduler.model.NodeStatus;
import com.scheduler.repository.NodeRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class HeartbeatService {

    private final NodeRepository nodeRepository;

    @Value("${scheduler.heartbeat-timeout-ms:10000}")
    private long heartbeatTimeoutMs;

    public HeartbeatService(NodeRepository nodeRepository) {
        this.nodeRepository = nodeRepository;
    }

    @Transactional
    public NodeInfo registerNode(String nodeId, String hostname, String ipAddress, int maxThreads, boolean isLeader) {
        Optional<NodeInfo> existing = nodeRepository.findById(nodeId);
        NodeInfo node;
        if (existing.isPresent()) {
            node = existing.get();
            node.setStatus(NodeStatus.HEALTHY);
            node.setLastHeartbeat(LocalDateTime.now());
            node.setMaxThreads(maxThreads);
            node.setLeader(isLeader);
        } else {
            node = new NodeInfo(nodeId, hostname, ipAddress, maxThreads, isLeader);
        }
        return nodeRepository.save(node);
    }

    @Transactional
    public NodeInfo sendHeartbeat(String nodeId, int activeThreads, double cpuLoad, double memoryUsageMb) {
        Optional<NodeInfo> optionalNode = nodeRepository.findById(nodeId);
        if (optionalNode.isPresent()) {
            NodeInfo node = optionalNode.get();
            if (node.getStatus() != NodeStatus.DEAD) {
                node.setLastHeartbeat(LocalDateTime.now());
                node.setStatus(NodeStatus.HEALTHY);
                node.setActiveThreads(activeThreads);
                node.setCpuLoad(cpuLoad);
                node.setMemoryUsageMb(memoryUsageMb);
                return nodeRepository.save(node);
            }
        }
        return null;
    }

    public List<NodeInfo> getHealthyNodes() {
        return nodeRepository.findByStatus(NodeStatus.HEALTHY);
    }

    public List<NodeInfo> getAllNodes() {
        return nodeRepository.findAll();
    }

    @Scheduled(fixedRate = 3000)
    @Transactional
    public void checkNodeHealth() {
        LocalDateTime cutoff = LocalDateTime.now().minusNanos(heartbeatTimeoutMs * 1_000_000);
        List<NodeInfo> inactiveNodes = nodeRepository.findByLastHeartbeatBefore(cutoff);

        for (NodeInfo node : inactiveNodes) {
            if (node.getStatus() == NodeStatus.HEALTHY) {
                node.setStatus(NodeStatus.SUSPECT);
                nodeRepository.save(node);
            } else if (node.getStatus() == NodeStatus.SUSPECT) {
                // If suspect for more than 1 timeout cycle, mark DEAD
                LocalDateTime deadCutoff = cutoff.minusNanos(heartbeatTimeoutMs * 1_000_000);
                if (node.getLastHeartbeat().isBefore(deadCutoff)) {
                    node.setStatus(NodeStatus.DEAD);
                    node.setActiveThreads(0);
                    nodeRepository.save(node);
                }
            }
        }
    }

    @Transactional
    public void markNodeDead(String nodeId) {
        nodeRepository.findById(nodeId).ifPresent(node -> {
            node.setStatus(NodeStatus.DEAD);
            node.setActiveThreads(0);
            nodeRepository.save(node);
        });
    }

    @Transactional
    public void deleteNode(String nodeId) {
        nodeRepository.deleteById(nodeId);
    }
}
