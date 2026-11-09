package com.skillloop.recommendations;

import com.skillloop.common.ResourceNotFoundException;
import com.skillloop.skills.SkillGapAnalysisRepository;
import com.skillloop.skills.SkillGapAnalysisResult;
import com.skillloop.training.Course;
import com.skillloop.training.CourseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CourseRecommendationService {

    private final CourseRecommendationRepository recommendationRepository;
    private final CourseRepository courseRepository;
    private final SkillGapAnalysisRepository analysisRepository;

    public CourseRecommendationService(
            CourseRecommendationRepository recommendationRepository,
            CourseRepository courseRepository,
            SkillGapAnalysisRepository analysisRepository) {
        this.recommendationRepository = recommendationRepository;
        this.courseRepository = courseRepository;
        this.analysisRepository = analysisRepository;
    }

    public List<CourseRecommendation> getRecommendations(Long courseId, CourseRecommendation.RecommendationStatus status) {
        if (courseId != null) {
            return recommendationRepository.findByCourseId(courseId);
        }
        if (status != null) {
            return recommendationRepository.findByStatus(status);
        }
        return recommendationRepository.findAll();
    }

    public CourseRecommendation getById(Long id) {
        return recommendationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course recommendation not found with id: " + id));
    }

    @Transactional
    public CourseRecommendation createRecommendation(RecommendationDtos.CreateRecommendationRequest req) {
        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + req.getCourseId()));

        SkillGapAnalysisResult analysisResult = null;
        if (req.getSkillGapAnalysisId() != null) {
            analysisResult = analysisRepository.findById(req.getSkillGapAnalysisId())
                    .orElseThrow(() -> new ResourceNotFoundException("Skill gap analysis result not found with id: " + req.getSkillGapAnalysisId()));
        }

        CourseRecommendation recommendation = new CourseRecommendation(
                course,
                analysisResult,
                req.getTitle(),
                req.getActionType(),
                req.getJustification(),
                req.getSuggestedTopics(),
                req.getTargetCohort(),
                req.getHypothesisNote()
        );

        return recommendationRepository.save(recommendation);
    }

    @Transactional
    public CourseRecommendation updateStatus(Long id, RecommendationDtos.UpdateStatusRequest req) {
        CourseRecommendation recommendation = getById(id);
        recommendation.setStatus(req.getStatus());
        if (req.getReviewedBy() != null) {
            recommendation.setReviewedBy(req.getReviewedBy());
        }
        recommendation.setReviewedAt(LocalDateTime.now());
        return recommendationRepository.save(recommendation);
    }

    @Transactional
    public CourseRecommendation recordCohortResult(Long id, RecommendationDtos.RecordCohortResultRequest req) {
        CourseRecommendation recommendation = getById(id);
        if (recommendation.getStatus() == CourseRecommendation.RecommendationStatus.REJECTED) {
            throw new IllegalStateException("Cannot record cohort results for a REJECTED recommendation");
        }
        recommendation.setMeasuredOutcomeResult(req.getMeasuredOutcomeResult());
        recommendation.setStatus(CourseRecommendation.RecommendationStatus.IMPLEMENTED);
        return recommendationRepository.save(recommendation);
    }
}
