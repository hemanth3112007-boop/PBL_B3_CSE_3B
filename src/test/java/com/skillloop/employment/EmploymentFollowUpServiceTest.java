package com.skillloop.employment;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmploymentFollowUpServiceTest {

    @Mock
    private EmploymentFollowUpRepository followUpRepository;

    @InjectMocks
    private EmploymentFollowUpService followUpService;

    @Test
    @DisplayName("Crucial Rule: Unanswered follow-ups must be marked as OUTCOME_UNKNOWN, NEVER as UNEMPLOYED")
    void testNonResponderMarkedAsOutcomeUnknownNeverUnemployed() {
        EmploymentFollowUp followUp = new EmploymentFollowUp();
        followUp.setId(50L);
        followUp.setResponseStatus(EmploymentEnums.FollowUpResponseStatus.PENDING);

        when(followUpRepository.findById(50L)).thenReturn(Optional.of(followUp));
        when(followUpRepository.save(any(EmploymentFollowUp.class))).thenAnswer(i -> i.getArgument(0));

        EmploymentDtos.RecordFollowUpResponseRequest req = new EmploymentDtos.RecordFollowUpResponseRequest();
        req.setResponseStatus(EmploymentEnums.FollowUpResponseStatus.NO_RESPONSE);
        req.setFollowUpNotes("Trainee did not answer after multiple attempts");

        EmploymentFollowUp result = followUpService.recordResponse(50L, req);

        assertNotNull(result);
        assertEquals(EmploymentEnums.FollowUpResponseStatus.NO_RESPONSE, result.getResponseStatus());
        assertEquals(EmploymentEnums.EmploymentStatus.OUTCOME_UNKNOWN, result.getReportedStatus());
        assertNotEquals(EmploymentEnums.EmploymentStatus.UNEMPLOYED, result.getReportedStatus());
    }
}
