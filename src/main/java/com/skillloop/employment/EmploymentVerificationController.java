package com.skillloop.employment;

import com.skillloop.common.ApiResponse;
import com.skillloop.config.OwnershipService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/verifications")
@Tag(name = "Employment Verification", description = "Verify employment evidence and display data-quality confidence ratings")
public class EmploymentVerificationController {

    private final EmploymentVerificationService verificationService;
    private final EmploymentOutcomeService outcomeService;
    private final OwnershipService ownershipService;

    public EmploymentVerificationController(
            EmploymentVerificationService verificationService,
            EmploymentOutcomeService outcomeService,
            OwnershipService ownershipService) {
        this.verificationService = verificationService;
        this.outcomeService = outcomeService;
        this.ownershipService = ownershipService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    @Operation(summary = "Get all verification records")
    public ResponseEntity<ApiResponse<List<EmploymentVerification>>> getAllVerifications() {
        return ResponseEntity.ok(ApiResponse.ok(verificationService.getAllVerifications()));
    }

    @GetMapping("/outcome/{outcomeId}")
    @Operation(summary = "Get verifications for a specific employment outcome")
    public ResponseEntity<ApiResponse<List<EmploymentVerification>>> getByOutcome(@PathVariable Long outcomeId, Authentication authentication) {
        EmploymentOutcome outcome = outcomeService.getOutcomeById(outcomeId);
        if (authentication != null && outcome.getTrainee() != null) {
            ownershipService.verifyTraineeOwnership(authentication, outcome.getTrainee().getId());
        }
        return ResponseEntity.ok(ApiResponse.ok(verificationService.getVerificationsByOutcome(outcomeId)));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    @Operation(summary = "Get all pending verification reviews")
    public ResponseEntity<ApiResponse<List<EmploymentVerification>>> getPending() {
        return ResponseEntity.ok(ApiResponse.ok(verificationService.getPendingVerifications()));
    }

    @GetMapping("/conflicts")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    @Operation(summary = "Get all conflicting employment records flagged for audit")
    public ResponseEntity<ApiResponse<List<EmploymentVerification>>> getConflicts() {
        return ResponseEntity.ok(ApiResponse.ok(verificationService.getConflictVerifications()));
    }

    @PostMapping("/outcome/{outcomeId}")
    @Operation(summary = "Submit employment verification evidence (offer letter, payslip, employer confirmation)")
    public ResponseEntity<ApiResponse<EmploymentVerification>> submitEvidence(
            @PathVariable Long outcomeId,
            @Valid @RequestBody EmploymentDtos.SubmitEvidenceRequest request,
            Authentication authentication) {
        EmploymentOutcome outcome = outcomeService.getOutcomeById(outcomeId);
        if (authentication != null && outcome.getTrainee() != null) {
            ownershipService.verifyTraineeOwnership(authentication, outcome.getTrainee().getId());
        }
        EmploymentVerification saved = verificationService.submitEvidence(outcomeId, request);
        return ResponseEntity.ok(ApiResponse.ok("Verification evidence submitted", saved));
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    @Operation(summary = "Review and approve/flag an employment verification record")
    public ResponseEntity<ApiResponse<EmploymentVerification>> review(
            @PathVariable Long id,
            @Valid @RequestBody EmploymentDtos.ReviewVerificationRequest request) {
        EmploymentVerification updated = verificationService.reviewVerification(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Verification reviewed successfully", updated));
    }
}
