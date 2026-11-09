package com.skillloop.training;

import com.skillloop.config.OwnershipService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CertificationAndAssessmentServiceTest {

    @Mock
    private CertificationRepository certificationRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private AssessmentRepository assessmentRepository;

    @Mock
    private OwnershipService ownershipService;

    @InjectMocks
    private CertificationService certificationService;

    @InjectMocks
    private AssessmentService assessmentService;

    private Enrollment enrollment;
    private Course course;
    private Batch batch;
    private Trainee trainee;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(certificationService, "minAttendancePercentage", 75.0);
        ReflectionTestUtils.setField(certificationService, "minOverallAveragePercentage", 60.0);
        ReflectionTestUtils.setField(certificationService, "requireCompletedEnrollment", true);
        ReflectionTestUtils.setField(assessmentService, "passPercentageCutoff", 50.0);

        trainee = new Trainee("TRN-01", "Aarav", "Sharma", "aarav@test.com", "9845012341", "Bangalore", "B.Sc");
        trainee.setId(10L);
        trainee.setConsentGiven(true);

        course = new Course("CRS-DA-01", "Data Analytics", "Desc", "DA", 12, "DSATM", "Bangalore");
        course.setId(20L);

        batch = new Batch("BAT-01", course, LocalDate.now().minusMonths(3), LocalDate.now(), "Trainer", 30);
        batch.setId(30L);

        enrollment = new Enrollment(trainee, batch, batch.getStartDate(), Enrollment.EnrollmentStatus.ENROLLED);
        enrollment.setId(100L);
        enrollment.setAttendancePercentage(80.0);
        enrollment.setAssessmentScore(75.0);
    }

    @Test
    @DisplayName("Should reject certification issuance if trainee attendance is below configurable threshold")
    void testIssueCertificateRejectsLowAttendance() {
        enrollment.setAttendancePercentage(70.0); // Below 75.0%

        when(enrollmentRepository.findById(100L)).thenReturn(Optional.of(enrollment));
        when(certificationRepository.findByEnrollmentId(100L)).thenReturn(Optional.empty());

        TrainingDtos.IssueCertificationRequest req = new TrainingDtos.IssueCertificationRequest();
        req.setEnrollmentId(100L);

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> certificationService.issueCertificate(req));

        assertTrue(ex.getMessage().contains("Attendance"));
        verify(certificationRepository, never()).save(any(Certification.class));
    }

    @Test
    @DisplayName("Should reject certification issuance if any mandatory assessment is failed")
    void testIssueCertificateRejectsFailedAssessment() {
        when(enrollmentRepository.findById(100L)).thenReturn(Optional.of(enrollment));
        when(certificationRepository.findByEnrollmentId(100L)).thenReturn(Optional.empty());

        Assessment passedAssessment = new Assessment(enrollment, "Mid-term", 40.0, 50.0, true, LocalDate.now());
        Assessment failedAssessment = new Assessment(enrollment, "Final", 20.0, 50.0, false, LocalDate.now());

        when(assessmentRepository.findByEnrollmentId(100L)).thenReturn(List.of(passedAssessment, failedAssessment));

        TrainingDtos.IssueCertificationRequest req = new TrainingDtos.IssueCertificationRequest();
        req.setEnrollmentId(100L);

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> certificationService.issueCertificate(req));

        assertTrue(ex.getMessage().contains("mandatory assessments have not been passed"));
        verify(certificationRepository, never()).save(any(Certification.class));
    }

    @Test
    @DisplayName("Should successfully issue certificate when all academic eligibility criteria are satisfied")
    void testIssueCertificateSuccess() {
        when(enrollmentRepository.findById(100L)).thenReturn(Optional.of(enrollment));
        when(certificationRepository.findByEnrollmentId(100L)).thenReturn(Optional.empty());

        Assessment passedAssessment = new Assessment(enrollment, "Capstone", 45.0, 50.0, true, LocalDate.now());
        when(assessmentRepository.findByEnrollmentId(100L)).thenReturn(List.of(passedAssessment));
        when(certificationRepository.save(any(Certification.class))).thenAnswer(i -> i.getArgument(0));

        TrainingDtos.IssueCertificationRequest req = new TrainingDtos.IssueCertificationRequest();
        req.setEnrollmentId(100L);
        req.setVerifyingAuthority("Board of Technical Examinations");

        Certification result = certificationService.issueCertificate(req);

        assertNotNull(result);
        assertTrue(result.getCertificateNumber().startsWith("CERT-"));
        assertEquals(Certification.Status.ACTIVE, result.getStatus());
        assertFalse(result.isRevoked());
        assertEquals(Enrollment.EnrollmentStatus.COMPLETED, enrollment.getStatus());
        assertTrue(enrollment.isCertificationIssued());
        verify(certificationRepository, times(1)).save(any(Certification.class));
    }

    @Test
    @DisplayName("Should successfully execute controlled certificate revocation with audit reason")
    void testRevokeCertificateWorkflow() {
        Certification cert = new Certification(enrollment, "CERT-2026-CRS-DA-01-A1B2", LocalDate.now(), "Board", "https://verify.url");
        cert.setId(500L);
        cert.setStatus(Certification.Status.ACTIVE);
        cert.setRevoked(false);

        when(certificationRepository.findById(500L)).thenReturn(Optional.of(cert));
        when(certificationRepository.save(any(Certification.class))).thenAnswer(i -> i.getArgument(0));

        TrainingDtos.RevokeCertificateRequest req = new TrainingDtos.RevokeCertificateRequest("Plagiarism detected in submission");
        Certification revoked = certificationService.revokeCertificate(500L, req, "admin_user");

        assertNotNull(revoked);
        assertTrue(revoked.isRevoked());
        assertEquals(Certification.Status.REVOKED, revoked.getStatus());
        assertEquals("Plagiarism detected in submission", revoked.getRevocationReason());
        assertEquals("admin_user", revoked.getRevokedBy());
        assertNotNull(revoked.getRevokedAt());
        assertFalse(enrollment.isCertificationIssued());
    }

    @Test
    @DisplayName("Public certificate verification should respect privacy and return safe summary")
    void testPublicCertificateVerificationPrivacy() {
        Certification cert = new Certification(enrollment, "CERT-2026-CRS-DA-01-X9Y8", LocalDate.now(), "State Board", "https://verify.url");
        when(certificationRepository.findByCertificateNumber("CERT-2026-CRS-DA-01-X9Y8")).thenReturn(Optional.of(cert));

        TrainingDtos.PublicCertificateVerificationResponse resp = certificationService.verifyCertificatePublic("CERT-2026-CRS-DA-01-X9Y8");

        assertNotNull(resp);
        assertTrue(resp.isValid());
        assertEquals("ACTIVE", resp.getStatus());
        assertEquals("Aarav Sharma", resp.getRecipientName());
        assertEquals("Data Analytics", resp.getCourseTitle());
    }

    @Test
    @DisplayName("Should reject certification issuance if trainee dropped out of the course")
    void testIssueCertificateRejectsDroppedOut() {
        enrollment.setStatus(Enrollment.EnrollmentStatus.DROPPED_OUT);

        when(enrollmentRepository.findById(100L)).thenReturn(Optional.of(enrollment));

        TrainingDtos.IssueCertificationRequest req = new TrainingDtos.IssueCertificationRequest();
        req.setEnrollmentId(100L);

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> certificationService.issueCertificate(req));

        assertTrue(ex.getMessage().contains("dropped out"));
        verify(certificationRepository, never()).save(any(Certification.class));
    }

    @Test
    @DisplayName("Should allow reissuing a certificate if previous certificate was revoked")
    void testReissueRevokedCertificate() {
        Certification revokedCert = new Certification(enrollment, "CERT-OLD-REVOKED", LocalDate.now().minusMonths(1), "Board", "https://verify.url");
        revokedCert.setRevoked(true);
        revokedCert.setStatus(Certification.Status.REVOKED);

        when(enrollmentRepository.findById(100L)).thenReturn(Optional.of(enrollment));
        when(certificationRepository.findByEnrollmentId(100L)).thenReturn(Optional.of(revokedCert));

        Assessment passedAssessment = new Assessment(enrollment, "Capstone", 45.0, 50.0, true, LocalDate.now());
        when(assessmentRepository.findByEnrollmentId(100L)).thenReturn(List.of(passedAssessment));
        when(certificationRepository.save(any(Certification.class))).thenAnswer(i -> i.getArgument(0));

        TrainingDtos.IssueCertificationRequest req = new TrainingDtos.IssueCertificationRequest();
        req.setEnrollmentId(100L);
        req.setVerifyingAuthority("New Board");

        Certification result = certificationService.issueCertificate(req);

        assertNotNull(result);
        assertFalse(result.isRevoked());
        assertEquals(Certification.Status.ACTIVE, result.getStatus());
        assertNull(result.getRevocationReason());
        assertTrue(enrollment.isCertificationIssued());
    }
}
