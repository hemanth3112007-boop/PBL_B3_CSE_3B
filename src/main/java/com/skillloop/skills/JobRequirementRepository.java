package com.skillloop.skills;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRequirementRepository extends JpaRepository<JobRequirement, Long> {
    List<JobRequirement> findByActiveTrue();
    long countByActiveTrue();
    List<JobRequirement> findByIndustrySectorIgnoreCase(String industrySector);
    List<JobRequirement> findByCompanyIgnoreCase(String company);
}

