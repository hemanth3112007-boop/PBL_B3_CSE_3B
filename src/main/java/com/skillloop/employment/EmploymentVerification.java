package com.skillloop.employment;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "employment_verifications")
public class EmploymentVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "outcome_id", nullable = false)
    private EmploymentOutcome outcome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 35)
    private EmploymentEnums.VerificationSource source = EmploymentEnums.VerificationSource.SELF_REPORTED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EmploymentEnums.VerificationStatus status = EmploymentEnums.VerificationStatus.PENDING_REVIEW;

    @Column(length = 80)
    private String evidenceType; // OFFER_LETTER, PAYSLIP, EMPLOYER_EMAIL, EPFO_UAN, PHONE_CONFIRMATION

    @Column(length = 255)
    private String evidenceDocumentUrl;

    @Column(length = 100)
    private String employerContactPerson;

    @Column(length = 30)
    private String employerContactPhone;

    @Column(length = 120)
    private String employerContactEmail;

    @Column(length = 80)
    private String verifiedByStaff;

    private LocalDateTime verifiedAt;

    @Column(nullable = false)
    private boolean conflictFlag = false;

    @Column(length = 1000)
    private String conflictDetails;

    @Column(length = 1000)
    private String verificationNotes;

    private Double confidenceScore = 0.5;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private EmploymentEnums.DataQualityLabel dataQualityLabel = EmploymentEnums.DataQualityLabel.MEDIUM_CONFIDENCE;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public EmploymentVerification() {}

    public EmploymentVerification(EmploymentOutcome outcome, EmploymentEnums.VerificationSource source,
                                  EmploymentEnums.VerificationStatus status, String evidenceType, String verifiedByStaff) {
        this.outcome = outcome;
        this.source = source;
        this.status = status;
        this.evidenceType = evidenceType;
        this.verifiedByStaff = verifiedByStaff;
        this.createdAt = LocalDateTime.now();
        this.updateQualityMetrics();
    }

    public void updateQualityMetrics() {
        if (this.conflictFlag) {
            this.status = EmploymentEnums.VerificationStatus.CONFLICT_DETECTED;
            this.dataQualityLabel = EmploymentEnums.DataQualityLabel.CONFLICT_FLAGGED;
            this.confidenceScore = 0.1;
        } else if (this.verifiedByStaff != null && !this.verifiedByStaff.isBlank()) {
            // Staff-verified evidence
            if (this.source == EmploymentEnums.VerificationSource.EMPLOYER_CONFIRMED ||
                    this.source == EmploymentEnums.VerificationSource.INDEPENDENTLY_CORROBORATED) {
                this.status = EmploymentEnums.VerificationStatus.VERIFIED;
                this.dataQualityLabel = EmploymentEnums.DataQualityLabel.HIGH_CONFIDENCE;
                this.confidenceScore = 0.95;
                this.verifiedAt = LocalDateTime.now();
            } else if (this.evidenceDocumentUrl != null && !this.evidenceDocumentUrl.isBlank()) {
                this.status = EmploymentEnums.VerificationStatus.VERIFIED;
                this.dataQualityLabel = EmploymentEnums.DataQualityLabel.MEDIUM_CONFIDENCE;
                this.confidenceScore = 0.75;
                this.verifiedAt = LocalDateTime.now();
            } else {
                this.status = EmploymentEnums.VerificationStatus.PENDING_REVIEW;
                this.dataQualityLabel = EmploymentEnums.DataQualityLabel.LOW_CONFIDENCE;
                this.confidenceScore = 0.40;
            }
        } else {
            // Trainee / self-submission: Always PENDING_REVIEW awaiting staff review
            this.status = EmploymentEnums.VerificationStatus.PENDING_REVIEW;
            this.dataQualityLabel = (this.evidenceDocumentUrl != null && !this.evidenceDocumentUrl.isBlank())
                    ? EmploymentEnums.DataQualityLabel.MEDIUM_CONFIDENCE
                    : EmploymentEnums.DataQualityLabel.LOW_CONFIDENCE;
            this.confidenceScore = (this.evidenceDocumentUrl != null && !this.evidenceDocumentUrl.isBlank()) ? 0.60 : 0.40;
        }
    }

    private static void validateEvidenceUrl(String url) {
        if (url == null || url.isBlank()) return;
        String trimmed = url.trim().toLowerCase();
        if (trimmed.startsWith("javascript:") || trimmed.startsWith("data:") || trimmed.startsWith("vbscript:")) {
            throw new IllegalArgumentException("Invalid evidence document URL: unsafe protocol scheme detected");
        }
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
            throw new IllegalArgumentException("Evidence document URL must start with http://, https://, or /");
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public EmploymentOutcome getOutcome() {
        return outcome;
    }

    public void setOutcome(EmploymentOutcome outcome) {
        this.outcome = outcome;
    }

    public EmploymentEnums.VerificationSource getSource() {
        return source;
    }

    public void setSource(EmploymentEnums.VerificationSource source) {
        this.source = source;
    }

    public EmploymentEnums.VerificationStatus getStatus() {
        return status;
    }

    public void setStatus(EmploymentEnums.VerificationStatus status) {
        this.status = status;
    }

    public String getEvidenceType() {
        return evidenceType;
    }

    public void setEvidenceType(String evidenceType) {
        this.evidenceType = evidenceType;
    }

    public String getEvidenceDocumentUrl() {
        return evidenceDocumentUrl;
    }

    public void setEvidenceDocumentUrl(String evidenceDocumentUrl) {
        validateEvidenceUrl(evidenceDocumentUrl);
        this.evidenceDocumentUrl = evidenceDocumentUrl;
    }

    public String getEmployerContactPerson() {
        return employerContactPerson;
    }

    public void setEmployerContactPerson(String employerContactPerson) {
        this.employerContactPerson = employerContactPerson;
    }

    public String getEmployerContactPhone() {
        return employerContactPhone;
    }

    public void setEmployerContactPhone(String employerContactPhone) {
        this.employerContactPhone = employerContactPhone;
    }

    public String getEmployerContactEmail() {
        return employerContactEmail;
    }

    public void setEmployerContactEmail(String employerContactEmail) {
        this.employerContactEmail = employerContactEmail;
    }

    public String getVerifiedByStaff() {
        return verifiedByStaff;
    }

    public void setVerifiedByStaff(String verifiedByStaff) {
        this.verifiedByStaff = verifiedByStaff;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public boolean isConflictFlag() {
        return conflictFlag;
    }

    public void setConflictFlag(boolean conflictFlag) {
        this.conflictFlag = conflictFlag;
    }

    public String getConflictDetails() {
        return conflictDetails;
    }

    public void setConflictDetails(String conflictDetails) {
        this.conflictDetails = conflictDetails;
    }

    public String getVerificationNotes() {
        return verificationNotes;
    }

    public void setVerificationNotes(String verificationNotes) {
        this.verificationNotes = verificationNotes;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public EmploymentEnums.DataQualityLabel getDataQualityLabel() {
        return dataQualityLabel;
    }

    public void setDataQualityLabel(EmploymentEnums.DataQualityLabel dataQualityLabel) {
        this.dataQualityLabel = dataQualityLabel;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

