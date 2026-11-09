package com.skillloop.employment;

import com.skillloop.training.Trainee;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employment_follow_ups")
public class EmploymentFollowUp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "trainee_id", nullable = false)
    private Trainee trainee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "outcome_id")
    private EmploymentOutcome outcome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EmploymentEnums.FollowUpMilestone milestone; // MONTH_3, MONTH_6, MONTH_12

    @Column(nullable = false)
    private LocalDate scheduledDate;

    private LocalDate contactDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EmploymentEnums.FollowUpChannel channel = EmploymentEnums.FollowUpChannel.WEB;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EmploymentEnums.FollowUpResponseStatus responseStatus = EmploymentEnums.FollowUpResponseStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private EmploymentEnums.EmploymentStatus reportedStatus;

    @Column(length = 120)
    private String currentJobRole;

    @Column(length = 150)
    private String currentOrganization;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private EmploymentEnums.SalaryBand currentSalaryBand;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private EmploymentEnums.RetentionStatus retentionStatus;

    @Column(length = 1000)
    private String followUpNotes;

    @Column(length = 80)
    private String recordedByStaff;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public EmploymentFollowUp() {}

    public EmploymentFollowUp(Trainee trainee, EmploymentOutcome outcome, EmploymentEnums.FollowUpMilestone milestone,
                              LocalDate scheduledDate, EmploymentEnums.FollowUpChannel channel) {
        this.trainee = trainee;
        this.outcome = outcome;
        this.milestone = milestone;
        this.scheduledDate = scheduledDate;
        this.channel = channel;
        this.responseStatus = EmploymentEnums.FollowUpResponseStatus.PENDING;
        this.createdAt = LocalDateTime.now();
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

    public EmploymentOutcome getOutcome() {
        return outcome;
    }

    public void setOutcome(EmploymentOutcome outcome) {
        this.outcome = outcome;
    }

    public EmploymentEnums.FollowUpMilestone getMilestone() {
        return milestone;
    }

    public void setMilestone(EmploymentEnums.FollowUpMilestone milestone) {
        this.milestone = milestone;
    }

    public LocalDate getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDate scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public LocalDate getContactDate() {
        return contactDate;
    }

    public void setContactDate(LocalDate contactDate) {
        this.contactDate = contactDate;
    }

    public EmploymentEnums.FollowUpChannel getChannel() {
        return channel;
    }

    public void setChannel(EmploymentEnums.FollowUpChannel channel) {
        this.channel = channel;
    }

    public EmploymentEnums.FollowUpResponseStatus getResponseStatus() {
        return responseStatus;
    }

    public void setResponseStatus(EmploymentEnums.FollowUpResponseStatus responseStatus) {
        this.responseStatus = responseStatus;
    }

    public EmploymentEnums.EmploymentStatus getReportedStatus() {
        return reportedStatus;
    }

    public void setReportedStatus(EmploymentEnums.EmploymentStatus reportedStatus) {
        this.reportedStatus = reportedStatus;
    }

    public String getCurrentJobRole() {
        return currentJobRole;
    }

    public void setCurrentJobRole(String currentJobRole) {
        this.currentJobRole = currentJobRole;
    }

    public String getCurrentOrganization() {
        return currentOrganization;
    }

    public void setCurrentOrganization(String currentOrganization) {
        this.currentOrganization = currentOrganization;
    }

    public EmploymentEnums.SalaryBand getCurrentSalaryBand() {
        return currentSalaryBand;
    }

    public void setCurrentSalaryBand(EmploymentEnums.SalaryBand currentSalaryBand) {
        this.currentSalaryBand = currentSalaryBand;
    }

    public EmploymentEnums.RetentionStatus getRetentionStatus() {
        return retentionStatus;
    }

    public void setRetentionStatus(EmploymentEnums.RetentionStatus retentionStatus) {
        this.retentionStatus = retentionStatus;
    }

    public String getFollowUpNotes() {
        return followUpNotes;
    }

    public void setFollowUpNotes(String followUpNotes) {
        this.followUpNotes = followUpNotes;
    }

    public String getRecordedByStaff() {
        return recordedByStaff;
    }

    public void setRecordedByStaff(String recordedByStaff) {
        this.recordedByStaff = recordedByStaff;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

