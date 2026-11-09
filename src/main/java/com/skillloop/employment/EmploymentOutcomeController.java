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
@RequestMapping("/api/employment")
@Tag(name = "Employment Outcomes", description = "Track trainee employment outcomes, job roles, salary bands, and retention")
public class EmploymentOutcomeController {

    private final EmploymentOutcomeService outcomeService;
    private final OwnershipService ownershipService;

    public EmploymentOutcomeController(EmploymentOutcomeService outcomeService, OwnershipService ownershipService) {
        this.outcomeService = outcomeService;
        this.ownershipService = ownershipService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    @Operation(summary = "Get all employment outcomes, optionally filtered by status or course")
    public ResponseEntity<ApiResponse<List<EmploymentOutcome>>> getAllOutcomes(
            @RequestParam(required = false) EmploymentEnums.EmploymentStatus status,
            @RequestParam(required = false) Long courseId) {
        List<EmploymentOutcome> outcomes = outcomeService.getAllOutcomes(status, courseId);
        return ResponseEntity.ok(ApiResponse.ok(outcomes));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get employment outcome details by ID")
    public ResponseEntity<ApiResponse<EmploymentOutcome>> getOutcomeById(@PathVariable Long id, Authentication authentication) {
        EmploymentOutcome outcome = outcomeService.getOutcomeById(id);
        if (authentication != null && outcome.getTrainee() != null) {
            ownershipService.verifyTraineeOwnership(authentication, outcome.getTrainee().getId());
        }
        return ResponseEntity.ok(ApiResponse.ok(outcome));
    }

    @GetMapping("/trainee/{traineeId}")
    @Operation(summary = "Get employment history and outcomes for a specific trainee")
    public ResponseEntity<ApiResponse<List<EmploymentOutcome>>> getOutcomesByTrainee(@PathVariable Long traineeId, Authentication authentication) {
        if (authentication != null) {
            ownershipService.verifyTraineeOwnership(authentication, traineeId);
        }
        List<EmploymentOutcome> outcomes = outcomeService.getOutcomesByTrainee(traineeId);
        return ResponseEntity.ok(ApiResponse.ok(outcomes));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    @Operation(summary = "Record a new employment outcome for a trainee")
    public ResponseEntity<ApiResponse<EmploymentOutcome>> recordOutcome(@Valid @RequestBody EmploymentDtos.CreateEmploymentOutcomeRequest request) {
        EmploymentOutcome created = outcomeService.recordOutcome(request);
        return ResponseEntity.ok(ApiResponse.ok("Employment outcome recorded successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    @Operation(summary = "Update an existing employment outcome")
    public ResponseEntity<ApiResponse<EmploymentOutcome>> updateOutcome(
            @PathVariable Long id,
            @RequestBody EmploymentDtos.UpdateEmploymentOutcomeRequest request) {
        EmploymentOutcome updated = outcomeService.updateOutcome(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Employment outcome updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    @Operation(summary = "Delete an employment outcome record")
    public ResponseEntity<ApiResponse<Void>> deleteOutcome(@PathVariable Long id) {
        outcomeService.deleteOutcome(id);
        return ResponseEntity.ok(ApiResponse.ok("Outcome deleted successfully", null));
    }
}
