package com.scheduler.config;

import com.scheduler.model.JobDefinition;
import com.scheduler.model.JobType;
import com.scheduler.repository.JobRepository;
import com.scheduler.service.HeartbeatService;
import com.scheduler.service.ScheduleCalculator;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final JobRepository jobRepository;
    private final HeartbeatService heartbeatService;
    private final ScheduleCalculator scheduleCalculator;

    public DataInitializer(JobRepository jobRepository,
                           HeartbeatService heartbeatService,
                           ScheduleCalculator scheduleCalculator) {
        this.jobRepository = jobRepository;
        this.heartbeatService = heartbeatService;
        this.scheduleCalculator = scheduleCalculator;
    }

    @Override
    public void run(String... args) throws Exception {
        // Register Leader Coordinator Node
        heartbeatService.registerNode("leader-node", "master-coordinator", "192.168.1.1", 20, true);

        // Seed Sample Jobs if DB is empty
        if (jobRepository.count() == 0) {
            LocalDateTime now = LocalDateTime.now();

            JobDefinition job1 = new JobDefinition(
                    "Database Backup & Sync",
                    "Performs differential backup of application tables and syncs to S3 bucket",
                    JobType.INTERVAL,
                    null,
                    15L,
                    "{\"action\": \"backup\", \"target\": \"s3://scheduler-backups/daily\"}"
            );
            job1.setPriority(9);
            job1.setNextRunAt(scheduleCalculator.calculateNextRunTime(job1, now));
            jobRepository.save(job1);

            JobDefinition job2 = new JobDefinition(
                    "User Activity Metrics Aggregator",
                    "Aggregates hourly user event metrics and pushes report to Kafka topic",
                    JobType.CRON,
                    "0 */1 * * * *", // every minute for demo
                    null,
                    "{\"task\": \"aggregate_metrics\", \"window\": \"1h\"}"
            );
            job2.setPriority(7);
            job2.setNextRunAt(scheduleCalculator.calculateNextRunTime(job2, now));
            jobRepository.save(job2);

            JobDefinition job3 = new JobDefinition(
                    "Payment Webhook Processor",
                    "Dispatches pending payment confirmation webhooks to third-party APIs",
                    JobType.INTERVAL,
                    null,
                    10L,
                    "{\"task\": \"payment_webhooks\", \"retryOnFail\": true}"
            );
            job3.setPriority(10);
            job3.setNextRunAt(scheduleCalculator.calculateNextRunTime(job3, now));
            jobRepository.save(job3);

            JobDefinition job4 = new JobDefinition(
                    "Email Digest Dispatcher",
                    "Compiles user activity summaries and dispatches email batch",
                    JobType.CRON,
                    "0 */5 * * * *", // every 5 minutes
                    null,
                    "{\"task\": \"send_email_digests\", \"batchSize\": 500}"
            );
            job4.setPriority(5);
            job4.setNextRunAt(scheduleCalculator.calculateNextRunTime(job4, now));
            jobRepository.save(job4);
        }
    }
}
