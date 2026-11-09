package com.skillloop.training;

import com.skillloop.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/batches")
@Tag(name = "Batch Management", description = "Training cohort allocations, schedules, trainers, and seat capacity")
@SecurityRequirement(name = "bearerAuth")
public class BatchController {

    private final BatchService batchService;

    public BatchController(BatchService batchService) {
        this.batchService = batchService;
    }

    @GetMapping
    @Operation(summary = "Get list of batches (All authenticated users)")
    public ResponseEntity<ApiResponse<List<Batch>>> getAllBatches(
            @RequestParam(required = false, defaultValue = "false") boolean includeInactive) {
        return ResponseEntity.ok(ApiResponse.ok(batchService.getAllBatches(includeInactive)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get batch by ID (All authenticated users)")
    public ResponseEntity<ApiResponse<Batch>> getBatchById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(batchService.getBatchById(id)));
    }

    @GetMapping("/course/{courseId}")
    @Operation(summary = "Get batches for a specific course (All authenticated users)")
    public ResponseEntity<ApiResponse<List<Batch>>> getBatchesByCourse(
            @PathVariable Long courseId,
            @RequestParam(required = false, defaultValue = "false") boolean includeInactive) {
        return ResponseEntity.ok(ApiResponse.ok(batchService.getBatchesByCourse(courseId, includeInactive)));
    }

    @PostMapping
    @Operation(summary = "Create a new batch (STAFF or ADMIN only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    public ResponseEntity<ApiResponse<Batch>> createBatch(@Valid @RequestBody TrainingDtos.CreateBatchRequest request) {
        Batch created = batchService.createBatch(request);
        return ResponseEntity.ok(ApiResponse.ok("Batch created successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update batch schedule, trainer, or capacity (STAFF or ADMIN only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    public ResponseEntity<ApiResponse<Batch>> updateBatch(@PathVariable Long id, @RequestBody TrainingDtos.UpdateBatchRequest request) {
        Batch updated = batchService.updateBatch(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Batch updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft deactivation of batch (STAFF or ADMIN only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    public ResponseEntity<ApiResponse<String>> deactivateBatch(@PathVariable Long id) {
        batchService.deactivateBatch(id);
        return ResponseEntity.ok(ApiResponse.ok("Batch deactivated successfully", "Batch ID " + id + " marked as inactive."));
    }
}
