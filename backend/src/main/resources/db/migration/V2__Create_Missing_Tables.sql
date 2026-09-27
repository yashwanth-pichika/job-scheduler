-- Create missing cluster_nodes table if it doesn't exist
CREATE TABLE IF NOT EXISTS cluster_nodes (
    node_id           VARCHAR(255) PRIMARY KEY,
    hostname          VARCHAR(255),
    ip_address        VARCHAR(255),
    status            VARCHAR(50) NOT NULL,
    active_threads    INTEGER NOT NULL DEFAULT 0,
    max_threads       INTEGER NOT NULL DEFAULT 10,
    cpu_load          DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    memory_usage_mb   DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    last_heartbeat    TIMESTAMP,
    registered_at     TIMESTAMP,
    is_leader         BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_cluster_nodes_status ON cluster_nodes (status);
