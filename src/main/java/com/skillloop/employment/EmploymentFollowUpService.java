package com.skillloop.employment;

import com.skillloop.common.ResourceNotFoundException;
import com.skillloop.training.Trainee;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class EmploymentFollowUpService {

    private final EmploymentFollowUpRepository followUpRepository;

    public EmploymentFollowUpService(EmploymentFollowUpRepository followUpRepository) {
        this.followUpRepository = followUpRepository;
    }

    public List<EmploymentFollowUp> getFollowUpsByTrainee(Long traineeId) {
        return followUpRepository.findByTraineeIdOrderByScheduledDateAsc(traineeId);
    }

    public List<EmploymentFollowUp> getFollowUpsByMilestone(EmploymentEnums.FollowUpMilestone milestone) {
        return followUpRepository.findByMilestone(milestone);
    }

    public List<EmploymentFollowUp> getAllFollowUps(EmploymentEnums.FollowUpResponseStatus status) {
        if (status != null) {
            return followUpRepository.findByResponseStatus(status);
        }
        return followUpRepository.findAll();
    }

    public EmploymentFollowUp getFollowUpById(Long id) {
        return followUpRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up record not found with id: " + id));
    }

    @Transactional
    public void scheduleMilestonesForTrainee(Trainee trainee, EmploymentOutcome outcome, LocalDate baseDate) {
        List<EmploymentFollowUp> existing = outcome.getId() != null
                ? followUpRepository.findByOutcomeId(outcome.getId())
                : List.of();
        if (!existing.isEmpty()) {
            return; // Already scheduled for this outcome
        }

        EmploymentFollowUp m3 = new EmploymentFollowUp(
                trainee, outcome, EmploymentEnums.FollowUpMilestone.MONTH_3,
                baseDate.plusMonths(3), EmploymentEnums.FollowUpChannel.WHATSAPP);

        EmploymentFollowUp m6 = new EmploymentFollowUp(
                trainee, outcome, EmploymentEnums.FollowUpMilestone.MONTH_6,
                baseDate.plusMonths(6), EmploymentEnums.FollowUpChannel.SMS);

        EmploymentFollowUp m12 = new EmploymentFollowUp(
                trainee, outcome, EmploymentEnums.FollowUpMilestone.MONTH_12,
                baseDate.plusMonths(12), EmploymentEnums.FollowUpChannel.WEB);

        followUpRepository.saveAll(List.of(m3, m6, m12));
    }

    @Transactional
    public EmploymentFollowUp recordResponse(Long followUpId, EmploymentDtos.RecordFollowUpResponseRequest req) {
        EmploymentFollowUp followUp = getFollowUpById(followUpId);

        followUp.setResponseStatus(req.getResponseStatus());
        followUp.setContactDate(LocalDate.now());

        if (req.getChannel() != null) {
            followUp.setChannel(req.getChannel());
        }

        if (req.getResponseStatus() == EmploymentEnums.FollowUpResponseStatus.NO_RESPONSE) {
            // Rule: Unanswered follow-ups are marked as OUTCOME_UNKNOWN, NEVER as UNEMPLOYED
            followUp.setReportedStatus(EmploymentEnums.EmploymentStatus.OUTCOME_UNKNOWN);
            followUp.setFollowUpNotes(req.getFollowUpNotes() != null ? req.getFollowUpNotes() : "Trainee could not be reached via " + followUp.getChannel());
        } else if (req.getResponseStatus() == EmploymentEnums.FollowUpResponseStatus.RESPONDED) {
            if (req.getReportedStatus() == null) {
                throw new IllegalArgumentException("Reported employment status is required when recording a trainee response");
            }
            followUp.setReportedStatus(req.getReportedStatus());
            followUp.setCurrentJobRole(req.getCurrentJobRole());
            followUp.setCurrentOrganization(req.getCurrentOrganization());
            followUp.setCurrentSalaryBand(req.getCurrentSalaryBand());
            followUp.setRetentionStatus(req.getRetentionStatus() != null ? req.getRetentionStatus() : EmploymentEnums.RetentionStatus.NOT_APPLICABLE);
            followUp.setFollowUpNotes(req.getFollowUpNotes());

            // If an outcome exists, update its retention status & salary band with the latest follow-up signal
            if (followUp.getOutcome() != null && req.getRetentionStatus() != null) {
                followUp.getOutcome().setRetentionStatus(req.getRetentionStatus());
                if (req.getCurrentSalaryBand() != null) {
                    followUp.getOutcome().setSalaryBand(req.getCurrentSalaryBand());
                }
            }
        }

        if (req.getRecordedByStaff() != null) {
            followUp.setRecordedByStaff(req.getRecordedByStaff());
        }

        return followUpRepository.save(followUp);
    }
}
