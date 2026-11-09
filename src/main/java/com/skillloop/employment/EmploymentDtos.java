package com.skillloop.employment;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class EmploymentDtos {

    public static class CreateEmploymentOutcomeRequest {
        @NotNull(message = "Trainee ID is required")
        private Long traineeId;

        @NotNull(message = "Course ID is required")
        private Long courseId;

        @NotNull(message = "Employment status is required")
        private EmploymentEnums.EmploymentStatus status;

        private String jobRole;
        private String organization;
        private String industrySector;
        private EmploymentEnums.EmploymentType employmentType;
        private EmploymentEnums.SalaryBand salaryBand;
        private Double exactMonthlySalary;
        private LocalDate joiningDate;
        private EmploymentEnums.RetentionStatus retentionStatus;
        private EmploymentEnums.JobRelevance jobRelevance;
        private String notes;

        public CreateEmploymentOutcomeRequest() {}

        public Long getTraineeId() {
            return traineeId;
        }

        public void setTraineeId(Long traineeId) {
            this.traineeId = traineeId;
        }

        public Long getCourseId() {
            return courseId;
        }

        public void setCourseId(Long courseId) {
            this.courseId = courseId;
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

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }
    }

    public static class UpdateEmploymentOutcomeRequest {
        private EmploymentEnums.EmploymentStatus status;
        private String jobRole;
        private String organization;
        private String industrySector;
        private EmploymentEnums.EmploymentType employmentType;
        private EmploymentEnums.SalaryBand salaryBand;
        private Double exactMonthlySalary;
        private LocalDate joiningDate;
        private EmploymentEnums.RetentionStatus retentionStatus;
        private EmploymentEnums.JobRelevance jobRelevance;
        private String notes;

        public UpdateEmploymentOutcomeRequest() {}

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

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }
    }

    public static class RecordFollowUpResponseRequest {
        @NotNull(message = "Response status is required")
        private EmploymentEnums.FollowUpResponseStatus responseStatus;

        private EmploymentEnums.FollowUpChannel channel;
        private EmploymentEnums.EmploymentStatus reportedStatus;
        private String currentJobRole;
        private String currentOrganization;
        private EmploymentEnums.SalaryBand currentSalaryBand;
        private EmploymentEnums.RetentionStatus retentionStatus;
        private String followUpNotes;
        private String recordedByStaff;

        public RecordFollowUpResponseRequest() {}

        public EmploymentEnums.FollowUpResponseStatus getResponseStatus() {
            return responseStatus;
        }

        public void setResponseStatus(EmploymentEnums.FollowUpResponseStatus responseStatus) {
            this.responseStatus = responseStatus;
        }

        public EmploymentEnums.FollowUpChannel getChannel() {
            return channel;
        }

        public void setChannel(EmploymentEnums.FollowUpChannel channel) {
            this.channel = channel;
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
    }

    public static class SubmitEvidenceRequest {
        @NotNull(message = "Verification source is required")
        private EmploymentEnums.VerificationSource source;

        private String evidenceType;
        private String evidenceDocumentUrl;
        private String employerContactPerson;
        private String employerContactPhone;
        private String employerContactEmail;
        private String verificationNotes;
        private String submittedByStaff;

        public SubmitEvidenceRequest() {}

        public EmploymentEnums.VerificationSource getSource() {
            return source;
        }

        public void setSource(EmploymentEnums.VerificationSource source) {
            this.source = source;
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

        public String getVerificationNotes() {
            return verificationNotes;
        }

        public void setVerificationNotes(String verificationNotes) {
            this.verificationNotes = verificationNotes;
        }

        public String getSubmittedByStaff() {
            return submittedByStaff;
        }

        public void setSubmittedByStaff(String submittedByStaff) {
            this.submittedByStaff = submittedByStaff;
        }
    }

    public static class ReviewVerificationRequest {
        @NotNull(message = "Verification status is required")
        private EmploymentEnums.VerificationStatus status;

        private boolean conflictFlag;
        private String conflictDetails;
        private String verificationNotes;
        private String reviewedByStaff;

        public ReviewVerificationRequest() {}

        public EmploymentEnums.VerificationStatus getStatus() {
            return status;
        }

        public void setStatus(EmploymentEnums.VerificationStatus status) {
            this.status = status;
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

        public String getReviewedByStaff() {
            return reviewedByStaff;
        }

        public void setReviewedByStaff(String reviewedByStaff) {
            this.reviewedByStaff = reviewedByStaff;
        }
    }
}

