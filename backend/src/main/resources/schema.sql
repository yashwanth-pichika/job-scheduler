-- Development/initialization schema for Distributed Job Scheduler
-- This mirrors db/migration/V1__Initial_Schema.sql and is used when
-- Flyway is disabled (e.g. local development with spring.sql.init.mode=always).

CREATE TABLE IF NOT EXISTS job_definitions (
    id                BIGSERIAL PRIMARY KEY,
    name              VARCHAR(255) NOT NULL,
    description       VARCHAR(1000),
    type              VARCHAR(50) NOT NULL,
    cron_expression   VARCHAR(255),
    interval_seconds  BIGINT,
    payload           TEXT,
    status            VARCHAR(50) NOT NULL,
    priority          INTEGER NOT NULL DEFAULT 5,
    max_retries       INTEGER NOT NULL DEFAULT 3,
    timeout_seconds   INTEGER NOT NULL DEFAULT 60,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    next_run_at       TIMESTAMP,
    last_run_at       TIMESTAMP,
    CONSTRAINT uk_job_definitions_name UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS job_executions (
    id              BIGSERIAL PRIMARY KEY,
    job_id          BIGINT NOT NULL,
    job_name        VARCHAR(255),
    worker_node_id  VARCHAR(255),
    status          VARCHAR(50) NOT NULL,
    retry_count     INTEGER NOT NULL DEFAULT 0,
    start_time      TIMESTAMP,
    end_time        TIMESTAMP,
    duration_ms     BIGINT,
    error_message   TEXT,
    result          TEXT,
    CONSTRAINT fk_job_executions_job_id
        FOREIGN KEY (job_id) REFERENCES job_definitions (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS execution_logs (
    id            BIGSERIAL PRIMARY KEY,
    execution_id  BIGINT,
    job_id        BIGINT,
    node_id       VARCHAR(255),
    level         VARCHAR(50) NOT NULL DEFAULT 'INFO',
    message       TEXT NOT NULL,
    timestamp     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_execution_logs_execution_id
        FOREIGN KEY (execution_id) REFERENCES job_executions (id) ON DELETE CASCADE,
    CONSTRAINT fk_execution_logs_job_id
        FOREIGN KEY (job_id) REFERENCES job_definitions (id) ON DELETE CASCADE
);

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

CREATE INDEX IF NOT EXISTS idx_job_definitions_status_next_run_at ON job_definitions (status, next_run_at);
CREATE INDEX IF NOT EXISTS idx_job_executions_job_id_status_start_time ON job_executions (job_id, status, start_time);
CREATE INDEX IF NOT EXISTS idx_execution_logs_execution_id_job_id_timestamp ON execution_logs (execution_id, job_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_cluster_nodes_status ON cluster_nodes (status);
