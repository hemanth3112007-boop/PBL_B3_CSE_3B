package com.skillloop.skills;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillGapAnalysisRepository extends JpaRepository<SkillGapAnalysisResult, Long> {
    List<SkillGapAnalysisResult> findByCourseId(Long courseId);
    Optional<SkillGapAnalysisResult> findByCourseIdAndJobRequirementId(Long courseId, Long jobRequirementId);
    List<SkillGapAnalysisResult> findByJobRequirementId(Long jobRequirementId);
    List<SkillGapAnalysisResult> findByMatchLevel(SkillEnums.SkillMatchLevel matchLevel);
}

