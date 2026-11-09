package com.skillloop.analytics;

import com.skillloop.employment.EmploymentEnums;
import com.skillloop.employment.EmploymentFollowUp;
import com.skillloop.employment.EmploymentFollowUpRepository;
import com.skillloop.employment.EmploymentOutcome;
import com.skillloop.employment.EmploymentOutcomeRepository;
import com.skillloop.recommendations.CourseRecommendationRepository;
import com.skillloop.skills.CourseSkill;
import com.skillloop.skills.CourseSkillRepository;
import com.skillloop.skills.JobRequirement;
import com.skillloop.skills.JobRequirementRepository;
import com.skillloop.skills.SkillGapAnalysisRepository;
import com.skillloop.skills.SkillGapAnalysisResult;
import com.skillloop.training.Course;
import com.skillloop.training.CourseRepository;
import com.skillloop.training.Enrollment;
import com.skillloop.training.EnrollmentRepository;
import com.skillloop.training.Trainee;
import com.skillloop.training.TraineeRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final TraineeRepository traineeRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final EmploymentOutcomeRepository outcomeRepository;
    private final EmploymentFollowUpRepository followUpRepository;
    private final CourseSkillRepository courseSkillRepository;
    private final JobRequirementRepository jobRequirementRepository;
    private final SkillGapAnalysisRepository skillGapRepository;
    private final CourseRecommendationRepository recommendationRepository;

    public AnalyticsService(
            TraineeRepository traineeRepository,
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository,
            EmploymentOutcomeRepository outcomeRepository,
            EmploymentFollowUpRepository followUpRepository,
            CourseSkillRepository courseSkillRepository,
            JobRequirementRepository jobRequirementRepository,
            SkillGapAnalysisRepository skillGapRepository,
            CourseRecommendationRepository recommendationRepository) {
        this.traineeRepository = traineeRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.outcomeRepository = outcomeRepository;
        this.followUpRepository = followUpRepository;
        this.courseSkillRepository = courseSkillRepository;
        this.jobRequirementRepository = jobRequirementRepository;
        this.skillGapRepository = skillGapRepository;
        this.recommendationRepository = recommendationRepository;
    }

    public AnalyticsDtos.OverviewMetrics getOverviewMetrics() {
        AnalyticsDtos.OverviewMetrics m = new AnalyticsDtos.OverviewMetrics();

        long totalTrainees = traineeRepository.count();
        List<Enrollment> completedEnrollments = enrollmentRepository.findByStatus(Enrollment.EnrollmentStatus.COMPLETED);
        long totalCompleted = completedEnrollments.size();

        List<EmploymentOutcome> outcomes = outcomeRepository.findAll();

        long employed = outcomes.stream().filter(o -> o.getStatus() == EmploymentEnums.EmploymentStatus.EMPLOYED).count();
        long selfEmployed = outcomes.stream().filter(o -> o.getStatus() == EmploymentEnums.EmploymentStatus.SELF_EMPLOYED).count();
        long apprenticeship = outcomes.stream().filter(o -> o.getStatus() == EmploymentEnums.EmploymentStatus.APPRENTICESHIP).count();
        long furtherEducation = outcomes.stream().filter(o -> o.getStatus() == EmploymentEnums.EmploymentStatus.FURTHER_EDUCATION).count();
        long unemployed = outcomes.stream().filter(o -> o.getStatus() == EmploymentEnums.EmploymentStatus.UNEMPLOYED).count();
        long unknown = outcomes.stream().filter(o -> o.getStatus() == EmploymentEnums.EmploymentStatus.OUTCOME_UNKNOWN).count();

        long positiveOutcomes = employed + selfEmployed + apprenticeship;
        long knownOutcomes = outcomes.size() - unknown;

        double positiveRate = knownOutcomes > 0 ? (double) positiveOutcomes / knownOutcomes * 100.0 : 0.0;
        positiveRate = Math.min(100.0, Math.max(0.0, positiveRate));

        Set<Long> completedTraineeIds = completedEnrollments.stream()
                .map(e -> e.getTrainee().getId())
                .collect(Collectors.toSet());

        long completedWithPositiveOutcome = outcomes.stream()
                .filter(o -> o.getStatus() == EmploymentEnums.EmploymentStatus.EMPLOYED ||
                             o.getStatus() == EmploymentEnums.EmploymentStatus.SELF_EMPLOYED ||
                             o.getStatus() == EmploymentEnums.EmploymentStatus.APPRENTICESHIP)
                .map(o -> o.getTrainee().getId())
                .filter(completedTraineeIds::contains)
                .distinct()
                .count();

        double rawRate = totalCompleted > 0 ? (double) completedWithPositiveOutcome / totalCompleted * 100.0 : 0.0;
        rawRate = Math.min(100.0, Math.max(0.0, rawRate));

        long verifiedCount = outcomes.stream()
                .filter(o -> o.getVerificationStatus() == EmploymentEnums.VerificationStatus.VERIFIED)
                .count();
        double verificationRate = !outcomes.isEmpty() ? (double) verifiedCount / outcomes.size() * 100.0 : 0.0;

        m.setTotalTrainees(totalTrainees);
        m.setTotalCompleted(totalCompleted);
        m.setTotalEmployed(employed);
        m.setTotalSelfEmployed(selfEmployed);
        m.setTotalApprenticeship(apprenticeship);
        m.setTotalFurtherEducation(furtherEducation);
        m.setTotalUnemployed(unemployed);
        m.setTotalOutcomeUnknown(unknown);
        m.setPositiveOutcomeRate(Math.round(positiveRate * 10.0) / 10.0);
        m.setRawPlacementRate(Math.round(rawRate * 10.0) / 10.0);
        m.setVerificationRate(Math.round(verificationRate * 10.0) / 10.0);
        m.setActiveCoursesCount(courseRepository.countByActiveTrue());
        m.setActiveJobOpeningsCount(jobRequirementRepository.countByActiveTrue());
        m.setTotalRecommendationsCount(recommendationRepository.count());

        return m;
    }

    public List<AnalyticsDtos.LongitudinalMilestoneMetric> getLongitudinalMetrics() {
        List<AnalyticsDtos.LongitudinalMilestoneMetric> list = new ArrayList<>();

        for (EmploymentEnums.FollowUpMilestone milestone : EmploymentEnums.FollowUpMilestone.values()) {
            List<EmploymentFollowUp> followUps = followUpRepository.findByMilestone(milestone);

            long total = followUps.size();
            long stillEmployed = followUps.stream().filter(f -> f.getRetentionStatus() == EmploymentEnums.RetentionStatus.STILL_EMPLOYED).count();
            long promoted = followUps.stream().filter(f -> f.getRetentionStatus() == EmploymentEnums.RetentionStatus.PROMOTED).count();
            long changedJob = followUps.stream().filter(f -> f.getRetentionStatus() == EmploymentEnums.RetentionStatus.CHANGED_JOB).count();
            long leftJob = followUps.stream().filter(f -> f.getRetentionStatus() == EmploymentEnums.RetentionStatus.LEFT_JOB || f.getRetentionStatus() == EmploymentEnums.RetentionStatus.TERMINATED).count();
            long pending = followUps.stream().filter(f -> f.getResponseStatus() == EmploymentEnums.FollowUpResponseStatus.PENDING).count();
            long unknown = followUps.stream().filter(f -> f.getResponseStatus() == EmploymentEnums.FollowUpResponseStatus.NO_RESPONSE || f.getReportedStatus() == EmploymentEnums.EmploymentStatus.OUTCOME_UNKNOWN).count();

            long retained = stillEmployed + promoted + changedJob;
            long respondedTotal = total - unknown - pending;
            double retentionRate = respondedTotal > 0 ? (double) retained / respondedTotal * 100.0 : 0.0;
            retentionRate = Math.min(100.0, Math.max(0.0, retentionRate));

            String label = switch (milestone) {
                case MONTH_3 -> "3 Months";
                case MONTH_6 -> "6 Months";
                case MONTH_12 -> "12 Months";
            };

            list.add(new AnalyticsDtos.LongitudinalMilestoneMetric(
                    label, total, stillEmployed, promoted, changedJob, leftJob, unknown, Math.round(retentionRate * 10.0) / 10.0
            ));
        }

        return list;
    }

    public List<AnalyticsDtos.SalaryBandMetric> getSalaryBandDistribution() {
        List<EmploymentOutcome> outcomes = outcomeRepository.findAll();
        long totalWithSalary = outcomes.stream()
                .filter(o -> o.getSalaryBand() != null && o.getSalaryBand() != EmploymentEnums.SalaryBand.UNDISCLOSED)
                .count();

        List<AnalyticsDtos.SalaryBandMetric> list = new ArrayList<>();
        for (EmploymentEnums.SalaryBand band : EmploymentEnums.SalaryBand.values()) {
            if (band == EmploymentEnums.SalaryBand.UNDISCLOSED) continue;

            long count = outcomes.stream().filter(o -> o.getSalaryBand() == band).count();
            double pct = totalWithSalary > 0 ? (double) count / totalWithSalary * 100.0 : 0.0;
            list.add(new AnalyticsDtos.SalaryBandMetric(band.name(), band.getLabel(), count, Math.round(pct * 10.0) / 10.0));
        }
        return list;
    }

    public List<AnalyticsDtos.CoursePerformanceMetric> getCoursePerformance() {
        List<Course> courses = courseRepository.findAll();
        List<AnalyticsDtos.CoursePerformanceMetric> metrics = new ArrayList<>();

        for (Course c : courses) {
            AnalyticsDtos.CoursePerformanceMetric metric = new AnalyticsDtos.CoursePerformanceMetric();
            metric.setCourseId(c.getId());
            metric.setCourseCode(c.getCourseCode());
            metric.setTitle(c.getTitle());
            metric.setDomainSector(c.getDomainSector());
            metric.setProviderName(c.getProviderName());
            metric.setDistrict(c.getDistrict());

            List<Enrollment> enrollments = enrollmentRepository.findByBatchCourseId(c.getId());
            long enrolled = enrollments.size();
            long completed = enrollments.stream().filter(e -> e.getStatus() == Enrollment.EnrollmentStatus.COMPLETED).count();

            List<EmploymentOutcome> outcomes = outcomeRepository.findByCourseId(c.getId());
            long employed = outcomes.stream().filter(o ->
                    o.getStatus() == EmploymentEnums.EmploymentStatus.EMPLOYED ||
                    o.getStatus() == EmploymentEnums.EmploymentStatus.SELF_EMPLOYED ||
                    o.getStatus() == EmploymentEnums.EmploymentStatus.APPRENTICESHIP).count();

            long relevant = outcomes.stream()
                    .filter(o -> o.getStatus() == EmploymentEnums.EmploymentStatus.EMPLOYED ||
                                 o.getStatus() == EmploymentEnums.EmploymentStatus.SELF_EMPLOYED ||
                                 o.getStatus() == EmploymentEnums.EmploymentStatus.APPRENTICESHIP)
                    .filter(o -> o.getJobRelevance() == EmploymentEnums.JobRelevance.HIGHLY_RELEVANT)
                    .count();

            long retained = outcomes.stream()
                    .filter(o -> o.getStatus() == EmploymentEnums.EmploymentStatus.EMPLOYED ||
                                 o.getStatus() == EmploymentEnums.EmploymentStatus.SELF_EMPLOYED ||
                                 o.getStatus() == EmploymentEnums.EmploymentStatus.APPRENTICESHIP)
                    .filter(o -> o.getRetentionStatus() == EmploymentEnums.RetentionStatus.STILL_EMPLOYED ||
                                 o.getRetentionStatus() == EmploymentEnums.RetentionStatus.PROMOTED)
                    .count();

            double employmentRate = completed > 0 ? (double) employed / completed * 100.0 : 0.0;
            double retentionRate = employed > 0 ? (double) retained / employed * 100.0 : 0.0;
            double relevanceRate = employed > 0 ? (double) relevant / employed * 100.0 : 0.0;

            employmentRate = Math.min(100.0, Math.max(0.0, employmentRate));
            retentionRate = Math.min(100.0, Math.max(0.0, retentionRate));
            relevanceRate = Math.min(100.0, Math.max(0.0, relevanceRate));

            List<SkillGapAnalysisResult> analyses = skillGapRepository.findByCourseId(c.getId());
            double avgMatch = !analyses.isEmpty()
                    ? analyses.stream().mapToDouble(SkillGapAnalysisResult::getMatchPercentage).average().orElse(0.0)
                    : 0.0;

            String tier;
            if (employmentRate >= 75.0 && avgMatch >= 75.0) {
                tier = "EXCELLENT";
            } else if (employmentRate >= 55.0) {
                tier = "STABLE";
            } else {
                tier = "NEEDS_CURRICULUM_IMPROVEMENT";
            }

            metric.setEnrolledCount(enrolled);
            metric.setCompletedCount(completed);
            metric.setEmployedCount(employed);
            metric.setEmploymentRate(Math.round(employmentRate * 10.0) / 10.0);
            metric.setRetentionRate(Math.round(retentionRate * 10.0) / 10.0);
            metric.setTrainingRelevanceRate(Math.round(relevanceRate * 10.0) / 10.0);
            metric.setAvgSkillMatchPercentage(Math.round(avgMatch * 10.0) / 10.0);
            metric.setPerformanceTier(tier);

            metrics.add(metric);
        }

        // Sort by employment rate descending
        metrics.sort(Comparator.comparingDouble(AnalyticsDtos.CoursePerformanceMetric::getEmploymentRate).reversed());
        return metrics;
    }

    public List<AnalyticsDtos.SkillFrequencyMetric> getSkillGapSummary() {
        List<JobRequirement> jobs = jobRequirementRepository.findAll();
        List<CourseSkill> allCourseSkills = courseSkillRepository.findAll();
        Set<String> taughtNormalized = allCourseSkills.stream()
                .map(cs -> cs.getSkill().getNormalizedKey())
                .collect(Collectors.toSet());

        long totalCourses = courseRepository.count();

        Map<String, Long> demandCounts = new HashMap<>();
        Map<String, String> skillCategories = new HashMap<>();

        for (JobRequirement job : jobs) {
            for (com.skillloop.skills.Skill s : job.getRequiredSkills()) {
                demandCounts.put(s.getName(), demandCounts.getOrDefault(s.getName(), 0L) + 1);
                skillCategories.put(s.getName(), s.getCategory().name());
            }
        }

        List<AnalyticsDtos.SkillFrequencyMetric> list = new ArrayList<>();
        for (Map.Entry<String, Long> entry : demandCounts.entrySet()) {
            String skillName = entry.getKey();
            long demand = entry.getValue();
            String cat = skillCategories.getOrDefault(skillName, "TECHNICAL");

            long coursesOffering = allCourseSkills.stream()
                    .filter(cs -> cs.getSkill().getName().equalsIgnoreCase(skillName))
                    .map(cs -> cs.getCourse().getId())
                    .distinct()
                    .count();

            double coverage = totalCourses > 0 ? (double) coursesOffering / totalCourses * 100.0 : 0.0;
            boolean isGap = !taughtNormalized.contains(skillName.trim().toLowerCase()) || coverage < 30.0;

            list.add(new AnalyticsDtos.SkillFrequencyMetric(skillName, cat, demand, Math.round(coverage * 10.0) / 10.0, isGap));
        }

        list.sort(Comparator.comparingLong(AnalyticsDtos.SkillFrequencyMetric::getDemandCount).reversed());
        return list;
    }

    public List<AnalyticsDtos.DistrictOutcomeMetric> getDistrictMetrics() {
        List<Trainee> trainees = traineeRepository.findAll();
        Map<String, List<Trainee>> byDistrict = trainees.stream()
                .filter(t -> t.getDistrict() != null && !t.getDistrict().isBlank())
                .collect(Collectors.groupingBy(Trainee::getDistrict));

        List<EmploymentOutcome> allOutcomes = outcomeRepository.findAll();
        List<AnalyticsDtos.DistrictOutcomeMetric> list = new ArrayList<>();

        for (Map.Entry<String, List<Trainee>> entry : byDistrict.entrySet()) {
            String district = entry.getKey();
            List<Trainee> districtTrainees = entry.getValue();
            long count = districtTrainees.size();

            Set<Long> traineeIds = districtTrainees.stream().map(Trainee::getId).collect(Collectors.toSet());
            long employed = allOutcomes.stream()
                    .filter(o -> traineeIds.contains(o.getTrainee().getId()))
                    .filter(o -> o.getStatus() == EmploymentEnums.EmploymentStatus.EMPLOYED ||
                                 o.getStatus() == EmploymentEnums.EmploymentStatus.SELF_EMPLOYED ||
                                 o.getStatus() == EmploymentEnums.EmploymentStatus.APPRENTICESHIP)
                    .count();

            double rate = count > 0 ? (double) employed / count * 100.0 : 0.0;
            list.add(new AnalyticsDtos.DistrictOutcomeMetric(district, count, employed, Math.round(rate * 10.0) / 10.0));
        }

        list.sort(Comparator.comparingDouble(AnalyticsDtos.DistrictOutcomeMetric::getEmploymentRate).reversed());
        return list;
    }
}
