package com.skillloop.training;

import com.skillloop.common.ResourceNotFoundException;
import com.skillloop.config.OwnershipService;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final TraineeRepository traineeRepository;
    private final BatchRepository batchRepository;
    private final OwnershipService ownershipService;

    public EnrollmentService(
            EnrollmentRepository enrollmentRepository,
            TraineeRepository traineeRepository,
            BatchRepository batchRepository,
            OwnershipService ownershipService) {
        this.enrollmentRepository = enrollmentRepository;
        this.traineeRepository = traineeRepository;
        this.batchRepository = batchRepository;
        this.ownershipService = ownershipService;
    }

    public List<Enrollment> getAllEnrollments() {
        return enrollmentRepository.findAll();
    }

    public Enrollment getEnrollmentById(Long id, Authentication authentication) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found with id: " + id));

        if (authentication != null) {
            ownershipService.verifyTraineeOwnership(authentication, enrollment.getTrainee().getId());
        }
        return enrollment;
    }

    public List<Enrollment> getEnrollmentsByTrainee(Long traineeId, Authentication authentication) {
        if (authentication != null) {
            ownershipService.verifyTraineeOwnership(authentication, traineeId);
        }
        return enrollmentRepository.findByTraineeId(traineeId);
    }

    public List<Enrollment> getEnrollmentsByBatch(Long batchId) {
        return enrollmentRepository.findByBatchId(batchId);
    }

    @Transactional
    public Enrollment enrollTrainee(TrainingDtos.EnrollTraineeRequest req) {
        Trainee trainee = traineeRepository.findById(req.getTraineeId())
                .orElseThrow(() -> new ResourceNotFoundException("Trainee not found with id: " + req.getTraineeId()));

        Batch batch = batchRepository.findById(req.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + req.getBatchId()));

        if (!trainee.isActive()) {
            throw new IllegalStateException("Cannot enroll an inactive trainee");
        }

        if (!batch.isActive()) {
            throw new IllegalStateException("Cannot enroll in an inactive batch");
        }

        if (enrollmentRepository.findByTraineeIdAndBatchId(trainee.getId(), batch.getId()).isPresent()) {
            throw new IllegalArgumentException("Trainee is already enrolled in this batch");
        }

        long activeCount = enrollmentRepository.findByBatchId(batch.getId()).stream()
                .filter(e -> e.getStatus() != Enrollment.EnrollmentStatus.DROPPED_OUT)
                .count();
        if (batch.getMaxCapacity() != null && activeCount >= batch.getMaxCapacity()) {
            throw new IllegalArgumentException("Batch capacity reached (" + batch.getMaxCapacity() + "). Cannot enroll additional trainees.");
        }

        Enrollment enrollment = new Enrollment(
                trainee,
                batch,
                req.getEnrollmentDate() != null ? req.getEnrollmentDate() : java.time.LocalDate.now(),
                Enrollment.EnrollmentStatus.ENROLLED
        );

        return enrollmentRepository.save(enrollment);
    }

    @Transactional
    public Enrollment updateEnrollment(Long id, TrainingDtos.UpdateEnrollmentRequest req) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found with id: " + id));

        if (enrollment.isCertificationIssued() && (req.getAttendancePercentage() != null || req.getAssessmentScore() != null)) {
            throw new IllegalStateException("Cannot modify attendance or assessment score for a certified enrollment. Revoke the certificate first.");
        }

        if (req.getStatus() != null) {
            enrollment.setStatus(req.getStatus());
        }
        if (req.getCompletionDate() != null) {
            enrollment.setCompletionDate(req.getCompletionDate());
        }
        if (req.getAttendancePercentage() != null) {
            if (req.getAttendancePercentage() < 0.0 || req.getAttendancePercentage() > 100.0) {
                throw new IllegalArgumentException("Attendance percentage must be between 0.0 and 100.0");
            }
            enrollment.setAttendancePercentage(req.getAttendancePercentage());
        }
        if (req.getAssessmentScore() != null) {
            if (req.getAssessmentScore() < 0.0 || req.getAssessmentScore() > 100.0) {
                throw new IllegalArgumentException("Assessment score must be between 0.0 and 100.0");
            }
            enrollment.setAssessmentScore(req.getAssessmentScore());
        }

        return enrollmentRepository.save(enrollment);
    }
}
