package com.skillloop.training;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class TrainingDtos {

    // ------------------------------------------------------------------------
    // Course DTOs
    // ------------------------------------------------------------------------
    public static class CreateCourseRequest {
        @NotBlank(message = "Course code is required")
        private String courseCode;

        @NotBlank(message = "Course title is required")
        private String title;

        private String description;
        private String domainSector;

        @NotNull(message = "Duration in weeks is required")
        @Min(value = 1, message = "Duration must be at least 1 week")
        private Integer durationWeeks;

        private String providerName;
        private String district;

        public CreateCourseRequest() {}

        public String getCourseCode() { return courseCode; }
        public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getDomainSector() { return domainSector; }
        public void setDomainSector(String domainSector) { this.domainSector = domainSector; }
        public Integer getDurationWeeks() { return durationWeeks; }
        public void setDurationWeeks(Integer durationWeeks) { this.durationWeeks = durationWeeks; }
        public String getProviderName() { return providerName; }
        public void setProviderName(String providerName) { this.providerName = providerName; }
        public String getDistrict() { return district; }
        public void setDistrict(String district) { this.district = district; }
    }

    public static class UpdateCourseRequest {
        private String title;
        private String description;
        private String domainSector;
        private Integer durationWeeks;
        private String providerName;
        private String district;
        private Boolean active;

        public UpdateCourseRequest() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getDomainSector() { return domainSector; }
        public void setDomainSector(String domainSector) { this.domainSector = domainSector; }
        public Integer getDurationWeeks() { return durationWeeks; }
        public void setDurationWeeks(Integer durationWeeks) { this.durationWeeks = durationWeeks; }
        public String getProviderName() { return providerName; }
        public void setProviderName(String providerName) { this.providerName = providerName; }
        public String getDistrict() { return district; }
        public void setDistrict(String district) { this.district = district; }
        public Boolean getActive() { return active; }
        public void setActive(Boolean active) { this.active = active; }
    }

    // ------------------------------------------------------------------------
    // Batch DTOs
    // ------------------------------------------------------------------------
    public static class CreateBatchRequest {
        @NotBlank(message = "Batch code is required")
        private String batchCode;

        @NotNull(message = "Course ID is required")
        private Long courseId;

        @NotNull(message = "Start date is required")
        private LocalDate startDate;

        @NotNull(message = "End date is required")
        private LocalDate endDate;

        private String trainerName;

        @Min(value = 1, message = "Max capacity must be at least 1")
        private Integer maxCapacity;

        public CreateBatchRequest() {}

        public String getBatchCode() { return batchCode; }
        public void setBatchCode(String batchCode) { this.batchCode = batchCode; }
        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }
        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public LocalDate getEndDate() { return endDate; }
        public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
        public String getTrainerName() { return trainerName; }
        public void setTrainerName(String trainerName) { this.trainerName = trainerName; }
        public Integer getMaxCapacity() { return maxCapacity; }
        public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }
    }

    public static class UpdateBatchRequest {
        private LocalDate startDate;
        private LocalDate endDate;
        private String trainerName;
        private Integer maxCapacity;
        private Boolean active;

        public UpdateBatchRequest() {}

        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public LocalDate getEndDate() { return endDate; }
        public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
        public String getTrainerName() { return trainerName; }
        public void setTrainerName(String trainerName) { this.trainerName = trainerName; }
        public Integer getMaxCapacity() { return maxCapacity; }
        public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }
        public Boolean getActive() { return active; }
        public void setActive(Boolean active) { this.active = active; }
    }

    // ------------------------------------------------------------------------
    // Trainee DTOs
    // ------------------------------------------------------------------------
    public static class CreateTraineeRequest {
        @NotBlank(message = "Trainee code is required")
        private String traineeCode;

        @NotBlank(message = "First name is required")
        private String firstName;

        @NotBlank(message = "Last name is required")
        private String lastName;

        @NotBlank(message = "Email is required")
        @Email(message = "Valid email is required")
        private String email;

        @NotBlank(message = "Phone number is required")
        private String phone;

        private String district;
        private LocalDate dateOfBirth;
        private String gender;
        private String educationLevel;
        private boolean consentGiven = true;

        public CreateTraineeRequest() {}

        public String getTraineeCode() { return traineeCode; }
        public void setTraineeCode(String traineeCode) { this.traineeCode = traineeCode; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getDistrict() { return district; }
        public void setDistrict(String district) { this.district = district; }
        public LocalDate getDateOfBirth() { return dateOfBirth; }
        public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }
        public String getEducationLevel() { return educationLevel; }
        public void setEducationLevel(String educationLevel) { this.educationLevel = educationLevel; }
        public boolean isConsentGiven() { return consentGiven; }
        public void setConsentGiven(boolean consentGiven) { this.consentGiven = consentGiven; }
    }

    public static class UpdateTraineeRequest {
        private String firstName;
        private String lastName;
        private String phone;
        private String district;
        private LocalDate dateOfBirth;
        private String gender;
        private String educationLevel;
        private Boolean consentGiven;
        private Boolean active;

        public UpdateTraineeRequest() {}

        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getDistrict() { return district; }
        public void setDistrict(String district) { this.district = district; }
        public LocalDate getDateOfBirth() { return dateOfBirth; }
        public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }
        public String getEducationLevel() { return educationLevel; }
        public void setEducationLevel(String educationLevel) { this.educationLevel = educationLevel; }
        public Boolean getConsentGiven() { return consentGiven; }
        public void setConsentGiven(Boolean consentGiven) { this.consentGiven = consentGiven; }
        public Boolean getActive() { return active; }
        public void setActive(Boolean active) { this.active = active; }
    }

    // ------------------------------------------------------------------------
    // Enrollment DTOs
    // ------------------------------------------------------------------------
    public static class EnrollTraineeRequest {
        @NotNull(message = "Trainee ID is required")
        private Long traineeId;

        @NotNull(message = "Batch ID is required")
        private Long batchId;

        private LocalDate enrollmentDate = LocalDate.now();

        public EnrollTraineeRequest() {}

        public Long getTraineeId() { return traineeId; }
        public void setTraineeId(Long traineeId) { this.traineeId = traineeId; }
        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }
        public LocalDate getEnrollmentDate() { return enrollmentDate; }
        public void setEnrollmentDate(LocalDate enrollmentDate) { this.enrollmentDate = enrollmentDate; }
    }

    public static class UpdateEnrollmentRequest {
        private Enrollment.EnrollmentStatus status;
        private LocalDate completionDate;
        private Double attendancePercentage;
        private Double assessmentScore;

        public UpdateEnrollmentRequest() {}

        public Enrollment.EnrollmentStatus getStatus() { return status; }
        public void setStatus(Enrollment.EnrollmentStatus status) { this.status = status; }
        public LocalDate getCompletionDate() { return completionDate; }
        public void setCompletionDate(LocalDate completionDate) { this.completionDate = completionDate; }
        public Double getAttendancePercentage() { return attendancePercentage; }
        public void setAttendancePercentage(Double attendancePercentage) { this.attendancePercentage = attendancePercentage; }
        public Double getAssessmentScore() { return assessmentScore; }
        public void setAssessmentScore(Double assessmentScore) { this.assessmentScore = assessmentScore; }
    }

    // ------------------------------------------------------------------------
    // Assessment DTOs
    // ------------------------------------------------------------------------
    public static class CreateAssessmentRequest {
        @NotNull(message = "Enrollment ID is required")
        private Long enrollmentId;

        @NotBlank(message = "Assessment name is required")
        private String assessmentName;

        @NotNull(message = "Score is required")
        @Min(value = 0, message = "Score cannot be negative")
        private Double score;

        @NotNull(message = "Max score is required")
        @DecimalMin(value = "0.1", message = "Max score must be greater than 0")
        private Double maxScore;

        private LocalDate assessmentDate;

        public CreateAssessmentRequest() {}

        public Long getEnrollmentId() { return enrollmentId; }
        public void setEnrollmentId(Long enrollmentId) { this.enrollmentId = enrollmentId; }
        public String getAssessmentName() { return assessmentName; }
        public void setAssessmentName(String assessmentName) { this.assessmentName = assessmentName; }
        public Double getScore() { return score; }
        public void setScore(Double score) { this.score = score; }
        public Double getMaxScore() { return maxScore; }
        public void setMaxScore(Double maxScore) { this.maxScore = maxScore; }
        public LocalDate getAssessmentDate() { return assessmentDate; }
        public void setAssessmentDate(LocalDate assessmentDate) { this.assessmentDate = assessmentDate; }
    }

    public static class UpdateAssessmentRequest {
        @NotNull(message = "Score is required")
        @Min(value = 0, message = "Score cannot be negative")
        private Double score;

        @NotNull(message = "Max score is required")
        @DecimalMin(value = "0.1", message = "Max score must be greater than 0")
        private Double maxScore;

        @NotBlank(message = "Correction reason is mandatory for auditable score updates")
        private String correctionReason;

        public UpdateAssessmentRequest() {}

        public Double getScore() { return score; }
        public void setScore(Double score) { this.score = score; }
        public Double getMaxScore() { return maxScore; }
        public void setMaxScore(Double maxScore) { this.maxScore = maxScore; }
        public String getCorrectionReason() { return correctionReason; }
        public void setCorrectionReason(String correctionReason) { this.correctionReason = correctionReason; }
    }

    // ------------------------------------------------------------------------
    // Certification DTOs
    // ------------------------------------------------------------------------
    public static class IssueCertificationRequest {
        @NotNull(message = "Enrollment ID is required")
        private Long enrollmentId;

        private String verifyingAuthority;
        private String verificationUrl;

        public IssueCertificationRequest() {}

        public Long getEnrollmentId() { return enrollmentId; }
        public void setEnrollmentId(Long enrollmentId) { this.enrollmentId = enrollmentId; }
        public String getVerifyingAuthority() { return verifyingAuthority; }
        public void setVerifyingAuthority(String verifyingAuthority) { this.verifyingAuthority = verifyingAuthority; }
        public String getVerificationUrl() { return verificationUrl; }
        public void setVerificationUrl(String verificationUrl) { this.verificationUrl = verificationUrl; }
    }

    public static class RevokeCertificateRequest {
        @NotBlank(message = "Revocation reason is required")
        private String revocationReason;

        public RevokeCertificateRequest() {}
        public RevokeCertificateRequest(String revocationReason) { this.revocationReason = revocationReason; }

        public String getRevocationReason() { return revocationReason; }
        public void setRevocationReason(String revocationReason) { this.revocationReason = revocationReason; }
    }

    public static class PublicCertificateVerificationResponse {
        private String certificateNumber;
        private boolean valid;
        private String status;
        private String courseTitle;
        private String verifyingAuthority;
        private LocalDate issueDate;
        private String recipientName; // Only populated if trainee consented
        private LocalDateTime revokedAt;
        private String message;

        public PublicCertificateVerificationResponse() {}

        public String getCertificateNumber() { return certificateNumber; }
        public void setCertificateNumber(String certificateNumber) { this.certificateNumber = certificateNumber; }
        public boolean isValid() { return valid; }
        public void setValid(boolean valid) { this.valid = valid; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getCourseTitle() { return courseTitle; }
        public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }
        public String getVerifyingAuthority() { return verifyingAuthority; }
        public void setVerifyingAuthority(String verifyingAuthority) { this.verifyingAuthority = verifyingAuthority; }
        public LocalDate getIssueDate() { return issueDate; }
        public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
        public String getRecipientName() { return recipientName; }
        public void setRecipientName(String recipientName) { this.recipientName = recipientName; }
        public LocalDateTime getRevokedAt() { return revokedAt; }
        public void setRevokedAt(LocalDateTime revokedAt) { this.revokedAt = revokedAt; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
