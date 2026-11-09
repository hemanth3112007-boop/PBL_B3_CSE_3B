package com.skillloop.skills;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseSkillRepository extends JpaRepository<CourseSkill, Long> {
    List<CourseSkill> findByCourseId(Long courseId);
    Optional<CourseSkill> findByCourseIdAndSkillId(Long courseId, Long skillId);
}

