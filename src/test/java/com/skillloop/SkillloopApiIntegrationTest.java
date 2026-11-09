package com.skillloop;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(username = "admin", roles = {"ADMIN"})
class SkillloopApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/analytics/overview should return overall KPIs for admin dashboard")
    void testGetOverviewAnalytics() throws Exception {
        mockMvc.perform(get("/api/analytics/overview")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalTrainees", greaterThan(0)))
                .andExpect(jsonPath("$.data.totalEmployed", greaterThan(0)))
                .andExpect(jsonPath("$.data.positiveOutcomeRate", greaterThan(0.0)));
    }

    @Test
    @DisplayName("GET /api/analytics/longitudinal should return 3, 6, 12 months retention metrics")
    void testGetLongitudinalRetention() throws Exception {
        mockMvc.perform(get("/api/analytics/longitudinal")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(3)))
                .andExpect(jsonPath("$.data[0].milestone").value("3 Months"));
    }

    @Test
    @DisplayName("GET /api/analytics/course-performance should return performance rankings across courses")
    void testGetCoursePerformance() throws Exception {
        mockMvc.perform(get("/api/analytics/course-performance")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", not(empty())));
    }

    @Test
    @DisplayName("GET /api/skill-gap should return skill-gap analysis results")
    void testGetSkillGapAnalyses() throws Exception {
        mockMvc.perform(get("/api/skill-gap")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", not(empty())))
                .andExpect(jsonPath("$.data[0].missingSkills", notNullValue()));
    }

    @Test
    @DisplayName("GET /api/recommendations should return reviewable curriculum improvements")
    void testGetRecommendations() throws Exception {
        mockMvc.perform(get("/api/recommendations")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", not(empty())))
                .andExpect(jsonPath("$.data[0].hypothesisNote", notNullValue()));
    }

    @Test
    @DisplayName("GET /api/verifications/conflicts should return flagged conflicting records for audit")
    void testGetConflictingVerifications() throws Exception {
        mockMvc.perform(get("/api/verifications/conflicts")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data[0].conflictFlag").value(true));
    }
}
