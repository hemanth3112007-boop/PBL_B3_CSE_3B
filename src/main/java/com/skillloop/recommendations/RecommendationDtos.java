package com.skillloop.recommendations;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class RecommendationDtos {

    public static class CreateRecommendationRequest {
        @NotNull(message = "Course ID is required")
        private Long courseId;

        private Long skillGapAnalysisId;

        @NotBlank(message = "Title is required")
        private String title;

        @NotNull(message = "Action type is required")
        private CourseRecommendation.RecommendationActionType actionType;

        private String justification;
        private String suggestedTopics;
        private String targetCohort;
        private String hypothesisNote;

        public CreateRecommendationRequest() {}

        public Long getCourseId() {
            return courseId;
        }

        public void setCourseId(Long courseId) {
            this.courseId = courseId;
        }

        public Long getSkillGapAnalysisId() {
            return skillGapAnalysisId;
        }

        public void setSkillGapAnalysisId(Long skillGapAnalysisId) {
            this.skillGapAnalysisId = skillGapAnalysisId;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public CourseRecommendation.RecommendationActionType getActionType() {
            return actionType;
        }

        public void setActionType(CourseRecommendation.RecommendationActionType actionType) {
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

        public String getHypothesisNote() {
            return hypothesisNote;
        }

        public void setHypothesisNote(String hypothesisNote) {
            this.hypothesisNote = hypothesisNote;
        }
    }

    public static class UpdateStatusRequest {
        @NotNull(message = "Status is required")
        private CourseRecommendation.RecommendationStatus status;

        private String reviewedBy;

        public UpdateStatusRequest() {}

        public CourseRecommendation.RecommendationStatus getStatus() {
            return status;
        }

        public void setStatus(CourseRecommendation.RecommendationStatus status) {
            this.status = status;
        }

        public String getReviewedBy() {
            return reviewedBy;
        }

        public void setReviewedBy(String reviewedBy) {
            this.reviewedBy = reviewedBy;
        }
    }

    public static class RecordCohortResultRequest {
        @NotBlank(message = "Measured outcome result is required")
        private String measuredOutcomeResult;

        public RecordCohortResultRequest() {}

        public RecordCohortResultRequest(String measuredOutcomeResult) {
            this.measuredOutcomeResult = measuredOutcomeResult;
        }

        public String getMeasuredOutcomeResult() {
            return measuredOutcomeResult;
        }

        public void setMeasuredOutcomeResult(String measuredOutcomeResult) {
            this.measuredOutcomeResult = measuredOutcomeResult;
        }
    }
}

