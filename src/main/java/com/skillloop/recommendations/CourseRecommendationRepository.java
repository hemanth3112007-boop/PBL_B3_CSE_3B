package com.skillloop.recommendations;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRecommendationRepository extends JpaRepository<CourseRecommendation, Long> {
    List<CourseRecommendation> findByCourseId(Long courseId);
    List<CourseRecommendation> findByStatus(CourseRecommendation.RecommendationStatus status);
}

