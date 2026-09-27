-- Initialize PostgreSQL database for Job Scheduler
-- This script runs automatically when the database container starts

-- Create schema
CREATE SCHEMA IF NOT EXISTS public;

-- Ensure extensions are available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO job_scheduler_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO job_scheduler_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO job_scheduler_user;

-- Grant privileges to the application user
GRANT USAGE ON SCHEMA public TO job_scheduler_user;
GRANT CREATE ON SCHEMA public TO job_scheduler_user;
