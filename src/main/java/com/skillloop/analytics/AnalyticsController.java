package com.skillloop.analytics;

import com.skillloop.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Analytics & Reports", description = "Aggregated outcome statistics, longitudinal retention, course rankings, and skill-gap metrics for Recharts dashboards")
@PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    @Operation(summary = "Get high-level summary KPIs (Total trainees, completed, employed, employment rate, verification rate)")
    public ResponseEntity<ApiResponse<AnalyticsDtos.OverviewMetrics>> getOverview() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getOverviewMetrics()));
    }

    @GetMapping("/longitudinal")
    @Operation(summary = "Get longitudinal tracking metrics at 3, 6, and 12 month retention intervals")
    public ResponseEntity<ApiResponse<List<AnalyticsDtos.LongitudinalMilestoneMetric>>> getLongitudinal() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getLongitudinalMetrics()));
    }

    @GetMapping("/salary-bands")
    @Operation(summary = "Get distribution of trainee monthly salaries across standardized salary bands")
    public ResponseEntity<ApiResponse<List<AnalyticsDtos.SalaryBandMetric>>> getSalaryBands() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getSalaryBandDistribution()));
    }

    @GetMapping("/course-performance")
    @Operation(summary = "Compare employment outcomes, retention, training relevance and skill match across all courses")
    public ResponseEntity<ApiResponse<List<AnalyticsDtos.CoursePerformanceMetric>>> getCoursePerformance() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getCoursePerformance()));
    }

    @GetMapping("/skill-gap-summary")
    @Operation(summary = "Identify top demanded skills across employers and highlight curriculum gaps")
    public ResponseEntity<ApiResponse<List<AnalyticsDtos.SkillFrequencyMetric>>> getSkillGapSummary() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getSkillGapSummary()));
    }

    @GetMapping("/districts")
    @Operation(summary = "Compare trainee employment rates across administrative districts")
    public ResponseEntity<ApiResponse<List<AnalyticsDtos.DistrictOutcomeMetric>>> getDistricts() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getDistrictMetrics()));
    }
}

