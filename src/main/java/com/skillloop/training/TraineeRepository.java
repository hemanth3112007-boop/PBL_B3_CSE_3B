package com.skillloop.training;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TraineeRepository extends JpaRepository<Trainee, Long> {
    Optional<Trainee> findByTraineeCode(String traineeCode);
    Optional<Trainee> findByEmail(String email);
    Optional<Trainee> findByUserId(Long userId);
    List<Trainee> findByActiveTrue();
    List<Trainee> findByDistrictIgnoreCase(String district);
    List<Trainee> findByDistrictIgnoreCaseAndActiveTrue(String district);
}
