package com.skillloop.employment;

import com.skillloop.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmploymentVerificationService {

    private final EmploymentVerificationRepository verificationRepository;
    private final EmploymentOutcomeRepository outcomeRepository;

    public EmploymentVerificationService(
            EmploymentVerificationRepository verificationRepository,
            EmploymentOutcomeRepository outcomeRepository) {
        this.verificationRepository = verificationRepository;
        this.outcomeRepository = outcomeRepository;
    }

    public List<EmploymentVerification> getVerificationsByOutcome(Long outcomeId) {
        return verificationRepository.findByOutcomeId(outcomeId);
    }

    public List<EmploymentVerification> getPendingVerifications() {
        return verificationRepository.findByStatus(EmploymentEnums.VerificationStatus.PENDING_REVIEW);
    }

    public List<EmploymentVerification> getConflictVerifications() {
        return verificationRepository.findByConflictFlagTrue();
    }

    public List<EmploymentVerification> getAllVerifications() {
        return verificationRepository.findAll();
    }

    @Transactional
    public EmploymentVerification submitEvidence(Long outcomeId, EmploymentDtos.SubmitEvidenceRequest req) {
        EmploymentOutcome outcome = outcomeRepository.findById(outcomeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employment outcome not found with id: " + outcomeId));

        EmploymentVerification verification = new EmploymentVerification();
        verification.setOutcome(outcome);
        verification.setSource(req.getSource());
        verification.setEvidenceType(req.getEvidenceType());
        verification.setEvidenceDocumentUrl(req.getEvidenceDocumentUrl());
        verification.setEmployerContactPerson(req.getEmployerContactPerson());
        verification.setEmployerContactPhone(req.getEmployerContactPhone());
        verification.setEmployerContactEmail(req.getEmployerContactEmail());
        verification.setVerificationNotes(req.getVerificationNotes());
        verification.setVerifiedByStaff(req.getSubmittedByStaff());

        // Calculate quality metric & verification status
        verification.updateQualityMetrics();

        // Sync with outcome: only overwrite if outcome is not already VERIFIED or if the verification is VERIFIED
        if (outcome.getVerificationStatus() != EmploymentEnums.VerificationStatus.VERIFIED ||
                verification.getStatus() == EmploymentEnums.VerificationStatus.VERIFIED) {
            outcome.setVerificationSource(verification.getSource());
            outcome.setVerificationStatus(verification.getStatus());
            outcome.setDataQualityLabel(verification.getDataQualityLabel());
            outcomeRepository.save(outcome);
        }

        return verificationRepository.save(verification);
    }

    @Transactional
    public EmploymentVerification reviewVerification(Long verificationId, EmploymentDtos.ReviewVerificationRequest req) {
        EmploymentVerification verification = verificationRepository.findById(verificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Verification record not found with id: " + verificationId));

        verification.setStatus(req.getStatus());
        verification.setConflictFlag(req.isConflictFlag());
        verification.setConflictDetails(req.getConflictDetails());
        if (req.getVerificationNotes() != null) {
            verification.setVerificationNotes(req.getVerificationNotes());
        }
        if (req.getReviewedByStaff() != null) {
            verification.setVerifiedByStaff(req.getReviewedByStaff());
        }
        verification.setVerifiedAt(LocalDateTime.now());

        if (req.isConflictFlag() || req.getStatus() == EmploymentEnums.VerificationStatus.CONFLICT_DETECTED) {
            verification.setStatus(EmploymentEnums.VerificationStatus.CONFLICT_DETECTED);
            verification.setDataQualityLabel(EmploymentEnums.DataQualityLabel.CONFLICT_FLAGGED);
            verification.setConfidenceScore(0.10);
        } else if (req.getStatus() == EmploymentEnums.VerificationStatus.VERIFIED) {
            if (verification.getSource() == EmploymentEnums.VerificationSource.EMPLOYER_CONFIRMED ||
                    verification.getSource() == EmploymentEnums.VerificationSource.INDEPENDENTLY_CORROBORATED) {
                verification.setDataQualityLabel(EmploymentEnums.DataQualityLabel.HIGH_CONFIDENCE);
                verification.setConfidenceScore(0.95);
            } else {
                verification.setDataQualityLabel(EmploymentEnums.DataQualityLabel.MEDIUM_CONFIDENCE);
                verification.setConfidenceScore(0.80);
            }
        } else if (req.getStatus() == EmploymentEnums.VerificationStatus.UNVERIFIED) {
            verification.setDataQualityLabel(EmploymentEnums.DataQualityLabel.LOW_CONFIDENCE);
            verification.setConfidenceScore(0.20);
        } else if (req.getStatus() == EmploymentEnums.VerificationStatus.PENDING_REVIEW) {
            verification.setDataQualityLabel(EmploymentEnums.DataQualityLabel.LOW_CONFIDENCE);
            verification.setConfidenceScore(0.40);
        }

        // Sync back to outcome
        EmploymentOutcome outcome = verification.getOutcome();
        outcome.setVerificationStatus(verification.getStatus());
        outcome.setDataQualityLabel(verification.getDataQualityLabel());
        outcomeRepository.save(outcome);

        return verificationRepository.save(verification);
    }
}
