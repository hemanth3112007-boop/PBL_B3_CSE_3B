package com.skillloop.skills;

import com.skillloop.training.Course;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "skill_gap_analysis_results")
public class SkillGapAnalysisResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_requirement_id", nullable = false)
    private JobRequirement jobRequirement;

    @Column(nullable = false)
    private Double matchPercentage;

    @Column(length = 1000)
    private String matchedSkills; // Comma-delimited: e.g. "Python, SQL, Statistics"

    @Column(length = 1000)
    private String missingSkills; // Comma-delimited: e.g. "Power BI, DAX, AWS Glue"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SkillEnums.SkillMatchLevel matchLevel;

    @Column(length = 3000)
    private String aiExplanation;

    @Column(nullable = false, updatable = false)
    private LocalDateTime analyzedAt = LocalDateTime.now();

    public SkillGapAnalysisResult() {}

    public SkillGapAnalysisResult(Course course, JobRequirement jobRequirement, Double matchPercentage,
                                  String matchedSkills, String missingSkills, SkillEnums.SkillMatchLevel matchLevel, String aiExplanation) {
        this.course = course;
        this.jobRequirement = jobRequirement;
        this.matchPercentage = matchPercentage;
        this.matchedSkills = matchedSkills;
        this.missingSkills = missingSkills;
        this.matchLevel = matchLevel;
        this.aiExplanation = aiExplanation;
        this.analyzedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public JobRequirement getJobRequirement() {
        return jobRequirement;
    }

    public void setJobRequirement(JobRequirement jobRequirement) {
        this.jobRequirement = jobRequirement;
    }

    public Double getMatchPercentage() {
        return matchPercentage;
    }

    public void setMatchPercentage(Double matchPercentage) {
        this.matchPercentage = matchPercentage;
    }

    public String getMatchedSkills() {
        return matchedSkills;
    }

    public void setMatchedSkills(String matchedSkills) {
        this.matchedSkills = matchedSkills;
    }

    public String getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(String missingSkills) {
        this.missingSkills = missingSkills;
    }

    public SkillEnums.SkillMatchLevel getMatchLevel() {
        return matchLevel;
    }

    public void setMatchLevel(SkillEnums.SkillMatchLevel matchLevel) {
        this.matchLevel = matchLevel;
    }

    public String getAiExplanation() {
        return aiExplanation;
    }

    public void setAiExplanation(String aiExplanation) {
        this.aiExplanation = aiExplanation;
    }

    public LocalDateTime getAnalyzedAt() {
        return analyzedAt;
    }

    public void setAnalyzedAt(LocalDateTime analyzedAt) {
        this.analyzedAt = analyzedAt;
    }
}

