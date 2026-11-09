package com.skillloop.training;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {
    Optional<Batch> findByBatchCode(String batchCode);
    List<Batch> findByActiveTrue();
    List<Batch> findByCourseId(Long courseId);
    List<Batch> findByCourseIdAndActiveTrue(Long courseId);
}
