package com.example.kafka.coursera.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class DeletionTrackingService {

    private final ConcurrentHashMap<UUID, DeletionRequest> pendingDeletions = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<UUID, CompletedDeletion> completedDeletions = new ConcurrentHashMap<>();

    public void addPendingDeletion(UUID schoolId) {
        CompletedDeletion completed = completedDeletions.get(schoolId);
        if (completed != null) {
            log.warn("School {} was already processed recently. Result: canDelete={}, reason={}",
                    schoolId, completed.canDelete, completed.reason);
            return;
        }

        pendingDeletions.put(schoolId, new DeletionRequest());
        log.info("Added pending deletion for school: {}", schoolId);
    }

    public boolean isPendingDeletion(UUID schoolId) {
        return pendingDeletions.containsKey(schoolId);
    }

    public boolean waitForValidationResult(UUID schoolId, long timeoutMs) {
        CompletedDeletion completedResult = completedDeletions.get(schoolId);
        if (completedResult != null) {
            log.info("School {} was already processed. Returning cached result: {}", schoolId,
                    completedResult.canDelete);
            return completedResult.canDelete;
        }

        DeletionRequest request = pendingDeletions.get(schoolId);
        if (request == null) {
            log.error("No pending deletion request found for school: {}", schoolId);
            return false;
        }

        try {
            log.info("Waiting for validation result for school: {} (timeout: {}ms)", schoolId, timeoutMs);
            log.info("Current pending deletions: {}", pendingDeletions.keySet());

            boolean completed = request.latch.await(timeoutMs, TimeUnit.MILLISECONDS);

            if (!completed) {
                log.warn("TIMEOUT waiting for deletion validation for school: {}", schoolId);
                log.warn("Final state - canDelete: {}, reason: {}", request.canDelete, request.rejectionReason);
                return false;
            }

            log.info("Validation completed for school: {}, canDelete: {}", schoolId, request.canDelete);
            return request.canDelete;
        } catch (InterruptedException e) {
            log.error("Interrupted while waiting for deletion validation: {}", e.getMessage());
            Thread.currentThread().interrupt();
            return false;
        }
    }

    public void setValidationResult(UUID schoolId, boolean canDelete, String reason) {
        log.info("=== SETTING VALIDATION RESULT ===");
        log.info("School: {}, canDelete: {}, reason: {}", schoolId, canDelete, reason);

        DeletionRequest request = pendingDeletions.get(schoolId);
        if (request != null) {
            request.canDelete = canDelete;
            request.rejectionReason = reason;
            request.latch.countDown();
            log.info("Successfully set validation result and released latch for school: {}", schoolId);
        } else {
            log.error("No pending deletion request found when setting result for school: {}", schoolId);
        }
    }

    public String getDeletionRejectionReason(UUID schoolId) {
        // Check completed deletions first
        CompletedDeletion completed = completedDeletions.get(schoolId);
        if (completed != null) {
            return completed.reason != null ? completed.reason : "Already processed";
        }

        DeletionRequest request = pendingDeletions.get(schoolId);
        return request != null ? request.rejectionReason : "Unknown reason";
    }

    public void removePendingDeletion(UUID schoolId) {
        DeletionRequest request = pendingDeletions.remove(schoolId);
        if (request != null) {
            completedDeletions.put(schoolId,
                    new CompletedDeletion(request.canDelete, request.rejectionReason, System.currentTimeMillis()));
            log.info("Removed pending deletion for school: {} and cached result", schoolId);
        } else {
            log.warn("Attempted to remove non-existent pending deletion for school: {}", schoolId);
        }
    }

    public void cleanupCompletedDeletions() {
        long cutoff = System.currentTimeMillis() - TimeUnit.MINUTES.toMillis(5);
        completedDeletions.entrySet().removeIf(entry -> entry.getValue().timestamp < cutoff);
    }

    private static class DeletionRequest {
        final CountDownLatch latch = new CountDownLatch(1);
        boolean canDelete = false;
        String rejectionReason = null;
    }

    private static class CompletedDeletion {
        final boolean canDelete;
        final String reason;
        final long timestamp;

        CompletedDeletion(boolean canDelete, String reason, long timestamp) {
            this.canDelete = canDelete;
            this.reason = reason;
            this.timestamp = timestamp;
        }
    }
}
