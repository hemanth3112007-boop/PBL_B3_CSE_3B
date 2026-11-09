package com.skillloop.employment;

import com.skillloop.training.Course;
import com.skillloop.training.Trainee;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employment_outcomes")
public class EmploymentOutcome {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "trainee_id", nullable = false)
    private Trainee trainee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EmploymentEnums.EmploymentStatus status;

    @Column(length = 120)
    private String jobRole;

    @Column(length = 150)
    private String organization;

    @Column(length = 100)
    private String industrySector;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private EmploymentEnums.EmploymentType employmentType;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private EmploymentEnums.SalaryBand salaryBand;

    private Double exactMonthlySalary;

    private LocalDate joiningDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private EmploymentEnums.RetentionStatus retentionStatus = EmploymentEnums.RetentionStatus.STILL_EMPLOYED;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private EmploymentEnums.JobRelevance jobRelevance = EmploymentEnums.JobRelevance.HIGHLY_RELEVANT;

    @Enumerated(EnumType.STRING)
    @Column(length = 35)
    private EmploymentEnums.VerificationSource verificationSource = EmploymentEnums.VerificationSource.SELF_REPORTED;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private EmploymentEnums.VerificationStatus verificationStatus = EmploymentEnums.VerificationStatus.UNVERIFIED;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private EmploymentEnums.DataQualityLabel dataQualityLabel = EmploymentEnums.DataQualityLabel.LOW_CONFIDENCE;

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public EmploymentOutcome() {}

    public EmploymentOutcome(Trainee trainee, Course course, EmploymentEnums.EmploymentStatus status, String jobRole, String organization,
                             EmploymentEnums.EmploymentType employmentType, EmploymentEnums.SalaryBand salaryBand, LocalDate joiningDate) {
        this.trainee = trainee;
        this.course = course;
        this.status = status;
        this.jobRole = jobRole;
        this.organization = organization;
        this.employmentType = employmentType;
        this.salaryBand = salaryBand;
        this.joiningDate = joiningDate;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Trainee getTrainee() {
        return trainee;
    }

    public void setTrainee(Trainee trainee) {
        this.trainee = trainee;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public EmploymentEnums.EmploymentStatus getStatus() {
        return status;
    }

    public void setStatus(EmploymentEnums.EmploymentStatus status) {
        this.status = status;
    }

    public String getJobRole() {
        return jobRole;
    }

    public void setJobRole(String jobRole) {
        this.jobRole = jobRole;
    }

    public String getOrganization() {
        return organization;
    }

    public void setOrganization(String organization) {
        this.organization = organization;
    }

    public String getIndustrySector() {
        return industrySector;
    }

    public void setIndustrySector(String industrySector) {
        this.industrySector = industrySector;
    }

    public EmploymentEnums.EmploymentType getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(EmploymentEnums.EmploymentType employmentType) {
        this.employmentType = employmentType;
    }

    public EmploymentEnums.SalaryBand getSalaryBand() {
        return salaryBand;
    }

    public void setSalaryBand(EmploymentEnums.SalaryBand salaryBand) {
        this.salaryBand = salaryBand;
    }

    public Double getExactMonthlySalary() {
        return exactMonthlySalary;
    }

    public void setExactMonthlySalary(Double exactMonthlySalary) {
        this.exactMonthlySalary = exactMonthlySalary;
    }

    public LocalDate getJoiningDate() {
        return joiningDate;
    }

    public void setJoiningDate(LocalDate joiningDate) {
        this.joiningDate = joiningDate;
    }

    public EmploymentEnums.RetentionStatus getRetentionStatus() {
        return retentionStatus;
    }

    public void setRetentionStatus(EmploymentEnums.RetentionStatus retentionStatus) {
        this.retentionStatus = retentionStatus;
    }

    public EmploymentEnums.JobRelevance getJobRelevance() {
        return jobRelevance;
    }

    public void setJobRelevance(EmploymentEnums.JobRelevance jobRelevance) {
        this.jobRelevance = jobRelevance;
    }

    public EmploymentEnums.VerificationSource getVerificationSource() {
        return verificationSource;
    }

    public void setVerificationSource(EmploymentEnums.VerificationSource verificationSource) {
        this.verificationSource = verificationSource;
    }

    public EmploymentEnums.VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(EmploymentEnums.VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public EmploymentEnums.DataQualityLabel getDataQualityLabel() {
        return dataQualityLabel;
    }

    public void setDataQualityLabel(EmploymentEnums.DataQualityLabel dataQualityLabel) {
        this.dataQualityLabel = dataQualityLabel;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

