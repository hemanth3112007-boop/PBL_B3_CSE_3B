package com.skillloop.training;

import com.skillloop.common.ResourceNotFoundException;
import com.skillloop.config.OwnershipService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CertificationService {

    private final CertificationRepository certificationRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AssessmentRepository assessmentRepository;
    private final OwnershipService ownershipService;

    @Value("${skillloop.certification.min-attendance-percentage:75.0}")
    private double minAttendancePercentage;

    @Value("${skillloop.certification.min-overall-average-percentage:60.0}")
    private double minOverallAveragePercentage;

    @Value("${skillloop.certification.require-completed-enrollment:true}")
    private boolean requireCompletedEnrollment;

    public CertificationService(
            CertificationRepository certificationRepository,
            EnrollmentRepository enrollmentRepository,
            AssessmentRepository assessmentRepository,
            OwnershipService ownershipService) {
        this.certificationRepository = certificationRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.assessmentRepository = assessmentRepository;
        this.ownershipService = ownershipService;
    }

    public Certification getCertificateById(Long id, Authentication authentication) {
        Certification cert = certificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certification not found with id: " + id));

        if (authentication != null) {
            ownershipService.verifyTraineeOwnership(authentication, cert.getEnrollment().getTrainee().getId());
        }
        return cert;
    }

    public Certification getCertificateByEnrollment(Long enrollmentId, Authentication authentication) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found with id: " + enrollmentId));

        if (authentication != null) {
            ownershipService.verifyTraineeOwnership(authentication, enrollment.getTrainee().getId());
        }

        return certificationRepository.findByEnrollmentId(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("No certification issued for enrollment id: " + enrollmentId));
    }

    /**
     * Issues an official certificate after evaluating configurable eligibility policies.
     */
    @Transactional
    public Certification issueCertificate(TrainingDtos.IssueCertificationRequest req) {
        Enrollment enrollment = enrollmentRepository.findById(req.getEnrollmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found with id: " + req.getEnrollmentId()));

        if (requireCompletedEnrollment && enrollment.getStatus() == Enrollment.EnrollmentStatus.DROPPED_OUT) {
            throw new IllegalStateException("Trainee is not eligible for certification: Trainee has dropped out of the course");
        }

        java.util.Optional<Certification> existingCertOpt = certificationRepository.findByEnrollmentId(enrollment.getId());
        if (existingCertOpt.isPresent() && !existingCertOpt.get().isRevoked()) {
            throw new IllegalArgumentException("Certification has already been issued for this enrollment");
        }

        // 1. Attendance Policy Check
        Double attendance = enrollment.getAttendancePercentage();
        if (attendance == null || attendance < minAttendancePercentage) {
            throw new IllegalStateException(
                    String.format("Trainee is not eligible for certification: Attendance (%.1f%%) is below the required threshold (%.1f%%)",
                            attendance != null ? attendance : 0.0, minAttendancePercentage)
            );
        }

        // 2. Assessment Completion and Pass Check
        List<Assessment> assessments = assessmentRepository.findByEnrollmentId(enrollment.getId());
        if (assessments.isEmpty()) {
            throw new IllegalStateException("Trainee is not eligible for certification: No assessments have been recorded for this enrollment");
        }

        boolean anyFailed = assessments.stream().anyMatch(a -> !a.isPassed());
        if (anyFailed) {
            throw new IllegalStateException("Trainee is not eligible for certification: One or more mandatory assessments have not been passed");
        }

        // 3. Overall Average Cutoff Check
        Double avgScore = enrollment.getAssessmentScore();
        if (avgScore == null || avgScore < minOverallAveragePercentage) {
            throw new IllegalStateException(
                    String.format("Trainee is not eligible for certification: Overall assessment score (%.1f%%) is below the minimum required average (%.1f%%)",
                            avgScore != null ? avgScore : 0.0, minOverallAveragePercentage)
            );
        }

        // Eligibility satisfied: generate Certificate
        String courseCode = enrollment.getBatch().getCourse().getCourseCode();
        String uniqueSuffix = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        String certNumber = String.format("CERT-%d-%s-%s", LocalDate.now().getYear(), courseCode, uniqueSuffix);

        String authority = req.getVerifyingAuthority() != null ? req.getVerifyingAuthority() : "SkillLoop Academy Certification Board";
        String docUrl = req.getVerificationUrl() != null ? req.getVerificationUrl() : "https://verify.skillloop.ai/cert/" + certNumber;

        enrollment.setStatus(Enrollment.EnrollmentStatus.COMPLETED);
        enrollment.setCompletionDate(LocalDate.now());
        enrollment.setCertificationIssued(true);
        enrollment.setCertifiedAt(LocalDate.now());
        enrollmentRepository.save(enrollment);

        if (existingCertOpt.isPresent()) {
            // Re-issuing previously revoked certificate
            Certification cert = existingCertOpt.get();
            cert.setCertificateNumber(certNumber);
            cert.setIssueDate(LocalDate.now());
            cert.setVerifyingAuthority(authority);
            cert.setVerificationUrl(docUrl);
            cert.setStatus(Certification.Status.ACTIVE);
            cert.setRevoked(false);
            cert.setRevocationReason(null);
            cert.setRevokedAt(null);
            cert.setRevokedBy(null);
            return certificationRepository.save(cert);
        }

        Certification cert = new Certification(enrollment, certNumber, LocalDate.now(), authority, docUrl);
        cert.setStatus(Certification.Status.ACTIVE);
        cert.setRevoked(false);

        return certificationRepository.save(cert);
    }

    /**
     * Controlled administrator workflow to revoke a certificate with mandatory audit justification.
     */
    @Transactional
    public Certification revokeCertificate(Long id, TrainingDtos.RevokeCertificateRequest req, String adminUsername) {
        Certification cert = certificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certification not found with id: " + id));

        if (cert.isRevoked()) {
            throw new IllegalStateException("Certificate is already revoked");
        }

        cert.setRevoked(true);
        cert.setStatus(Certification.Status.REVOKED);
        cert.setRevocationReason(req.getRevocationReason());
        cert.setRevokedAt(LocalDateTime.now());
        cert.setRevokedBy(adminUsername != null ? adminUsername : "ADMIN");

        Enrollment enrollment = cert.getEnrollment();
        enrollment.setCertificationIssued(false);
        enrollmentRepository.save(enrollment);

        return certificationRepository.save(cert);
    }

    /**
     * Privacy-preserving public credential verification. Returns only non-sensitive, consent-safe verification details.
     */
    public TrainingDtos.PublicCertificateVerificationResponse verifyCertificatePublic(String certificateNumber) {
        TrainingDtos.PublicCertificateVerificationResponse resp = new TrainingDtos.PublicCertificateVerificationResponse();
        resp.setCertificateNumber(certificateNumber);

        Certification cert = certificationRepository.findByCertificateNumber(certificateNumber).orElse(null);
        if (cert == null) {
            resp.setValid(false);
            resp.setStatus("NOT_FOUND");
            resp.setMessage("No official certificate matching this credential identifier was found.");
            return resp;
        }

        if (cert.isRevoked()) {
            resp.setValid(false);
            resp.setStatus("REVOKED");
            resp.setRevokedAt(cert.getRevokedAt());
            resp.setVerifyingAuthority(cert.getVerifyingAuthority());
            resp.setCourseTitle(cert.getEnrollment().getBatch().getCourse().getTitle());
            resp.setMessage("This certificate has been revoked by the issuing institution. Revocation reason on file.");
            return resp;
        }

        Trainee trainee = cert.getEnrollment().getTrainee();
        resp.setValid(true);
        resp.setStatus("ACTIVE");
        resp.setIssueDate(cert.getIssueDate());
        resp.setCourseTitle(cert.getEnrollment().getBatch().getCourse().getTitle());
        resp.setVerifyingAuthority(cert.getVerifyingAuthority());

        if (trainee.isConsentGiven()) {
            resp.setRecipientName(trainee.getFirstName() + " " + trainee.getLastName());
            resp.setMessage("Valid and verified official credential.");
        } else {
            resp.setRecipientName("Withheld");
            resp.setMessage("Valid and verified official credential. Recipient name withheld per privacy preferences.");
        }

        return resp;
    }
}
