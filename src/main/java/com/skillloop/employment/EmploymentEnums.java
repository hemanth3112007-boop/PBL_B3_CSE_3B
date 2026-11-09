package com.skillloop.employment;

public class EmploymentEnums {

    public enum EmploymentStatus {
        EMPLOYED,
        UNEMPLOYED,
        SELF_EMPLOYED,
        APPRENTICESHIP,
        FURTHER_EDUCATION,
        OUTCOME_UNKNOWN // Non-responders are NEVER counted as unemployed
    }

    public enum EmploymentType {
        FULL_TIME,
        PART_TIME,
        CONTRACT,
        FREELANCE,
        INTERNSHIP,
        NOT_APPLICABLE
    }

    public enum SalaryBand {
        BELOW_15K("Below ₹15,000 / month"),
        RANGE_15K_25K("₹15,000 - ₹25,000 / month"),
        RANGE_25K_40K("₹25,000 - ₹40,000 / month"),
        ABOVE_40K("Above ₹40,000 / month"),
        UNDISCLOSED("Undisclosed / Not Applicable");

        private final String label;

        SalaryBand(String label) {
            this.label = label;
        }

        public String getLabel() {
            return label;
        }
    }

    public enum RetentionStatus {
        STILL_EMPLOYED,
        PROMOTED,
        CHANGED_JOB,
        LEFT_JOB,
        TERMINATED,
        NOT_APPLICABLE
    }

    public enum JobRelevance {
        HIGHLY_RELEVANT,
        SOMEWHAT_RELEVANT,
        NOT_RELEVANT,
        UNKNOWN
    }

    public enum FollowUpMilestone {
        MONTH_3,
        MONTH_6,
        MONTH_12
    }

    public enum FollowUpChannel {
        SMS,
        WHATSAPP,
        WEB,
        STAFF_CALL
    }

    public enum FollowUpResponseStatus {
        PENDING,
        RESPONDED,
        NO_RESPONSE
    }

    public enum VerificationSource {
        SELF_REPORTED,
        EMPLOYER_CONFIRMED,
        INDEPENDENTLY_CORROBORATED,
        UNVERIFIED
    }

    public enum VerificationStatus {
        VERIFIED,
        PENDING_REVIEW,
        CONFLICT_DETECTED,
        UNVERIFIED
    }

    public enum DataQualityLabel {
        HIGH_CONFIDENCE,
        MEDIUM_CONFIDENCE,
        LOW_CONFIDENCE,
        CONFLICT_FLAGGED
    }
}

