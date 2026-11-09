package com.skillloop.employment;

import com.skillloop.common.ResourceNotFoundException;
import com.skillloop.training.Course;
import com.skillloop.training.CourseRepository;
import com.skillloop.training.Trainee;
import com.skillloop.training.TraineeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class EmploymentOutcomeService {

    private final EmploymentOutcomeRepository outcomeRepository;
    private final TraineeRepository traineeRepository;
    private final CourseRepository courseRepository;
    private final EmploymentFollowUpService followUpService;

    public EmploymentOutcomeService(
            EmploymentOutcomeRepository outcomeRepository,
            TraineeRepository traineeRepository,
            CourseRepository courseRepository,
            EmploymentFollowUpService followUpService) {
        this.outcomeRepository = outcomeRepository;
        this.traineeRepository = traineeRepository;
        this.courseRepository = courseRepository;
        this.followUpService = followUpService;
    }

    public List<EmploymentOutcome> getAllOutcomes(EmploymentEnums.EmploymentStatus status, Long courseId) {
        if (status != null) {
            return outcomeRepository.findByStatus(status);
        }
        if (courseId != null) {
            return outcomeRepository.findByCourseId(courseId);
        }
        return outcomeRepository.findAll();
    }

    public EmploymentOutcome getOutcomeById(Long id) {
        return outcomeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employment outcome not found with id: " + id));
    }

    public List<EmploymentOutcome> getOutcomesByTrainee(Long traineeId) {
        return outcomeRepository.findByTraineeId(traineeId);
    }

    @Transactional
    public EmploymentOutcome recordOutcome(EmploymentDtos.CreateEmploymentOutcomeRequest req) {
        Trainee trainee = traineeRepository.findById(req.getTraineeId())
                .orElseThrow(() -> new ResourceNotFoundException("Trainee not found with id: " + req.getTraineeId()));

        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + req.getCourseId()));

        EmploymentOutcome outcome = new EmploymentOutcome();
        outcome.setTrainee(trainee);
        outcome.setCourse(course);
        outcome.setStatus(req.getStatus());
        outcome.setJobRole(req.getJobRole());
        outcome.setOrganization(req.getOrganization());
        outcome.setIndustrySector(req.getIndustrySector());
        outcome.setEmploymentType(req.getEmploymentType() != null ? req.getEmploymentType() : EmploymentEnums.EmploymentType.NOT_APPLICABLE);
        outcome.setSalaryBand(req.getSalaryBand() != null ? req.getSalaryBand() : EmploymentEnums.SalaryBand.UNDISCLOSED);
        outcome.setExactMonthlySalary(req.getExactMonthlySalary());
        outcome.setJoiningDate(req.getJoiningDate());

        if (req.getStatus() == EmploymentEnums.EmploymentStatus.UNEMPLOYED) {
            outcome.setRetentionStatus(EmploymentEnums.RetentionStatus.NOT_APPLICABLE);
            outcome.setJobRelevance(EmploymentEnums.JobRelevance.NOT_RELEVANT);
        } else {
            outcome.setRetentionStatus(req.getRetentionStatus() != null ? req.getRetentionStatus() : EmploymentEnums.RetentionStatus.STILL_EMPLOYED);
            outcome.setJobRelevance(req.getJobRelevance() != null ? req.getJobRelevance() : EmploymentEnums.JobRelevance.HIGHLY_RELEVANT);
        }

        outcome.setNotes(req.getNotes());

        // Default verification properties
        outcome.setVerificationSource(EmploymentEnums.VerificationSource.SELF_REPORTED);
        outcome.setVerificationStatus(EmploymentEnums.VerificationStatus.PENDING_REVIEW);
        outcome.setDataQualityLabel(EmploymentEnums.DataQualityLabel.MEDIUM_CONFIDENCE);

        EmploymentOutcome saved = outcomeRepository.save(outcome);

        // Auto-schedule longitudinal 3, 6, 12 month follow-ups
        LocalDate baseDate = req.getJoiningDate() != null ? req.getJoiningDate() : LocalDate.now();
        followUpService.scheduleMilestonesForTrainee(trainee, saved, baseDate);

        return saved;
    }

    @Transactional
    public EmploymentOutcome updateOutcome(Long id, EmploymentDtos.UpdateEmploymentOutcomeRequest req) {
        EmploymentOutcome outcome = getOutcomeById(id);

        if (req.getStatus() != null) outcome.setStatus(req.getStatus());
        if (req.getJobRole() != null) outcome.setJobRole(req.getJobRole());
        if (req.getOrganization() != null) outcome.setOrganization(req.getOrganization());
        if (req.getIndustrySector() != null) outcome.setIndustrySector(req.getIndustrySector());
        if (req.getEmploymentType() != null) outcome.setEmploymentType(req.getEmploymentType());
        if (req.getSalaryBand() != null) outcome.setSalaryBand(req.getSalaryBand());
        if (req.getExactMonthlySalary() != null) outcome.setExactMonthlySalary(req.getExactMonthlySalary());
        if (req.getJoiningDate() != null) outcome.setJoiningDate(req.getJoiningDate());
        if (req.getRetentionStatus() != null) outcome.setRetentionStatus(req.getRetentionStatus());
        if (req.getJobRelevance() != null) outcome.setJobRelevance(req.getJobRelevance());
        if (req.getNotes() != null) outcome.setNotes(req.getNotes());

        return outcomeRepository.save(outcome);
    }

    @Transactional
    public void deleteOutcome(Long id) {
        EmploymentOutcome outcome = getOutcomeById(id);
        outcomeRepository.delete(outcome);
    }
}
