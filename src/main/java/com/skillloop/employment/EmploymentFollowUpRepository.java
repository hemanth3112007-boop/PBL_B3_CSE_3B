package com.skillloop.employment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmploymentFollowUpRepository extends JpaRepository<EmploymentFollowUp, Long> {
    List<EmploymentFollowUp> findByTraineeId(Long traineeId);
    List<EmploymentFollowUp> findByOutcomeId(Long outcomeId);
    List<EmploymentFollowUp> findByMilestone(EmploymentEnums.FollowUpMilestone milestone);
    List<EmploymentFollowUp> findByResponseStatus(EmploymentEnums.FollowUpResponseStatus responseStatus);
    List<EmploymentFollowUp> findByTraineeIdOrderByScheduledDateAsc(Long traineeId);
}

