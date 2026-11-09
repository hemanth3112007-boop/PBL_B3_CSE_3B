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
@RequestMapping("/api/follow-ups")
@Tag(name = "Employment Follow-ups", description = "Longitudinal tracking of trainees at 3, 6, and 12 months")
public class EmploymentFollowUpController {

    private final EmploymentFollowUpService followUpService;
    private final OwnershipService ownershipService;

    public EmploymentFollowUpController(EmploymentFollowUpService followUpService, OwnershipService ownershipService) {
        this.followUpService = followUpService;
        this.ownershipService = ownershipService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    @Operation(summary = "Get all longitudinal follow-up records, optionally filtered by response status")
    public ResponseEntity<ApiResponse<List<EmploymentFollowUp>>> getAllFollowUps(
            @RequestParam(required = false) EmploymentEnums.FollowUpResponseStatus status) {
        List<EmploymentFollowUp> list = followUpService.getAllFollowUps(status);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/trainee/{traineeId}")
    @Operation(summary = "Get longitudinal follow-up timeline (3, 6, 12 months) for a specific trainee")
    public ResponseEntity<ApiResponse<List<EmploymentFollowUp>>> getFollowUpsByTrainee(@PathVariable Long traineeId, Authentication authentication) {
        if (authentication != null) {
            ownershipService.verifyTraineeOwnership(authentication, traineeId);
        }
        List<EmploymentFollowUp> list = followUpService.getFollowUpsByTrainee(traineeId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/milestone/{milestone}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    @Operation(summary = "Get follow-ups for a specific milestone: MONTH_3, MONTH_6, MONTH_12")
    public ResponseEntity<ApiResponse<List<EmploymentFollowUp>>> getFollowUpsByMilestone(@PathVariable EmploymentEnums.FollowUpMilestone milestone) {
        List<EmploymentFollowUp> list = followUpService.getFollowUpsByMilestone(milestone);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/{id}/respond")
    @Operation(summary = "Record response to a longitudinal follow-up (unanswered is marked as OUTCOME_UNKNOWN)")
    public ResponseEntity<ApiResponse<EmploymentFollowUp>> recordResponse(
            @PathVariable Long id,
            @Valid @RequestBody EmploymentDtos.RecordFollowUpResponseRequest request,
            Authentication authentication) {
        EmploymentFollowUp followUp = followUpService.getFollowUpById(id);
        if (authentication != null && followUp.getTrainee() != null) {
            ownershipService.verifyTraineeOwnership(authentication, followUp.getTrainee().getId());
        }
        EmploymentFollowUp updated = followUpService.recordResponse(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Follow-up response recorded successfully", updated));
    }
}
