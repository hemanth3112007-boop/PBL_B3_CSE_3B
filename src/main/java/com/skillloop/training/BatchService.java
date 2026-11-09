package com.skillloop.training;

import com.skillloop.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BatchService {

    private final BatchRepository batchRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public BatchService(BatchRepository batchRepository, CourseRepository courseRepository, EnrollmentRepository enrollmentRepository) {
        this.batchRepository = batchRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public List<Batch> getAllBatches(boolean includeInactive) {
        if (includeInactive) {
            return batchRepository.findAll();
        }
        return batchRepository.findByActiveTrue();
    }

    public Batch getBatchById(Long id) {
        return batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + id));
    }

    public List<Batch> getBatchesByCourse(Long courseId, boolean includeInactive) {
        if (includeInactive) {
            return batchRepository.findByCourseId(courseId);
        }
        return batchRepository.findByCourseIdAndActiveTrue(courseId);
    }

    @Transactional
    public Batch createBatch(TrainingDtos.CreateBatchRequest req) {
        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + req.getCourseId()));

        if (batchRepository.findByBatchCode(req.getBatchCode()).isPresent()) {
            throw new IllegalArgumentException("Batch with code " + req.getBatchCode() + " already exists");
        }

        Batch batch = new Batch(
                req.getBatchCode(),
                course,
                req.getStartDate(),
                req.getEndDate(),
                req.getTrainerName(),
                req.getMaxCapacity()
        );
        batch.setActive(true);

        return batchRepository.save(batch);
    }

    @Transactional
    public Batch updateBatch(Long id, TrainingDtos.UpdateBatchRequest req) {
        Batch batch = getBatchById(id);

        if (req.getStartDate() != null) batch.setStartDate(req.getStartDate());
        if (req.getEndDate() != null) batch.setEndDate(req.getEndDate());
        if (req.getTrainerName() != null) batch.setTrainerName(req.getTrainerName());
        if (req.getMaxCapacity() != null) {
            long activeEnrollments = enrollmentRepository.findByBatchId(id).stream()
                    .filter(e -> e.getStatus() != Enrollment.EnrollmentStatus.DROPPED_OUT)
                    .count();
            if (req.getMaxCapacity() < activeEnrollments) {
                throw new IllegalArgumentException("Cannot reduce batch capacity to " + req.getMaxCapacity()
                        + " as there are already " + activeEnrollments + " active enrolled trainees.");
            }
            batch.setMaxCapacity(req.getMaxCapacity());
        }
        if (req.getActive() != null) batch.setActive(req.getActive());

        return batchRepository.save(batch);
    }

    @Transactional
    public void deactivateBatch(Long id) {
        Batch batch = getBatchById(id);
        batch.setActive(false);
        batchRepository.save(batch);
    }
}
