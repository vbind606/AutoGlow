package com.autoglow.backend.dto;

public class AssignWorkerRequest {

    private Long workerId;

    public AssignWorkerRequest() {
    }

    public Long getWorkerId() {
        return workerId;
    }

    public void setWorkerId(Long workerId) {
        this.workerId = workerId;
    }
}