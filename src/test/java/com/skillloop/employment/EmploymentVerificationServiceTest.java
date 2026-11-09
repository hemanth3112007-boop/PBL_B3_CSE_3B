package com.skillloop.employment;

import com.skillloop.training.Course;
import com.skillloop.training.Trainee;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmploymentVerificationServiceTest {

    @Mock
    private EmploymentVerificationRepository verificationRepository;

    @Mock
    private EmploymentOutcomeRepository outcomeRepository;

    @InjectMocks
    private EmploymentVerificationService verificationService;

    @Test
    @DisplayName("Employer-confirmed evidence should result in VERIFIED status and HIGH_CONFIDENCE label")
    void testEmployerConfirmedVerificationYieldsHighConfidence() {
        Trainee trainee = new Trainee("TRN-01", "Aarav", "Sharma", "a@test.com", "9999999999", "Bangalore", "B.Sc");
        Course course = new Course("CRS-01", "Data Analytics", "Desc", "DA", 12, "Provider", "Bangalore");
        EmploymentOutcome outcome = new EmploymentOutcome(trainee, course, EmploymentEnums.EmploymentStatus.EMPLOYED,
                "Analyst", "TCS", EmploymentEnums.EmploymentType.FULL_TIME, EmploymentEnums.SalaryBand.RANGE_25K_40K, LocalDate.now());
        outcome.setId(100L);

        when(outcomeRepository.findById(100L)).thenReturn(Optional.of(outcome));
        when(verificationRepository.save(any(EmploymentVerification.class))).thenAnswer(i -> i.getArgument(0));

        EmploymentDtos.SubmitEvidenceRequest req = new EmploymentDtos.SubmitEvidenceRequest();
        req.setSource(EmploymentEnums.VerificationSource.EMPLOYER_CONFIRMED);
        req.setEvidenceType("HR_EMAIL");
        req.setEmployerContactEmail("hr@tcs.com");
        req.setSubmittedByStaff("Hemanth V");

        EmploymentVerification result = verificationService.submitEvidence(100L, req);

        assertNotNull(result);
        assertEquals(EmploymentEnums.VerificationStatus.VERIFIED, result.getStatus());
        assertEquals(EmploymentEnums.DataQualityLabel.HIGH_CONFIDENCE, result.getDataQualityLabel());
        assertEquals(0.95, result.getConfidenceScore());
        assertEquals(EmploymentEnums.VerificationStatus.VERIFIED, outcome.getVerificationStatus());
    }

    @Test
    @DisplayName("Conflicting evidence should set CONFLICT_DETECTED and CONFLICT_FLAGGED")
    void testConflictFlaggedWhenDiscrepancyFound() {
        EmploymentOutcome outcome = new EmploymentOutcome();
        EmploymentVerification verification = new EmploymentVerification();
        verification.setId(200L);
        verification.setOutcome(outcome);
        verification.setSource(EmploymentEnums.VerificationSource.SELF_REPORTED);

        when(verificationRepository.findById(200L)).thenReturn(Optional.of(verification));
        when(verificationRepository.save(any(EmploymentVerification.class))).thenAnswer(i -> i.getArgument(0));

        EmploymentDtos.ReviewVerificationRequest req = new EmploymentDtos.ReviewVerificationRequest();
        req.setStatus(EmploymentEnums.VerificationStatus.CONFLICT_DETECTED);
        req.setConflictFlag(true);
        req.setConflictDetails("Trainee salary does not match offer letter");
        req.setReviewedByStaff("Hemanth V");

        EmploymentVerification reviewed = verificationService.reviewVerification(200L, req);

        assertNotNull(reviewed);
        assertTrue(reviewed.isConflictFlag());
        assertEquals(EmploymentEnums.VerificationStatus.CONFLICT_DETECTED, reviewed.getStatus());
        assertEquals(EmploymentEnums.DataQualityLabel.CONFLICT_FLAGGED, reviewed.getDataQualityLabel());
        assertEquals(0.10, reviewed.getConfidenceScore());
    }
}
