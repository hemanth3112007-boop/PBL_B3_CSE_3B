package com.skillloop.training;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillloop.auth.AuthDtos;
import com.skillloop.auth.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AcademicApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Public registration should unconditionally assign Role.TRAINEE even if another role is requested")
    void testPublicRegistrationDefaultsToTrainee() throws Exception {
        AuthDtos.RegisterRequest req = new AuthDtos.RegisterRequest();
        req.setUsername("newstudent_" + System.currentTimeMillis());
        req.setEmail("newstudent_" + System.currentTimeMillis() + "@skillloop.ai");
        req.setPassword("Password123!");
        req.setFullName("New Enrolled Student");
        req.setRole(Role.ADMIN); // Attempt privilege escalation!

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.role").value("TRAINEE")); // Overridden to TRAINEE
    }

    @Test
    @DisplayName("Unauthenticated request to protected endpoint should return 401 Unauthorized")
    void testProtectedEndpointReturns401WhenUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/trainees"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Public certificate verification endpoint should be accessible without authentication")
    void testPublicCertificateVerificationIsPublic() throws Exception {
        mockMvc.perform(get("/api/certifications/verify/NON-EXISTENT-CERT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.valid").value(false))
                .andExpect(jsonPath("$.data.status").value("NOT_FOUND"));
    }

    @Test
    @DisplayName("STAFF or ADMIN should be able to create and retrieve courses")
    @WithMockUser(username = "harshit", roles = {"INSTITUTE_STAFF"})
    void testStaffCanManageCourses() throws Exception {
        String uniqueCode = "CRS-TEST-" + System.currentTimeMillis();
        TrainingDtos.CreateCourseRequest req = new TrainingDtos.CreateCourseRequest();
        req.setCourseCode(uniqueCode);
        req.setTitle("Cybersecurity Operations");
        req.setDescription("Network defense and SOC analyst skills");
        req.setDomainSector("Cybersecurity");
        req.setDurationWeeks(14);
        req.setProviderName("DSATM Skills Academy");
        req.setDistrict("Bangalore Urban");

        mockMvc.perform(post("/api/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.courseCode").value(uniqueCode));
    }

    @Test
    @DisplayName("STAFF or ADMIN should be able to create and retrieve training batches")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testAdminCanManageBatches() throws Exception {
        TrainingDtos.CreateBatchRequest req = new TrainingDtos.CreateBatchRequest();
        req.setBatchCode("BAT-TEST-" + System.currentTimeMillis());
        req.setCourseId(1L);
        req.setStartDate(LocalDate.now());
        req.setEndDate(LocalDate.now().plusMonths(3));
        req.setTrainerName("Expert Instructor");
        req.setMaxCapacity(25);

        mockMvc.perform(post("/api/batches")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.maxCapacity").value(25));
    }

    @Test
    @DisplayName("ADMIN can provision staff accounts via /api/admin/users")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testAdminCanProvisionStaffUser() throws Exception {
        AuthDtos.RegisterRequest req = new AuthDtos.RegisterRequest();
        req.setUsername("newstaff_" + System.currentTimeMillis());
        req.setEmail("newstaff_" + System.currentTimeMillis() + "@skillloop.ai");
        req.setPassword("StaffPass123!");
        req.setFullName("New Staff Member");
        req.setRole(Role.INSTITUTE_STAFF);

        mockMvc.perform(post("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.role").value("INSTITUTE_STAFF"));
    }

    @Test
    @DisplayName("Cross-module ownership: Admin and Staff can view trainee employment records")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testAdminCanAccessEmploymentModule() throws Exception {
        mockMvc.perform(get("/api/employment/trainee/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Cross-module ownership: Trainee is forbidden from accessing another trainee's employment records")
    @WithMockUser(username = "unauthorized_trainee", roles = {"TRAINEE"})
    void testTraineeForbiddenFromOtherTraineeEmployment() throws Exception {
        mockMvc.perform(get("/api/employment/trainee/1"))
                .andExpect(status().isForbidden());
    }
}
