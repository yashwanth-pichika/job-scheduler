package com.scheduler.model;

public enum ExecutionStatus {
    PENDING,
    DISPATCHED,
    RUNNING,
    SUCCESS,
    FAILED,
    RETRYING,
    CANCELLED
}
