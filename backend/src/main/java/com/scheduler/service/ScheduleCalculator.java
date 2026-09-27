package com.scheduler.service;

import com.scheduler.model.JobDefinition;
import com.scheduler.model.JobType;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class ScheduleCalculator {

    public LocalDateTime calculateNextRunTime(JobDefinition job, LocalDateTime baseTime) {
        if (job.getType() == JobType.ONE_TIME) {
            return null; // One time jobs do not repeat after execution
        } else if (job.getType() == JobType.INTERVAL) {
            long seconds = job.getIntervalSeconds() != null && job.getIntervalSeconds() > 0 
                ? job.getIntervalSeconds() : 10;
            return baseTime.plusSeconds(seconds);
        } else if (job.getType() == JobType.CRON && job.getCronExpression() != null) {
            try {
                CronExpression cron = CronExpression.parse(job.getCronExpression());
                return cron.next(baseTime);
            } catch (Exception e) {
                // Fallback interval if invalid cron expression
                return baseTime.plusMinutes(1);
            }
        }
        return baseTime.plusSeconds(30);
    }

    public boolean isValidCron(String cronExpression) {
        if (cronExpression == null || cronExpression.isBlank()) return false;
        try {
            CronExpression.parse(cronExpression);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
