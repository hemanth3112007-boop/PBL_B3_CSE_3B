package com.skillloop.training;

import com.skillloop.common.ResourceNotFoundException;
import com.skillloop.config.OwnershipService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final OwnershipService ownershipService;

    @Value("${skillloop.certification.min-assessment-pass-percentage:50.0}")
    private double passPercentageCutoff;

    public AssessmentService(
            AssessmentRepository assessmentRepository,
            EnrollmentRepository enrollmentRepository,
            OwnershipService ownershipService) {
        this.assessmentRepository = assessmentRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.ownershipService = ownershipService;
    }

    public List<Assessment> getAssessmentsByEnrollment(Long enrollmentId, Authentication authentication) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found with id: " + enrollmentId));

        if (authentication != null) {
            ownershipService.verifyTraineeOwnership(authentication, enrollment.getTrainee().getId());
        }

        return assessmentRepository.findByEnrollmentId(enrollmentId);
    }

    public Assessment getAssessmentById(Long id, Authentication authentication) {
        Assessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found with id: " + id));

        if (authentication != null) {
            ownershipService.verifyTraineeOwnership(authentication, assessment.getEnrollment().getTrainee().getId());
        }

        return assessment;
    }

    @Transactional
    public Assessment createAssessment(TrainingDtos.CreateAssessmentRequest req) {
        Enrollment enrollment = enrollmentRepository.findById(req.getEnrollmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found with id: " + req.getEnrollmentId()));

        if (req.getScore() > req.getMaxScore()) {
            throw new IllegalArgumentException("Assessment score (" + req.getScore() + ") cannot exceed maximum score (" + req.getMaxScore() + ")");
        }

        double percentage = (req.getScore() / req.getMaxScore()) * 100.0;
        boolean passed = percentage >= passPercentageCutoff;

        Assessment assessment = new Assessment(
                enrollment,
                req.getAssessmentName(),
                req.getScore(),
                req.getMaxScore(),
                passed,
                req.getAssessmentDate() != null ? req.getAssessmentDate() : java.time.LocalDate.now()
        );

        Assessment saved = assessmentRepository.save(assessment);
        recalculateEnrollmentAverageScore(enrollment);

        return saved;
    }

    @Transactional
    public Assessment updateAssessmentScore(Long id, TrainingDtos.UpdateAssessmentRequest req) {
        Assessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found with id: " + id));

        if (req.getScore() > req.getMaxScore()) {
            throw new IllegalArgumentException("Assessment score (" + req.getScore() + ") cannot exceed maximum score (" + req.getMaxScore() + ")");
        }

        double newPercentage = (req.getScore() / req.getMaxScore()) * 100.0;
        boolean newPassed = newPercentage >= passPercentageCutoff;

        Enrollment enrollment = assessment.getEnrollment();

        // Anti-tampering safeguard for certified enrollments
        if (enrollment.isCertificationIssued() && !newPassed) {
            throw new IllegalStateException(
                    "Cannot lower assessment score below pass threshold (" + passPercentageCutoff + "%) for an already certified enrollment. " +
                    "The issued certificate must be formally revoked first."
            );
        }

        assessment.setScore(req.getScore());
        assessment.setMaxScore(req.getMaxScore());
        assessment.setPassed(newPassed);

        Assessment saved = assessmentRepository.save(assessment);
        recalculateEnrollmentAverageScore(enrollment);

        return saved;
    }

    @Transactional
    public void deleteAssessment(Long id) {
        Assessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found with id: " + id));
        Enrollment enrollment = assessment.getEnrollment();
        assessmentRepository.delete(assessment);
        recalculateEnrollmentAverageScore(enrollment);
    }

    private void recalculateEnrollmentAverageScore(Enrollment enrollment) {
        List<Assessment> assessments = assessmentRepository.findByEnrollmentId(enrollment.getId());
        if (assessments.isEmpty()) {
            return;
        }

        double totalPercentages = 0.0;
        for (Assessment a : assessments) {
            double pct = a.getMaxScore() > 0 ? (a.getScore() / a.getMaxScore()) * 100.0 : 0.0;
            totalPercentages += pct;
        }

        double avg = Math.round((totalPercentages / assessments.size()) * 10.0) / 10.0;
        enrollment.setAssessmentScore(avg);
        enrollmentRepository.save(enrollment);
    }
}
