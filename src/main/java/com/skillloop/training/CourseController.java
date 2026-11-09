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
@RequestMapping("/api/courses")
@Tag(name = "Courses & Training Programmes", description = "Course management, curricula, duration, and provider allocations")
@SecurityRequirement(name = "bearerAuth")
public class CourseController {

    private final CourseService courseService;
    private final BatchService batchService;

    public CourseController(CourseService courseService, BatchService batchService) {
        this.courseService = courseService;
        this.batchService = batchService;
    }

    @GetMapping
    @Operation(summary = "Get list of active training courses (All authenticated users)")
    public ResponseEntity<ApiResponse<List<Course>>> getAllCourses(
            @RequestParam(required = false, defaultValue = "false") boolean includeInactive) {
        return ResponseEntity.ok(ApiResponse.ok(courseService.getAllCourses(includeInactive)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get course details by ID (All authenticated users)")
    public ResponseEntity<ApiResponse<Course>> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(courseService.getCourseById(id)));
    }

    @GetMapping("/sector/{sector}")
    @Operation(summary = "Get courses filtered by domain sector (All authenticated users)")
    public ResponseEntity<ApiResponse<List<Course>>> getCoursesBySector(@PathVariable String sector) {
        return ResponseEntity.ok(ApiResponse.ok(courseService.getCoursesByDomainSector(sector)));
    }

    @PostMapping
    @Operation(summary = "Create a new course (STAFF or ADMIN only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    public ResponseEntity<ApiResponse<Course>> createCourse(@Valid @RequestBody TrainingDtos.CreateCourseRequest request) {
        Course created = courseService.createCourse(request);
        return ResponseEntity.ok(ApiResponse.ok("Course created successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update course details (STAFF or ADMIN only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    public ResponseEntity<ApiResponse<Course>> updateCourse(@PathVariable Long id, @RequestBody TrainingDtos.UpdateCourseRequest request) {
        Course updated = courseService.updateCourse(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Course updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft deactivation of course (STAFF or ADMIN only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    public ResponseEntity<ApiResponse<String>> deactivateCourse(@PathVariable Long id) {
        courseService.deactivateCourse(id);
        return ResponseEntity.ok(ApiResponse.ok("Course deactivated successfully", "Course ID " + id + " marked as inactive."));
    }

    @GetMapping("/{id}/batches")
    @Operation(summary = "Get active batches for a specific course (All authenticated users)")
    public ResponseEntity<ApiResponse<List<Batch>>> getBatchesByCourse(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(courseService.getBatchesByCourse(id)));
    }

    @PostMapping("/{id}/batches")
    @Operation(summary = "Create a new batch for a course (STAFF or ADMIN only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    public ResponseEntity<ApiResponse<Batch>> createBatchForCourse(
            @PathVariable Long id,
            @Valid @RequestBody TrainingDtos.CreateBatchRequest request) {
        request.setCourseId(id);
        Batch created = batchService.createBatch(request);
        return ResponseEntity.ok(ApiResponse.ok("Batch created successfully", created));
    }
}
