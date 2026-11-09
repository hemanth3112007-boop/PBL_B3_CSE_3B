package com.skillloop.training;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String courseCode;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(length = 80)
    private String domainSector; // e.g. Data Analytics, Web Development, Cloud Computing, Electrical

    @Column(nullable = false)
    private Integer durationWeeks;

    @Column(length = 120)
    private String providerName; // e.g. DSATM Skills Academy, NSDC Partner Institute

    @Column(length = 80)
    private String district; // e.g. Bangalore Urban, Bangalore Rural, Mysuru, Ramanagara

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Course() {}

    public Course(String courseCode, String title, String description, String domainSector, Integer durationWeeks, String providerName, String district) {
        this.courseCode = courseCode;
        this.title = title;
        this.description = description;
        this.domainSector = domainSector;
        this.durationWeeks = durationWeeks;
        this.providerName = providerName;
        this.district = district;
        this.active = true;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDomainSector() {
        return domainSector;
    }

    public void setDomainSector(String domainSector) {
        this.domainSector = domainSector;
    }

    public Integer getDurationWeeks() {
        return durationWeeks;
    }

    public void setDurationWeeks(Integer durationWeeks) {
        this.durationWeeks = durationWeeks;
    }

    public String getProviderName() {
        return providerName;
    }

    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

