package com.skillloop.employment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmploymentOutcomeRepository extends JpaRepository<EmploymentOutcome, Long> {
    List<EmploymentOutcome> findByTraineeId(Long traineeId);
    List<EmploymentOutcome> findByCourseId(Long courseId);
    List<EmploymentOutcome> findByStatus(EmploymentEnums.EmploymentStatus status);
    List<EmploymentOutcome> findByVerificationStatus(EmploymentEnums.VerificationStatus verificationStatus);
    Optional<EmploymentOutcome> findFirstByTraineeIdOrderByCreatedAtDesc(Long traineeId);

    @Query("SELECT COUNT(e) FROM EmploymentOutcome e WHERE e.status IN ('EMPLOYED', 'SELF_EMPLOYED', 'APPRENTICESHIP')")
    long countPositiveOutcomes();

    @Query("SELECT COUNT(e) FROM EmploymentOutcome e WHERE e.status != 'OUTCOME_UNKNOWN'")
    long countKnownOutcomes();
}

