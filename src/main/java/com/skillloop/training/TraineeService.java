package com.skillloop.training;

import com.skillloop.common.ResourceNotFoundException;
import com.skillloop.config.OwnershipService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TraineeService {

    private final TraineeRepository traineeRepository;
    private final OwnershipService ownershipService;

    public TraineeService(TraineeRepository traineeRepository, OwnershipService ownershipService) {
        this.traineeRepository = traineeRepository;
        this.ownershipService = ownershipService;
    }

    public List<Trainee> getAllTrainees(boolean includeInactive) {
        if (includeInactive) {
            return traineeRepository.findAll();
        }
        return traineeRepository.findByActiveTrue();
    }

    public Trainee getTraineeById(Long id, Authentication authentication) {
        if (authentication != null) {
            ownershipService.verifyTraineeOwnership(authentication, id);
        }
        return traineeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trainee not found with id: " + id));
    }

    public List<Trainee> getTraineesByDistrict(String district) {
        return traineeRepository.findByDistrictIgnoreCaseAndActiveTrue(district);
    }

    @Transactional
    public Trainee registerTrainee(TrainingDtos.CreateTraineeRequest req) {
        if (traineeRepository.findByTraineeCode(req.getTraineeCode()).isPresent()) {
            throw new IllegalArgumentException("Trainee with code " + req.getTraineeCode() + " already exists");
        }
        if (traineeRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Trainee with email " + req.getEmail() + " already exists");
        }

        Trainee trainee = new Trainee(
                req.getTraineeCode(),
                req.getFirstName(),
                req.getLastName(),
                req.getEmail(),
                req.getPhone(),
                req.getDistrict(),
                req.getEducationLevel()
        );
        trainee.setDateOfBirth(req.getDateOfBirth());
        trainee.setGender(req.getGender());
        trainee.setConsentGiven(req.isConsentGiven());
        trainee.setActive(true);

        return traineeRepository.save(trainee);
    }

    @Transactional
    public Trainee updateTrainee(Long id, TrainingDtos.UpdateTraineeRequest req, Authentication authentication) {
        if (authentication != null) {
            ownershipService.verifyTraineeOwnership(authentication, id);
        }

        Trainee trainee = traineeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trainee not found with id: " + id));

        if (req.getFirstName() != null) trainee.setFirstName(req.getFirstName());
        if (req.getLastName() != null) trainee.setLastName(req.getLastName());
        if (req.getPhone() != null) trainee.setPhone(req.getPhone());
        if (req.getDistrict() != null) trainee.setDistrict(req.getDistrict());
        if (req.getDateOfBirth() != null) trainee.setDateOfBirth(req.getDateOfBirth());
        if (req.getGender() != null) trainee.setGender(req.getGender());
        if (req.getEducationLevel() != null) trainee.setEducationLevel(req.getEducationLevel());
        if (req.getConsentGiven() != null) trainee.setConsentGiven(req.getConsentGiven());
        if (req.getActive() != null) {
            boolean isStaffOrAdmin = authentication != null && authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_ADMIN")
                            || a.getAuthority().equalsIgnoreCase("ROLE_INSTITUTE_STAFF")
                            || a.getAuthority().equalsIgnoreCase("ADMIN")
                            || a.getAuthority().equalsIgnoreCase("INSTITUTE_STAFF"));
            if (isStaffOrAdmin) {
                trainee.setActive(req.getActive());
                if (trainee.getUser() != null) {
                    trainee.getUser().setActive(req.getActive());
                }
            } else {
                throw new AccessDeniedException("Only institute staff or administrators can modify trainee active status");
            }
        }

        return traineeRepository.save(trainee);
    }

    @Transactional
    public void deactivateTrainee(Long id) {
        Trainee trainee = traineeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trainee not found with id: " + id));
        trainee.setActive(false);
        if (trainee.getUser() != null) {
            trainee.getUser().setActive(false);
        }
        traineeRepository.save(trainee);
    }
}
