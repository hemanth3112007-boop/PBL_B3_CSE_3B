package com.skillloop.training;

import com.skillloop.config.OwnershipService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TraineeServiceTest {

    @Mock
    private TraineeRepository traineeRepository;

    @Mock
    private OwnershipService ownershipService;

    @InjectMocks
    private TraineeService traineeService;

    private Trainee sampleTrainee;

    @BeforeEach
    void setUp() {
        sampleTrainee = new Trainee("TRN-TEST-01", "John", "Doe", "john.doe@example.com", "9876543210", "Bangalore Urban", "B.Tech");
        sampleTrainee.setId(1L);
        sampleTrainee.setActive(true);
    }

    @Test
    @DisplayName("Should successfully register a new trainee with active status true")
    void testRegisterTraineeSuccess() {
        when(traineeRepository.findByTraineeCode("TRN-TEST-01")).thenReturn(Optional.empty());
        when(traineeRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.empty());
        when(traineeRepository.save(any(Trainee.class))).thenAnswer(i -> i.getArgument(0));

        TrainingDtos.CreateTraineeRequest req = new TrainingDtos.CreateTraineeRequest();
        req.setTraineeCode("TRN-TEST-01");
        req.setFirstName("John");
        req.setLastName("Doe");
        req.setEmail("john.doe@example.com");
        req.setPhone("9876543210");
        req.setDistrict("Bangalore Urban");
        req.setEducationLevel("B.Tech");

        Trainee result = traineeService.registerTrainee(req);

        assertNotNull(result);
        assertEquals("TRN-TEST-01", result.getTraineeCode());
        assertTrue(result.isActive());
        verify(traineeRepository, times(1)).save(any(Trainee.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when registering duplicate email")
    void testRegisterDuplicateEmailThrows() {
        when(traineeRepository.findByTraineeCode("TRN-TEST-02")).thenReturn(Optional.empty());
        when(traineeRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(sampleTrainee));

        TrainingDtos.CreateTraineeRequest req = new TrainingDtos.CreateTraineeRequest();
        req.setTraineeCode("TRN-TEST-02");
        req.setEmail("john.doe@example.com");

        assertThrows(IllegalArgumentException.class, () -> traineeService.registerTrainee(req));
        verify(traineeRepository, never()).save(any(Trainee.class));
    }

    @Test
    @DisplayName("Should soft-deactivate trainee on deactivateTrainee call instead of hard deletion")
    void testDeactivateTraineeSoftDelete() {
        when(traineeRepository.findById(1L)).thenReturn(Optional.of(sampleTrainee));
        when(traineeRepository.save(any(Trainee.class))).thenAnswer(i -> i.getArgument(0));

        traineeService.deactivateTrainee(1L);

        assertFalse(sampleTrainee.isActive());
        verify(traineeRepository, times(1)).save(sampleTrainee);
        verify(traineeRepository, never()).delete(any(Trainee.class));
    }
}
