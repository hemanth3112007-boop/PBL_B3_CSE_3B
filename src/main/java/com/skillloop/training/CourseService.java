package com.skillloop.training;

import com.skillloop.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final BatchRepository batchRepository;

    public CourseService(CourseRepository courseRepository, BatchRepository batchRepository) {
        this.courseRepository = courseRepository;
        this.batchRepository = batchRepository;
    }

    public List<Course> getAllCourses(boolean includeInactive) {
        if (includeInactive) {
            return courseRepository.findAll();
        }
        return courseRepository.findByActiveTrue();
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
    }

    public List<Course> getCoursesByDomainSector(String sector) {
        return courseRepository.findByDomainSectorIgnoreCase(sector);
    }

    @Transactional
    public Course createCourse(TrainingDtos.CreateCourseRequest req) {
        if (courseRepository.findByCourseCode(req.getCourseCode()).isPresent()) {
            throw new IllegalArgumentException("Course with code " + req.getCourseCode() + " already exists");
        }

        Course course = new Course(
                req.getCourseCode(),
                req.getTitle(),
                req.getDescription(),
                req.getDomainSector(),
                req.getDurationWeeks(),
                req.getProviderName(),
                req.getDistrict()
        );
        course.setActive(true);

        return courseRepository.save(course);
    }

    @Transactional
    public Course updateCourse(Long id, TrainingDtos.UpdateCourseRequest req) {
        Course course = getCourseById(id);

        if (req.getTitle() != null) course.setTitle(req.getTitle());
        if (req.getDescription() != null) course.setDescription(req.getDescription());
        if (req.getDomainSector() != null) course.setDomainSector(req.getDomainSector());
        if (req.getDurationWeeks() != null) course.setDurationWeeks(req.getDurationWeeks());
        if (req.getProviderName() != null) course.setProviderName(req.getProviderName());
        if (req.getDistrict() != null) course.setDistrict(req.getDistrict());
        if (req.getActive() != null) course.setActive(req.getActive());

        return courseRepository.save(course);
    }

    @Transactional
    public void deactivateCourse(Long id) {
        Course course = getCourseById(id);
        course.setActive(false);
        courseRepository.save(course);
    }

    public List<Batch> getBatchesByCourse(Long courseId) {
        return batchRepository.findByCourseIdAndActiveTrue(courseId);
    }

    @Transactional
    public Batch createBatch(TrainingDtos.CreateBatchRequest req) {
        Course course = getCourseById(req.getCourseId());

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
}
