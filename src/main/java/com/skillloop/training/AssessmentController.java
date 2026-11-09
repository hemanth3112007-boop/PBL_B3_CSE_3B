package com.skillloop.training;

import com.skillloop.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessments")
@Tag(name = "Assessments & Scoring", description = "Course assessments, score recording, and audited grade corrections")
@SecurityRequirement(name = "bearerAuth")
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(AssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    @GetMapping("/enrollment/{enrollmentId}")
    @Operation(summary = "Get assessments for an enrollment (STAFF/ADMIN or Owner Trainee)")
    public ResponseEntity<ApiResponse<List<Assessment>>> getByEnrollment(
            @PathVariable Long enrollmentId,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(assessmentService.getAssessmentsByEnrollment(enrollmentId, authentication)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get assessment by ID (STAFF/ADMIN or Owner Trainee)")
    public ResponseEntity<ApiResponse<Assessment>> getById(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(assessmentService.getAssessmentById(id, authentication)));
    }

    @PostMapping
    @Operation(summary = "Record assessment score for an enrollment (STAFF or ADMIN only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    public ResponseEntity<ApiResponse<Assessment>> createAssessment(@Valid @RequestBody TrainingDtos.CreateAssessmentRequest request) {
        Assessment created = assessmentService.createAssessment(request);
        return ResponseEntity.ok(ApiResponse.ok("Assessment score recorded successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Audited score correction for an assessment (STAFF or ADMIN only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    public ResponseEntity<ApiResponse<Assessment>> updateAssessment(
            @PathVariable Long id,
            @Valid @RequestBody TrainingDtos.UpdateAssessmentRequest request) {
        Assessment updated = assessmentService.updateAssessmentScore(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Assessment score updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an assessment record (STAFF or ADMIN only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    public ResponseEntity<ApiResponse<String>> deleteAssessment(@PathVariable Long id) {
        assessmentService.deleteAssessment(id);
        return ResponseEntity.ok(ApiResponse.ok("Assessment deleted successfully", "Assessment ID " + id + " deleted."));
    }
}
