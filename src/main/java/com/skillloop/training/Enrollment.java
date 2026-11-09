package com.skillloop.training;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "enrollments", uniqueConstraints = {
        @UniqueConstraint(name = "uk_enrollment_trainee_batch", columnNames = {"trainee_id", "batch_id"})
})
public class Enrollment {

    public enum EnrollmentStatus {
        ENROLLED,
        COMPLETED,
        DROPPED_OUT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "trainee_id", nullable = false)
    private Trainee trainee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    @Column(nullable = false)
    private LocalDate enrollmentDate;

    private LocalDate completionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EnrollmentStatus status = EnrollmentStatus.ENROLLED;

    private Double attendancePercentage;

    private Double assessmentScore;

    @Column(nullable = false)
    private boolean certificationIssued = false;

    private LocalDate certifiedAt;

    public Enrollment() {}

    public Enrollment(Trainee trainee, Batch batch, LocalDate enrollmentDate, EnrollmentStatus status) {
        this.trainee = trainee;
        this.batch = batch;
        this.enrollmentDate = enrollmentDate;
        this.status = status;
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

    public Batch getBatch() {
        return batch;
    }

    public void setBatch(Batch batch) {
        this.batch = batch;
    }

    public LocalDate getEnrollmentDate() {
        return enrollmentDate;
    }

    public void setEnrollmentDate(LocalDate enrollmentDate) {
        this.enrollmentDate = enrollmentDate;
    }

    public LocalDate getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDate completionDate) {
        this.completionDate = completionDate;
    }

    public EnrollmentStatus getStatus() {
        return status;
    }

    public void setStatus(EnrollmentStatus status) {
        this.status = status;
    }

    public Double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(Double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }

    public Double getAssessmentScore() {
        return assessmentScore;
    }

    public void setAssessmentScore(Double assessmentScore) {
        this.assessmentScore = assessmentScore;
    }

    public boolean isCertificationIssued() {
        return certificationIssued;
    }

    public void setCertificationIssued(boolean certificationIssued) {
        this.certificationIssued = certificationIssued;
    }

    public LocalDate getCertifiedAt() {
        return certifiedAt;
    }

    public void setCertifiedAt(LocalDate certifiedAt) {
        this.certifiedAt = certifiedAt;
    }
}

