package com.skillloop.analytics;

import java.util.List;
import java.util.Map;

public class AnalyticsDtos {

    public static class OverviewMetrics {
        private long totalTrainees;
        private long totalCompleted;
        private long totalEmployed;
        private long totalSelfEmployed;
        private long totalApprenticeship;
        private long totalFurtherEducation;
        private long totalUnemployed;
        private long totalOutcomeUnknown;
        private double positiveOutcomeRate; // (employed + selfEmployed + apprenticeship) / knownOutcomes * 100
        private double rawPlacementRate;      // positive / totalCompleted * 100
        private double verificationRate;      // verified / totalOutcomes * 100
        private long activeCoursesCount;
        private long activeJobOpeningsCount;
        private long totalRecommendationsCount;

        public OverviewMetrics() {}

        public long getTotalTrainees() {
            return totalTrainees;
        }

        public void setTotalTrainees(long totalTrainees) {
            this.totalTrainees = totalTrainees;
        }

        public long getTotalCompleted() {
            return totalCompleted;
        }

        public void setTotalCompleted(long totalCompleted) {
            this.totalCompleted = totalCompleted;
        }

        public long getTotalEmployed() {
            return totalEmployed;
        }

        public void setTotalEmployed(long totalEmployed) {
            this.totalEmployed = totalEmployed;
        }

        public long getTotalSelfEmployed() {
            return totalSelfEmployed;
        }

        public void setTotalSelfEmployed(long totalSelfEmployed) {
            this.totalSelfEmployed = totalSelfEmployed;
        }

        public long getTotalApprenticeship() {
            return totalApprenticeship;
        }

        public void setTotalApprenticeship(long totalApprenticeship) {
            this.totalApprenticeship = totalApprenticeship;
        }

        public long getTotalFurtherEducation() {
            return totalFurtherEducation;
        }

        public void setTotalFurtherEducation(long totalFurtherEducation) {
            this.totalFurtherEducation = totalFurtherEducation;
        }

        public long getTotalUnemployed() {
            return totalUnemployed;
        }

        public void setTotalUnemployed(long totalUnemployed) {
            this.totalUnemployed = totalUnemployed;
        }

        public long getTotalOutcomeUnknown() {
            return totalOutcomeUnknown;
        }

        public void setTotalOutcomeUnknown(long totalOutcomeUnknown) {
            this.totalOutcomeUnknown = totalOutcomeUnknown;
        }

        public double getPositiveOutcomeRate() {
            return positiveOutcomeRate;
        }

        public void setPositiveOutcomeRate(double positiveOutcomeRate) {
            this.positiveOutcomeRate = positiveOutcomeRate;
        }

        public double getRawPlacementRate() {
            return rawPlacementRate;
        }

        public void setRawPlacementRate(double rawPlacementRate) {
            this.rawPlacementRate = rawPlacementRate;
        }

        public double getVerificationRate() {
            return verificationRate;
        }

        public void setVerificationRate(double verificationRate) {
            this.verificationRate = verificationRate;
        }

        public long getActiveCoursesCount() {
            return activeCoursesCount;
        }

        public void setActiveCoursesCount(long activeCoursesCount) {
            this.activeCoursesCount = activeCoursesCount;
        }

        public long getActiveJobOpeningsCount() {
            return activeJobOpeningsCount;
        }

        public void setActiveJobOpeningsCount(long activeJobOpeningsCount) {
            this.activeJobOpeningsCount = activeJobOpeningsCount;
        }

        public long getTotalRecommendationsCount() {
            return totalRecommendationsCount;
        }

        public void setTotalRecommendationsCount(long totalRecommendationsCount) {
            this.totalRecommendationsCount = totalRecommendationsCount;
        }
    }

    public static class LongitudinalMilestoneMetric {
        private String milestone; // Month 3, Month 6, Month 12
        private long totalFollowedUp;
        private long stillEmployed;
        private long promoted;
        private long changedJob;
        private long leftJob;
        private long outcomeUnknown;
        private double retentionRate; // (stillEmployed + promoted + changedJob) / (total - unknown) * 100

        public LongitudinalMilestoneMetric() {}

        public LongitudinalMilestoneMetric(String milestone, long totalFollowedUp, long stillEmployed,
                                           long promoted, long changedJob, long leftJob, long outcomeUnknown, double retentionRate) {
            this.milestone = milestone;
            this.totalFollowedUp = totalFollowedUp;
            this.stillEmployed = stillEmployed;
            this.promoted = promoted;
            this.changedJob = changedJob;
            this.leftJob = leftJob;
            this.outcomeUnknown = outcomeUnknown;
            this.retentionRate = retentionRate;
        }

        public String getMilestone() {
            return milestone;
        }

        public long getTotalFollowedUp() {
            return totalFollowedUp;
        }

        public long getStillEmployed() {
            return stillEmployed;
        }

        public long getPromoted() {
            return promoted;
        }

        public long getChangedJob() {
            return changedJob;
        }

        public long getLeftJob() {
            return leftJob;
        }

        public long getOutcomeUnknown() {
            return outcomeUnknown;
        }

        public double getRetentionRate() {
            return retentionRate;
        }
    }

    public static class SalaryBandMetric {
        private String band;
        private String label;
        private long count;
        private double percentage;

        public SalaryBandMetric() {}

        public SalaryBandMetric(String band, String label, long count, double percentage) {
            this.band = band;
            this.label = label;
            this.count = count;
            this.percentage = percentage;
        }

        public String getBand() {
            return band;
        }

        public String getLabel() {
            return label;
        }

        public long getCount() {
            return count;
        }

        public double getPercentage() {
            return percentage;
        }
    }

    public static class CoursePerformanceMetric {
        private Long courseId;
        private String courseCode;
        private String title;
        private String domainSector;
        private String providerName;
        private String district;
        private long enrolledCount;
        private long completedCount;
        private long employedCount;
        private double employmentRate;
        private double retentionRate;
        private double trainingRelevanceRate;
        private double avgSkillMatchPercentage;
        private String performanceTier; // EXCELLENT, STABLE, NEEDS_CURRICULUM_IMPROVEMENT

        public CoursePerformanceMetric() {}

        public Long getCourseId() {
            return courseId;
        }

        public void setCourseId(Long courseId) {
            this.courseId = courseId;
        }

        public String getCourseCode() {
            return courseCode;
        }

        public void setCourseCode(String courseCode) {
            this.courseCode = courseCode;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDomainSector() {
            return domainSector;
        }

        public void setDomainSector(String domainSector) {
            this.domainSector = domainSector;
        }

        public String getProviderName() {
            return providerName;
        }

        public void setProviderName(String providerName) {
            this.providerName = providerName;
        }

        public String getDistrict() {
            return district;
        }

        public void setDistrict(String district) {
            this.district = district;
        }

        public long getEnrolledCount() {
            return enrolledCount;
        }

        public void setEnrolledCount(long enrolledCount) {
            this.enrolledCount = enrolledCount;
        }

        public long getCompletedCount() {
            return completedCount;
        }

        public void setCompletedCount(long completedCount) {
            this.completedCount = completedCount;
        }

        public long getEmployedCount() {
            return employedCount;
        }

        public void setEmployedCount(long employedCount) {
            this.employedCount = employedCount;
        }

        public double getEmploymentRate() {
            return employmentRate;
        }

        public void setEmploymentRate(double employmentRate) {
            this.employmentRate = employmentRate;
        }

        public double getRetentionRate() {
            return retentionRate;
        }

        public void setRetentionRate(double retentionRate) {
            this.retentionRate = retentionRate;
        }

        public double getTrainingRelevanceRate() {
            return trainingRelevanceRate;
        }

        public void setTrainingRelevanceRate(double trainingRelevanceRate) {
            this.trainingRelevanceRate = trainingRelevanceRate;
        }

        public double getAvgSkillMatchPercentage() {
            return avgSkillMatchPercentage;
        }

        public void setAvgSkillMatchPercentage(double avgSkillMatchPercentage) {
            this.avgSkillMatchPercentage = avgSkillMatchPercentage;
        }

        public String getPerformanceTier() {
            return performanceTier;
        }

        public void setPerformanceTier(String performanceTier) {
            this.performanceTier = performanceTier;
        }
    }

    public static class SkillFrequencyMetric {
        private String skillName;
        private String category;
        private long demandCount;
        private double coveragePercentageInCourses;
        private boolean isCurriculumGap;

        public SkillFrequencyMetric() {}

        public SkillFrequencyMetric(String skillName, String category, long demandCount, double coveragePercentageInCourses, boolean isCurriculumGap) {
            this.skillName = skillName;
            this.category = category;
            this.demandCount = demandCount;
            this.coveragePercentageInCourses = coveragePercentageInCourses;
            this.isCurriculumGap = isCurriculumGap;
        }

        public String getSkillName() {
            return skillName;
        }

        public String getCategory() {
            return category;
        }

        public long getDemandCount() {
            return demandCount;
        }

        public double getCoveragePercentageInCourses() {
            return coveragePercentageInCourses;
        }

        public boolean isCurriculumGap() {
            return isCurriculumGap;
        }
    }

    public static class DistrictOutcomeMetric {
        private String district;
        private long totalTrainees;
        private long employedCount;
        private double employmentRate;

        public DistrictOutcomeMetric() {}

        public DistrictOutcomeMetric(String district, long totalTrainees, long employedCount, double employmentRate) {
            this.district = district;
            this.totalTrainees = totalTrainees;
            this.employedCount = employedCount;
            this.employmentRate = employmentRate;
        }

        public String getDistrict() {
            return district;
        }

        public long getTotalTrainees() {
            return totalTrainees;
        }

        public long getEmployedCount() {
            return employedCount;
        }

        public double getEmploymentRate() {
            return employmentRate;
        }
    }
}

