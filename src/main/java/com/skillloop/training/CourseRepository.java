package com.skillloop.training;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCourseCode(String courseCode);
    List<Course> findByActiveTrue();
    long countByActiveTrue();
    List<Course> findByDomainSectorIgnoreCase(String domainSector);
}

