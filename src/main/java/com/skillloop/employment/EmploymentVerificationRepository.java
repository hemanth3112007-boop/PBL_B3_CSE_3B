package com.skillloop.employment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmploymentVerificationRepository extends JpaRepository<EmploymentVerification, Long> {
    List<EmploymentVerification> findByOutcomeId(Long outcomeId);
    List<EmploymentVerification> findByStatus(EmploymentEnums.VerificationStatus status);
    List<EmploymentVerification> findByConflictFlagTrue();
}

