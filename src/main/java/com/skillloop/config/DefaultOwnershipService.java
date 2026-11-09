package com.skillloop.config;

import com.skillloop.auth.Role;
import com.skillloop.auth.User;
import com.skillloop.auth.UserRepository;
import com.skillloop.common.ResourceNotFoundException;
import com.skillloop.training.Trainee;
import com.skillloop.training.TraineeRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class DefaultOwnershipService implements OwnershipService {

    private final TraineeRepository traineeRepository;
    private final UserRepository userRepository;

    public DefaultOwnershipService(TraineeRepository traineeRepository, UserRepository userRepository) {
        this.traineeRepository = traineeRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void verifyTraineeOwnership(Authentication authentication, Long traineeId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("User must be authenticated");
        }

        // 1. Admins and staff have institution-wide access (check authorities)
        boolean isStaffOrAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_ADMIN")
                        || a.getAuthority().equalsIgnoreCase("ROLE_INSTITUTE_STAFF")
                        || a.getAuthority().equalsIgnoreCase("ADMIN")
                        || a.getAuthority().equalsIgnoreCase("INSTITUTE_STAFF"));
        if (isStaffOrAdmin) {
            return;
        }

        // 2. Trainee role must match the explicit user_id linked to the trainee record
        Object principal = authentication.getPrincipal();
        User authenticatedUser = null;

        if (principal instanceof User user) {
            if (user.getRole() == Role.ADMIN || user.getRole() == Role.INSTITUTE_STAFF) {
                return;
            }
            authenticatedUser = user;
        } else if (principal instanceof UserDetails userDetails) {
            authenticatedUser = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
        } else if (principal instanceof String principalString) {
            authenticatedUser = userRepository.findByUsername(principalString).orElse(null);
        }

        if (authenticatedUser != null) {
            Trainee trainee = traineeRepository.findById(traineeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Trainee not found with id: " + traineeId));

            if (trainee.getUser() != null && trainee.getUser().getId().equals(authenticatedUser.getId())) {
                return;
            }
            throw new AccessDeniedException("Access denied: You do not have permission to access another trainee's data");
        }

        throw new AccessDeniedException("Access denied: Insufficient privileges or unlinked trainee account");
    }

    @Override
    public Long resolveAuthenticatedTraineeId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("User must be authenticated");
        }

        Object principal = authentication.getPrincipal();
        Long userId = null;
        String username = null;

        if (principal instanceof User user) {
            userId = user.getId();
        } else if (principal instanceof UserDetails userDetails) {
            username = userDetails.getUsername();
        } else if (principal instanceof String principalString) {
            username = principalString;
        }

        if (userId == null && username != null) {
            userId = userRepository.findByUsername(username).map(User::getId).orElse(null);
        }

        if (userId != null) {
            return traineeRepository.findByUserId(userId)
                    .map(Trainee::getId)
                    .orElseThrow(() -> new ResourceNotFoundException("No trainee profile linked to authenticated user account"));
        }

        throw new AccessDeniedException("Invalid authentication principal");
    }
}
