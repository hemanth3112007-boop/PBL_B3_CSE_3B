package com.skillloop.config;

import org.springframework.security.core.Authentication;

public interface OwnershipService {
    /**
     * Asserts that the authenticated user is an administrator/staff,
     * or the specific trainee matching the given trainee ID.
     */
    void verifyTraineeOwnership(Authentication authentication, Long traineeId);

    /**
     * Resolves the trainee ID associated with the currently authenticated trainee user.
     */
    Long resolveAuthenticatedTraineeId(Authentication authentication);
}
