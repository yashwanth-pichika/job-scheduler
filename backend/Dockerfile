# Multi-stage build for optimized image size
FROM maven:3.9.3-eclipse-temurin-17 AS builder

WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline

COPY src/ ./src/
RUN mvn clean package -DskipTests

# Final stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create logs directory
RUN mkdir -p /app/logs

# Copy the built jar from builder stage
COPY --from=builder /app/target/distributed-job-scheduler-1.0.0.jar app.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD java -cp app.jar org.springframework.boot.loader.JarLauncher -Dspring.profiles.active=prod || exit 1

# Run the application
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
