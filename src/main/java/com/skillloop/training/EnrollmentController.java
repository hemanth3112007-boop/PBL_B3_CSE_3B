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
@RequestMapping("/api/enrollments")
@Tag(name = "Enrollments & Progress", description = "Course enrolments, attendance tracking, and completion progress")
@SecurityRequirement(name = "bearerAuth")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @GetMapping
    @Operation(summary = "Get all enrollment records (STAFF or ADMIN only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    public ResponseEntity<ApiResponse<List<Enrollment>>> getAllEnrollments() {
        return ResponseEntity.ok(ApiResponse.ok(enrollmentService.getAllEnrollments()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get enrollment by ID (STAFF/ADMIN or Owner Trainee)")
    public ResponseEntity<ApiResponse<Enrollment>> getEnrollmentById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(enrollmentService.getEnrollmentById(id, authentication)));
    }

    @GetMapping("/trainee/{traineeId}")
    @Operation(summary = "Get enrolments for a specific trainee (STAFF/ADMIN or Owner Trainee)")
    public ResponseEntity<ApiResponse<List<Enrollment>>> getByTrainee(@PathVariable Long traineeId, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(enrollmentService.getEnrollmentsByTrainee(traineeId, authentication)));
    }

    @GetMapping("/batch/{batchId}")
    @Operation(summary = "Get enrolments for a specific batch (STAFF or ADMIN only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    public ResponseEntity<ApiResponse<List<Enrollment>>> getByBatch(@PathVariable Long batchId) {
        return ResponseEntity.ok(ApiResponse.ok(enrollmentService.getEnrollmentsByBatch(batchId)));
    }

    @PostMapping
    @Operation(summary = "Enrol a trainee into a training batch (STAFF or ADMIN only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    public ResponseEntity<ApiResponse<Enrollment>> enrollTrainee(@Valid @RequestBody TrainingDtos.EnrollTraineeRequest request) {
        Enrollment created = enrollmentService.enrollTrainee(request);
        return ResponseEntity.ok(ApiResponse.ok("Trainee enrolled successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update attendance, progress, or completion status (STAFF or ADMIN only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    public ResponseEntity<ApiResponse<Enrollment>> updateEnrollment(
            @PathVariable Long id,
            @RequestBody TrainingDtos.UpdateEnrollmentRequest request) {
        Enrollment updated = enrollmentService.updateEnrollment(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Enrollment updated successfully", updated));
    }
}
