package com.skillloop.skills;

import com.skillloop.common.ApiResponse;
import com.skillloop.common.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping({"/api/job-requirements", "/api/jobs"})
@Tag(name = "Employer Job Requirements", description = "Employer job postings, demanded skills, and benchmark profiles")
public class JobRequirementController {

    private final JobRequirementRepository jobRepository;
    private final SkillRepository skillRepository;
    private final SkillService skillService;
    private final AiSkillExtractionService aiExtractionService;

    public JobRequirementController(
            JobRequirementRepository jobRepository,
            SkillRepository skillRepository,
            SkillService skillService,
            AiSkillExtractionService aiExtractionService) {
        this.jobRepository = jobRepository;
        this.skillRepository = skillRepository;
        this.skillService = skillService;
        this.aiExtractionService = aiExtractionService;
    }

    @GetMapping
    @Operation(summary = "Get all active employer job requirements")
    public ResponseEntity<ApiResponse<List<JobRequirement>>> getAllJobs(
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) String company) {
        if (industry != null && !industry.isBlank()) {
            return ResponseEntity.ok(ApiResponse.ok(jobRepository.findByIndustrySectorIgnoreCase(industry)));
        }
        if (company != null && !company.isBlank()) {
            return ResponseEntity.ok(ApiResponse.ok(jobRepository.findByCompanyIgnoreCase(company)));
        }
        return ResponseEntity.ok(ApiResponse.ok(jobRepository.findByActiveTrue()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get job requirement by ID")
    public ResponseEntity<ApiResponse<JobRequirement>> getJobById(@PathVariable Long id) {
        JobRequirement job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job requirement not found with id: " + id));
        return ResponseEntity.ok(ApiResponse.ok(job));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF', 'EMPLOYER')")
    @Operation(summary = "Create an employer job requirement, with automatic AI skill extraction from description")
    public ResponseEntity<ApiResponse<JobRequirement>> createJob(@Valid @RequestBody SkillDtos.CreateJobRequirementRequest req) {
        JobRequirement job = new JobRequirement(
                req.getJobTitle(),
                req.getCompany(),
                req.getIndustrySector(),
                req.getLocation(),
                req.getSalaryBand(),
                req.getRawJobDescription()
        );

        Set<Skill> requiredSkills = new HashSet<>();
        if (req.getRequiredSkillIds() != null) {
            for (Long skillId : req.getRequiredSkillIds()) {
                skillRepository.findById(skillId).ifPresent(requiredSkills::add);
            }
        }

        // Also auto-extract skills from description if present
        if (req.getRawJobDescription() != null && !req.getRawJobDescription().isBlank()) {
            List<String> autoExtracted = aiExtractionService.extractSkills(req.getRawJobDescription());
            for (String skillName : autoExtracted) {
                Skill skill = skillService.getOrCreateSkill(skillName, aiExtractionService.categorizeSkill(skillName), null);
                requiredSkills.add(skill);
            }
        }

        job.setRequiredSkills(requiredSkills);
        JobRequirement saved = jobRepository.save(job);
        return ResponseEntity.ok(ApiResponse.ok("Job requirement created successfully", saved));
    }
}
