# Distributed Job Scheduler - Deployment Guide

## Prerequisites
- Docker and Docker Compose installed
- Java 17 or higher (for local development)
- Maven 3.9+ (for local development)
- PostgreSQL 14+ (for production environments)

## Quick Start with Docker Compose

### 1. Start the entire stack
```bash
cd /path/to/job-scheduler
docker-compose up -d
```

This will:
- Start a PostgreSQL 16 database container
- Build and start the Spring Boot application
- Initialize the database schema

### 2. Verify the services are running
```bash
# Check container status
docker-compose ps

# View application logs
docker-compose logs -f job-scheduler-backend

# View database logs
docker-compose logs -f postgres
```

### 3. Access the application
- API Base URL: `http://localhost:8080/api`
- Database: `localhost:5432` (from host machine)

## Configuration

### Environment Variables
Edit `docker-compose.yml` to customize:
- `DB_HOST`: PostgreSQL host (default: postgres)
- `DB_PORT`: PostgreSQL port (default: 5432)
- `DB_NAME`: Database name (default: job_scheduler_db)
- `DB_USER`: Database user (default: job_scheduler_user)
- `DB_PASSWORD`: Database password (CHANGE THIS IN PRODUCTION)
- `SERVER_PORT`: Application port (default: 8080)

### Application Properties
For local development, edit `backend/src/main/resources/application-dev.properties`
For production, edit `backend/src/main/resources/application-prod.properties`

## Database Migration

### Automatic Migration (Development)
With `spring.jpa.hibernate.ddl-auto=create-drop`, Hibernate will automatically:
- Drop existing tables on startup
- Create all tables from entity annotations
- Create indexes and constraints

### Controlled Migration (Production)
With `spring.jpa.hibernate.ddl-auto=validate`, Hibernate will:
- Validate that database schema matches entities
- Fail startup if schema is inconsistent
- Require manual schema changes using SQL scripts or migration tools (Flyway/Liquibase)

## Production Deployment

### 1. Build the Docker image
```bash
docker build -t job-scheduler:1.0.0 ./backend
```

### 2. Push to your registry
```bash
docker tag job-scheduler:1.0.0 your-registry/job-scheduler:1.0.0
docker push your-registry/job-scheduler:1.0.0
```

### 3. Deploy using Docker Compose or Kubernetes

#### Using Docker Compose (Single Server)
```bash
# Update docker-compose.yml with production settings
# Set secure passwords
# Configure volumes for persistence

docker-compose -f docker-compose.yml up -d
```

#### Using Kubernetes
```bash
# Apply manifests in order
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml
kubectl apply -f k8s/app-configmap.yaml
kubectl apply -f k8s/app-secret.yaml
kubectl apply -f k8s/app-deployment.yaml
kubectl apply -f k8s/app-service.yaml
```

## Database Backup and Recovery

### Backup PostgreSQL Database
```bash
# From the PostgreSQL container
docker-compose exec postgres pg_dump -U job_scheduler_user -d job_scheduler_db > backup.sql

# Or from the host (if network accessible)
pg_dump -h localhost -U job_scheduler_user -d job_scheduler_db > backup.sql
```

### Restore PostgreSQL Database
```bash
# From the PostgreSQL container
docker-compose exec postgres psql -U job_scheduler_user -d job_scheduler_db < backup.sql

# Or from the host
psql -h localhost -U job_scheduler_user -d job_scheduler_db < backup.sql
```

## Health Checks

### Application Health Endpoint
```bash
curl http://localhost:8080/api/health
```

### Database Connectivity
```bash
# Check if PostgreSQL is accessible
docker-compose exec postgres pg_isready -U job_scheduler_user
```

## Troubleshooting

### Application fails to start
1. Check application logs: `docker-compose logs job-scheduler-backend`
2. Verify database is running: `docker-compose logs postgres`
3. Ensure database credentials match
4. Check database connectivity

### PostgreSQL connection refused
1. Verify PostgreSQL container is healthy: `docker-compose ps`
2. Wait for healthcheck to pass (30+ seconds)
3. Check firewall rules if using external PostgreSQL
4. Verify connection string in application properties

### OutOfMemory errors
1. Increase Docker memory limits in docker-compose.yml
2. Adjust JVM heap size:
   ```dockerfile
   ENV JAVA_OPTS="-Xmx512m -Xms256m"
   ```

## Stopping the Services

```bash
# Stop containers (preserves data)
docker-compose stop

# Remove containers (data persists in volumes)
docker-compose down

# Remove containers and volumes (data loss)
docker-compose down -v
```

## Performance Tuning

### Connection Pool Configuration
Edit `application.properties`:
```properties
spring.datasource.hikari.maximum-pool-size=20  # Adjust based on load
spring.datasource.hikari.minimum-idle=5
```

### PostgreSQL Configuration
For high-volume deployments, tune PostgreSQL:
```bash
docker-compose exec postgres psql -U postgres -c "ALTER SYSTEM SET max_connections = 200;"
docker-compose restart postgres
```

## Security Considerations

### Production Checklist
- [ ] Change all default passwords
- [ ] Use environment variables for sensitive data
- [ ] Enable SSL/TLS for database connections
- [ ] Configure firewall rules
- [ ] Set up regular backups
- [ ] Enable audit logging
- [ ] Use read-only replicas for backups
- [ ] Implement connection encryption
- [ ] Regular security updates
- [ ] Monitor resource usage

## Additional Resources
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Hibernate ORM Documentation](https://hibernate.org/orm/documentation/)
