package com.skillloop.skills;

import com.skillloop.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skill-gap")
@Tag(name = "Skill-Gap Analysis", description = "Compare course syllabi against employer requirements and generate AI explanations")
@PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
public class SkillGapController {

    private final SkillGapAnalysisService analysisService;

    public SkillGapController(SkillGapAnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @GetMapping
    @Operation(summary = "Get all completed skill-gap analysis results")
    public ResponseEntity<ApiResponse<List<SkillGapAnalysisResult>>> getAllResults() {
        return ResponseEntity.ok(ApiResponse.ok(analysisService.getAllResults()));
    }

    @GetMapping("/course/{courseId}")
    @Operation(summary = "Get skill-gap analysis results for a specific course")
    public ResponseEntity<ApiResponse<List<SkillGapAnalysisResult>>> getByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.ok(analysisService.getResultsByCourse(courseId)));
    }

    @PostMapping("/analyze/course/{courseId}/job/{jobId}")
    @Operation(summary = "Run AI skill-gap diagnosis between a course and a specific employer job requirement")
    public ResponseEntity<ApiResponse<SkillGapAnalysisResult>> analyzeCourseAndJob(
            @PathVariable Long courseId,
            @PathVariable Long jobId) {
        SkillGapAnalysisResult result = analysisService.analyzeCourseAgainstJob(courseId, jobId);
        return ResponseEntity.ok(ApiResponse.ok("Skill-gap analysis completed", result));
    }

    @PostMapping("/analyze/course/{courseId}/all-jobs")
    @Operation(summary = "Run AI skill-gap diagnosis comparing a course against ALL active employer job postings")
    public ResponseEntity<ApiResponse<List<SkillGapAnalysisResult>>> analyzeAgainstAllJobs(@PathVariable Long courseId) {
        List<SkillGapAnalysisResult> results = analysisService.analyzeCourseAgainstAllJobs(courseId);
        return ResponseEntity.ok(ApiResponse.ok("Comprehensive skill-gap analysis completed", results));
    }
}

