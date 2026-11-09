package com.skillloop.recommendations;

import com.skillloop.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@Tag(name = "Course Improvement Recommendations", description = "Reviewable curriculum updates, hypothesis testing, and next-cohort outcome comparisons")
@PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
public class CourseRecommendationController {

    private final CourseRecommendationService recommendationService;

    public CourseRecommendationController(CourseRecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping
    @Operation(summary = "Get all recommendations, optionally filtered by course or review status")
    public ResponseEntity<ApiResponse<List<CourseRecommendation>>> getRecommendations(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) CourseRecommendation.RecommendationStatus status) {
        List<CourseRecommendation> list = recommendationService.getRecommendations(courseId, status);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get course recommendation details by ID")
    public ResponseEntity<ApiResponse<CourseRecommendation>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(recommendationService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Propose a new course improvement recommendation based on skill-gap evidence")
    public ResponseEntity<ApiResponse<CourseRecommendation>> createRecommendation(
            @Valid @RequestBody RecommendationDtos.CreateRecommendationRequest request) {
        CourseRecommendation created = recommendationService.createRecommendation(request);
        return ResponseEntity.ok(ApiResponse.ok("Recommendation proposed successfully", created));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update review status (UNDER_REVIEW, APPROVED, REJECTED, IMPLEMENTED)")
    public ResponseEntity<ApiResponse<CourseRecommendation>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody RecommendationDtos.UpdateStatusRequest request,
            Authentication authentication) {
        if ((request.getReviewedBy() == null || request.getReviewedBy().isBlank()) && authentication != null) {
            request.setReviewedBy(authentication.getName());
        }
        CourseRecommendation updated = recommendationService.updateStatus(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Recommendation status updated", updated));
    }

    @PutMapping("/{id}/cohort-result")
    @Operation(summary = "Record measured outcome results in later cohort to test the hypothesis")
    public ResponseEntity<ApiResponse<CourseRecommendation>> recordCohortResult(
            @PathVariable Long id,
            @Valid @RequestBody RecommendationDtos.RecordCohortResultRequest request) {
        CourseRecommendation updated = recommendationService.recordCohortResult(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cohort outcome recorded successfully", updated));
    }
}

