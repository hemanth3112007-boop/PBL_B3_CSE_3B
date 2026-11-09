package com.skillloop.skills;

import com.skillloop.training.Course;
import com.skillloop.training.CourseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SkillGapAnalysisServiceTest {

    @Mock
    private SkillGapAnalysisRepository analysisRepository;

    @Mock
    private CourseSkillRepository courseSkillRepository;

    @Mock
    private JobRequirementRepository jobRequirementRepository;

    @Mock
    private CourseRepository courseRepository;

    private AiSkillExtractionService aiExtractionService;
    private SkillGapAnalysisService gapAnalysisService;

    @BeforeEach
    void setUp() {
        aiExtractionService = new AiSkillExtractionService();
        gapAnalysisService = new SkillGapAnalysisService(
                analysisRepository,
                courseSkillRepository,
                jobRequirementRepository,
                courseRepository,
                aiExtractionService
        );
    }

    @Test
    @DisplayName("Should accurately identify missing Power BI skill and calculate 75% match")
    void testSkillGapCalculationWithMissingSkill() {
        // Arrange
        Course course = new Course("CRS-DA-01", "Data Analytics", "Desc", "Data Analytics", 12, "Provider", "Bangalore");
        course.setId(1L);

        Skill sql = new Skill("SQL", SkillEnums.SkillCategory.DATA_AI, "SQL desc");
        Skill python = new Skill("Python", SkillEnums.SkillCategory.DATA_AI, "Python desc");
        Skill excel = new Skill("Excel", SkillEnums.SkillCategory.TOOL, "Excel desc");
        Skill powerBi = new Skill("Power BI", SkillEnums.SkillCategory.TOOL, "Power BI desc");

        List<CourseSkill> taughtSkills = List.of(
                new CourseSkill(course, sql, SkillEnums.ProficiencyLevel.ADVANCED, 40, true),
                new CourseSkill(course, python, SkillEnums.ProficiencyLevel.INTERMEDIATE, 40, true),
                new CourseSkill(course, excel, SkillEnums.ProficiencyLevel.ADVANCED, 30, true)
        );

        JobRequirement job = new JobRequirement("Junior Data Analyst", "TCS", "IT", "Bangalore",
                com.skillloop.employment.EmploymentEnums.SalaryBand.RANGE_25K_40K, "Job desc");
        job.setId(10L);
        job.getRequiredSkills().addAll(Set.of(sql, python, excel, powerBi));

        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(jobRequirementRepository.findById(10L)).thenReturn(Optional.of(job));
        when(courseSkillRepository.findByCourseId(1L)).thenReturn(taughtSkills);
        when(analysisRepository.save(any(SkillGapAnalysisResult.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        SkillGapAnalysisResult result = gapAnalysisService.analyzeCourseAgainstJob(1L, 10L);

        // Assert
        assertNotNull(result);
        assertEquals(75.0, result.getMatchPercentage());
        assertEquals(SkillEnums.SkillMatchLevel.MODERATE_MATCH, result.getMatchLevel());
        assertTrue(result.getMatchedSkills().contains("SQL"));
        assertTrue(result.getMatchedSkills().contains("Python"));
        assertTrue(result.getMatchedSkills().contains("Excel"));
        assertTrue(result.getMissingSkills().contains("Power BI"));
        assertNotNull(result.getAiExplanation());
        assertTrue(result.getAiExplanation().contains("75.0%"));
    }

    @Test
    @DisplayName("Should accurately extract C++ skill from job description text despite symbol boundary")
    void testExtractCppSkill() {
        String jobDescription = "We are seeking a Backend Software Engineer proficient in C++ and Python for systems programming.";
        List<String> extracted = aiExtractionService.extractSkills(jobDescription);

        assertTrue(extracted.contains("C++"), "C++ should be correctly extracted from text");
        assertTrue(extracted.contains("Python"), "Python should be correctly extracted from text");
    }
}
