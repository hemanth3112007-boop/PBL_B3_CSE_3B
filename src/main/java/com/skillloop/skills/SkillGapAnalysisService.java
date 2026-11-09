package com.skillloop.skills;

import com.skillloop.common.ResourceNotFoundException;
import com.skillloop.training.Course;
import com.skillloop.training.CourseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SkillGapAnalysisService {

    private final SkillGapAnalysisRepository analysisRepository;
    private final CourseSkillRepository courseSkillRepository;
    private final JobRequirementRepository jobRequirementRepository;
    private final CourseRepository courseRepository;
    private final AiSkillExtractionService aiExtractionService;

    public SkillGapAnalysisService(
            SkillGapAnalysisRepository analysisRepository,
            CourseSkillRepository courseSkillRepository,
            JobRequirementRepository jobRequirementRepository,
            CourseRepository courseRepository,
            AiSkillExtractionService aiExtractionService) {
        this.analysisRepository = analysisRepository;
        this.courseSkillRepository = courseSkillRepository;
        this.jobRequirementRepository = jobRequirementRepository;
        this.courseRepository = courseRepository;
        this.aiExtractionService = aiExtractionService;
    }

    public List<SkillGapAnalysisResult> getResultsByCourse(Long courseId) {
        return analysisRepository.findByCourseId(courseId);
    }

    public List<SkillGapAnalysisResult> getAllResults() {
        return analysisRepository.findAll();
    }

    @Transactional
    public SkillGapAnalysisResult analyzeCourseAgainstJob(Long courseId, Long jobId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        JobRequirement job = jobRequirementRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job requirement not found with id: " + jobId));

        List<CourseSkill> courseSkills = courseSkillRepository.findByCourseId(courseId);
        Set<String> taughtNormalized = courseSkills.stream()
                .map(cs -> cs.getSkill().getNormalizedKey())
                .collect(Collectors.toSet());

        Set<String> matchedSkillNames = new TreeSet<>();
        Set<String> missingSkillNames = new TreeSet<>();

        Set<Skill> required = job.getRequiredSkills();
        if (required.isEmpty()) {
            // If required skills not explicitly populated, extract them on the fly from the raw job description!
            List<String> extracted = aiExtractionService.extractSkills(job.getRawJobDescription());
            for (String s : extracted) {
                if (taughtNormalized.contains(s.trim().toLowerCase())) {
                    matchedSkillNames.add(s);
                } else {
                    missingSkillNames.add(s);
                }
            }
        } else {
            for (Skill r : required) {
                if (taughtNormalized.contains(r.getNormalizedKey())) {
                    matchedSkillNames.add(r.getName());
                } else {
                    missingSkillNames.add(r.getName());
                }
            }
        }

        int totalRequired = matchedSkillNames.size() + missingSkillNames.size();
        double matchPercentage = totalRequired > 0
                ? Math.round(((double) matchedSkillNames.size() / totalRequired) * 1000.0) / 10.0
                : 0.0;

        SkillEnums.SkillMatchLevel matchLevel;
        if (totalRequired == 0) {
            matchLevel = SkillEnums.SkillMatchLevel.CRITICAL_GAP;
        } else if (matchPercentage >= 80.0) {
            matchLevel = SkillEnums.SkillMatchLevel.HIGH_MATCH;
        } else if (matchPercentage >= 50.0) {
            matchLevel = SkillEnums.SkillMatchLevel.MODERATE_MATCH;
        } else {
            matchLevel = SkillEnums.SkillMatchLevel.CRITICAL_GAP;
        }

        String explanation = aiExtractionService.generateSkillGapExplanation(
                course.getTitle(),
                job.getJobTitle(),
                job.getCompany(),
                matchedSkillNames,
                missingSkillNames,
                matchPercentage
        );

        SkillGapAnalysisResult result = analysisRepository.findByCourseIdAndJobRequirementId(courseId, jobId)
                .orElse(new SkillGapAnalysisResult(course, job, matchPercentage,
                        String.join(", ", matchedSkillNames),
                        String.join(", ", missingSkillNames),
                        matchLevel, explanation));

        result.setCourse(course);
        result.setJobRequirement(job);
        result.setMatchPercentage(matchPercentage);
        result.setMatchedSkills(String.join(", ", matchedSkillNames));
        result.setMissingSkills(String.join(", ", missingSkillNames));
        result.setMatchLevel(matchLevel);
        result.setAiExplanation(explanation);
        result.setAnalyzedAt(LocalDateTime.now());

        return analysisRepository.save(result);
    }

    @Transactional
    public List<SkillGapAnalysisResult> analyzeCourseAgainstAllJobs(Long courseId) {
        List<JobRequirement> activeJobs = jobRequirementRepository.findByActiveTrue();
        List<SkillGapAnalysisResult> results = new ArrayList<>();
        for (JobRequirement job : activeJobs) {
            results.add(analyzeCourseAgainstJob(courseId, job.getId()));
        }
        return results;
    }
}
