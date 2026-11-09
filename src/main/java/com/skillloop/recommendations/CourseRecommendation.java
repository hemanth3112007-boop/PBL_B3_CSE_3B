package com.skillloop.recommendations;

import com.skillloop.skills.SkillGapAnalysisResult;
import com.skillloop.training.Course;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_recommendations")
public class CourseRecommendation {

    public enum RecommendationActionType {
        CURRICULUM_UPDATE,
        PRACTICAL_PROJECT,
        INDUSTRY_PARTNERSHIP,
        PEDAGOGY_ENHANCEMENT
    }

    public enum RecommendationStatus {
        PROPOSED,
        UNDER_REVIEW,
        APPROVED,
        REJECTED,
        IMPLEMENTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "analysis_result_id")
    private SkillGapAnalysisResult skillGapAnalysis;

    @Column(nullable = false, length = 180)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RecommendationActionType actionType = RecommendationActionType.CURRICULUM_UPDATE;

    @Column(length = 2000)
    private String justification;

    @Column(length = 1000)
    private String suggestedTopics;

    @Column(length = 60)
    private String targetCohort; // e.g. "Batch 2026-Q4"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RecommendationStatus status = RecommendationStatus.PROPOSED;

    @Column(length = 80)
    private String reviewedBy;

    private LocalDateTime reviewedAt;

    @Column(length = 1500)
    private String hypothesisNote;

    @Column(length = 1500)
    private String measuredOutcomeResult;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public CourseRecommendation() {}

    public CourseRecommendation(Course course, SkillGapAnalysisResult skillGapAnalysis, String title,
                                RecommendationActionType actionType, String justification, String suggestedTopics,
                                String targetCohort, String hypothesisNote) {
        this.course = course;
        this.skillGapAnalysis = skillGapAnalysis;
        this.title = title;
        this.actionType = actionType;
        this.justification = justification;
        this.suggestedTopics = suggestedTopics;
        this.targetCohort = targetCohort;
        this.hypothesisNote = hypothesisNote;
        this.status = RecommendationStatus.PROPOSED;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public SkillGapAnalysisResult getSkillGapAnalysis() {
        return skillGapAnalysis;
    }

    public void setSkillGapAnalysis(SkillGapAnalysisResult skillGapAnalysis) {
        this.skillGapAnalysis = skillGapAnalysis;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public RecommendationActionType getActionType() {
        return actionType;
    }

    public void setActionType(RecommendationActionType actionType) {
        this.actionType = actionType;
    }

    public String getJustification() {
        return justification;
    }

    public void setJustification(String justification) {
        this.justification = justification;
    }

    public String getSuggestedTopics() {
        return suggestedTopics;
    }

    public void setSuggestedTopics(String suggestedTopics) {
        this.suggestedTopics = suggestedTopics;
    }

    public String getTargetCohort() {
        return targetCohort;
    }

    public void setTargetCohort(String targetCohort) {
        this.targetCohort = targetCohort;
    }

    public RecommendationStatus getStatus() {
        return status;
    }

    public void setStatus(RecommendationStatus status) {
        this.status = status;
    }

    public String getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(String reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public String getHypothesisNote() {
        return hypothesisNote;
    }

    public void setHypothesisNote(String hypothesisNote) {
        this.hypothesisNote = hypothesisNote;
    }

    public String getMeasuredOutcomeResult() {
        return measuredOutcomeResult;
    }

    public void setMeasuredOutcomeResult(String measuredOutcomeResult) {
        this.measuredOutcomeResult = measuredOutcomeResult;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

