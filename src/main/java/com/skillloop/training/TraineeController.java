package com.skillloop.training;

import com.skillloop.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trainees")
@Tag(name = "Trainee Management", description = "Trainee records, demographics, consent-based tracking, and deactivation")
@SecurityRequirement(name = "bearerAuth")
public class TraineeController {

    private final TraineeService traineeService;

    public TraineeController(TraineeService traineeService) {
        this.traineeService = traineeService;
    }

    @GetMapping
    @Operation(summary = "Get list of registered trainees (STAFF or ADMIN only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    public ResponseEntity<ApiResponse<List<Trainee>>> getAllTrainees(
            @RequestParam(required = false, defaultValue = "false") boolean includeInactive) {
        return ResponseEntity.ok(ApiResponse.ok(traineeService.getAllTrainees(includeInactive)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get trainee profile by ID (STAFF/ADMIN or Owner Trainee)")
    public ResponseEntity<ApiResponse<Trainee>> getTraineeById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(traineeService.getTraineeById(id, authentication)));
    }

    @GetMapping("/district/{district}")
    @Operation(summary = "Get trainees filtered by district (STAFF or ADMIN only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    public ResponseEntity<ApiResponse<List<Trainee>>> getTraineesByDistrict(@PathVariable String district) {
        return ResponseEntity.ok(ApiResponse.ok(traineeService.getTraineesByDistrict(district)));
    }

    @PostMapping
    @Operation(summary = "Register a new trainee with consent record (STAFF or ADMIN only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    public ResponseEntity<ApiResponse<Trainee>> registerTrainee(@Valid @RequestBody TrainingDtos.CreateTraineeRequest request) {
        Trainee registered = traineeService.registerTrainee(request);
        return ResponseEntity.ok(ApiResponse.ok("Trainee registered successfully", registered));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update trainee profile (STAFF/ADMIN or Owner Trainee)")
    public ResponseEntity<ApiResponse<Trainee>> updateTrainee(
            @PathVariable Long id,
            @RequestBody TrainingDtos.UpdateTraineeRequest request,
            Authentication authentication) {
        Trainee updated = traineeService.updateTrainee(id, request, authentication);
        return ResponseEntity.ok(ApiResponse.ok("Trainee profile updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft deactivation of trainee record (STAFF or ADMIN only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    public ResponseEntity<ApiResponse<String>> deactivateTrainee(@PathVariable Long id) {
        traineeService.deactivateTrainee(id);
        return ResponseEntity.ok(ApiResponse.ok("Trainee deactivated successfully", "Trainee ID " + id + " marked as inactive."));
    }
}
