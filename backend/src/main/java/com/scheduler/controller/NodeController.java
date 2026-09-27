package com.scheduler.controller;

import com.scheduler.model.NodeInfo;
import com.scheduler.service.HeartbeatService;
import com.scheduler.service.WorkerSimulationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nodes")
@CrossOrigin(origins = "*")
public class NodeController {

    private final HeartbeatService heartbeatService;
    private final WorkerSimulationService workerSimulationService;

    public NodeController(HeartbeatService heartbeatService, WorkerSimulationService workerSimulationService) {
        this.heartbeatService = heartbeatService;
        this.workerSimulationService = workerSimulationService;
    }

    @GetMapping
    public List<NodeInfo> getAllNodes() {
        return heartbeatService.getAllNodes();
    }

    @PostMapping("/register")
    public ResponseEntity<NodeInfo> registerNode(@RequestBody Map<String, Object> req) {
        String nodeId = (String) req.get("nodeId");
        String hostname = (String) req.getOrDefault("hostname", "localhost");
        String ipAddress = (String) req.getOrDefault("ipAddress", "127.0.0.1");
        int maxThreads = (int) req.getOrDefault("maxThreads", 5);
        boolean isLeader = (boolean) req.getOrDefault("isLeader", false);

        NodeInfo registered = heartbeatService.registerNode(nodeId, hostname, ipAddress, maxThreads, isLeader);
        return ResponseEntity.ok(registered);
    }

    @PostMapping("/{nodeId}/simulate-crash")
    public ResponseEntity<?> simulateCrash(@PathVariable String nodeId) {
        workerSimulationService.stopWorker(nodeId);
        return ResponseEntity.ok(Map.of("message", "Simulated crash for worker node [" + nodeId + "]"));
    }

    @PostMapping("/{nodeId}/spawn")
    public ResponseEntity<?> spawnWorker(@PathVariable String nodeId, @RequestParam(defaultValue = "5") int maxThreads) {
        workerSimulationService.startWorker(nodeId, maxThreads);
        return ResponseEntity.ok(Map.of("message", "Spawned virtual worker node [" + nodeId + "] with " + maxThreads + " max threads"));
    }
}
