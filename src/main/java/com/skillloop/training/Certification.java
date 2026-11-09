package com.skillloop.training;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "certifications")
public class Certification {

    public enum Status {
        ACTIVE,
        REVOKED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "enrollment_id", nullable = false, unique = true)
    private Enrollment enrollment;

    @Column(nullable = false, unique = true, length = 60)
    private String certificateNumber;

    @Column(nullable = false)
    private LocalDate issueDate;

    @Column(length = 120)
    private String verifyingAuthority;

    @Column(length = 255)
    private String verificationUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Status status = Status.ACTIVE;

    @Column(nullable = false)
    private boolean revoked = false;

    @Column(length = 1000)
    private String revocationReason;

    private LocalDateTime revokedAt;

    @Column(length = 80)
    private String revokedBy;

    public Certification() {}

    public Certification(Enrollment enrollment, String certificateNumber, LocalDate issueDate, String verifyingAuthority, String verificationUrl) {
        this.enrollment = enrollment;
        this.certificateNumber = certificateNumber;
        this.issueDate = issueDate;
        this.verifyingAuthority = verifyingAuthority;
        this.verificationUrl = verificationUrl;
        this.status = Status.ACTIVE;
        this.revoked = false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Enrollment getEnrollment() {
        return enrollment;
    }

    public void setEnrollment(Enrollment enrollment) {
        this.enrollment = enrollment;
    }

    public String getCertificateNumber() {
        return certificateNumber;
    }

    public void setCertificateNumber(String certificateNumber) {
        this.certificateNumber = certificateNumber;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public String getVerifyingAuthority() {
        return verifyingAuthority;
    }

    public void setVerifyingAuthority(String verifyingAuthority) {
        this.verifyingAuthority = verifyingAuthority;
    }

    public String getVerificationUrl() {
        return verificationUrl;
    }

    public void setVerificationUrl(String verificationUrl) {
        this.verificationUrl = verificationUrl;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public boolean isRevoked() {
        return revoked;
    }

    public void setRevoked(boolean revoked) {
        this.revoked = revoked;
    }

    public String getRevocationReason() {
        return revocationReason;
    }

    public void setRevocationReason(String revocationReason) {
        this.revocationReason = revocationReason;
    }

    public LocalDateTime getRevokedAt() {
        return revokedAt;
    }

    public void setRevokedAt(LocalDateTime revokedAt) {
        this.revokedAt = revokedAt;
    }

    public String getRevokedBy() {
        return revokedBy;
    }

    public void setRevokedBy(String revokedBy) {
        this.revokedBy = revokedBy;
    }
}
