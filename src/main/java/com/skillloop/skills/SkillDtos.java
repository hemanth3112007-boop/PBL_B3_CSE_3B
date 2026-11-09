package com.skillloop.skills;

import com.skillloop.employment.EmploymentEnums;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Set;

public class SkillDtos {

    public static class CreateSkillRequest {
        @NotBlank(message = "Skill name is required")
        private String name;

        @NotNull(message = "Skill category is required")
        private SkillEnums.SkillCategory category;

        private String description;

        public CreateSkillRequest() {}

        public CreateSkillRequest(String name, SkillEnums.SkillCategory category, String description) {
            this.name = name;
            this.category = category;
            this.description = description;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public SkillEnums.SkillCategory getCategory() {
            return category;
        }

        public void setCategory(SkillEnums.SkillCategory category) {
            this.category = category;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }

    public static class AddCourseSkillRequest {
        private Long skillId;
        private String skillName;
        private SkillEnums.SkillCategory category;
        private SkillEnums.ProficiencyLevel proficiencyLevel = SkillEnums.ProficiencyLevel.INTERMEDIATE;
        private Integer hoursAllocated = 20;
        private boolean isCore = true;

        public AddCourseSkillRequest() {}

        public Long getSkillId() {
            return skillId;
        }

        public void setSkillId(Long skillId) {
            this.skillId = skillId;
        }

        public String getSkillName() {
            return skillName;
        }

        public void setSkillName(String skillName) {
            this.skillName = skillName;
        }

        public SkillEnums.SkillCategory getCategory() {
            return category;
        }

        public void setCategory(SkillEnums.SkillCategory category) {
            this.category = category;
        }

        public SkillEnums.ProficiencyLevel getProficiencyLevel() {
            return proficiencyLevel;
        }

        public void setProficiencyLevel(SkillEnums.ProficiencyLevel proficiencyLevel) {
            this.proficiencyLevel = proficiencyLevel;
        }

        public Integer getHoursAllocated() {
            return hoursAllocated;
        }

        public void setHoursAllocated(Integer hoursAllocated) {
            this.hoursAllocated = hoursAllocated;
        }

        public boolean isCore() {
            return isCore;
        }

        public void setCore(boolean core) {
            isCore = core;
        }
    }

    public static class CreateJobRequirementRequest {
        @NotBlank(message = "Job title is required")
        private String jobTitle;

        @NotBlank(message = "Company is required")
        private String company;

        private String industrySector;
        private String location;
        private EmploymentEnums.SalaryBand salaryBand;
        private String rawJobDescription;
        private Set<Long> requiredSkillIds;
        private Set<Long> preferredSkillIds;
        private List<String> extractedSkillNames;

        public CreateJobRequirementRequest() {}

        public String getJobTitle() {
            return jobTitle;
        }

        public void setJobTitle(String jobTitle) {
            this.jobTitle = jobTitle;
        }

        public String getCompany() {
            return company;
        }

        public void setCompany(String company) {
            this.company = company;
        }

        public String getIndustrySector() {
            return industrySector;
        }

        public void setIndustrySector(String industrySector) {
            this.industrySector = industrySector;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public EmploymentEnums.SalaryBand getSalaryBand() {
            return salaryBand;
        }

        public void setSalaryBand(EmploymentEnums.SalaryBand salaryBand) {
            this.salaryBand = salaryBand;
        }

        public String getRawJobDescription() {
            return rawJobDescription;
        }

        public void setRawJobDescription(String rawJobDescription) {
            this.rawJobDescription = rawJobDescription;
        }

        public Set<Long> getRequiredSkillIds() {
            return requiredSkillIds;
        }

        public void setRequiredSkillIds(Set<Long> requiredSkillIds) {
            this.requiredSkillIds = requiredSkillIds;
        }

        public Set<Long> getPreferredSkillIds() {
            return preferredSkillIds;
        }

        public void setPreferredSkillIds(Set<Long> preferredSkillIds) {
            this.preferredSkillIds = preferredSkillIds;
        }

        public List<String> getExtractedSkillNames() {
            return extractedSkillNames;
        }

        public void setExtractedSkillNames(List<String> extractedSkillNames) {
            this.extractedSkillNames = extractedSkillNames;
        }
    }

    public static class ExtractSkillsRequest {
        @NotBlank(message = "Job description text is required")
        private String text;

        public ExtractSkillsRequest() {}

        public ExtractSkillsRequest(String text) {
            this.text = text;
        }

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }
    }

    public static class ExtractSkillsResponse {
        private List<String> extractedSkills;
        private String aiSummary;

        public ExtractSkillsResponse(List<String> extractedSkills, String aiSummary) {
            this.extractedSkills = extractedSkills;
            this.aiSummary = aiSummary;
        }

        public List<String> getExtractedSkills() {
            return extractedSkills;
        }

        public String getAiSummary() {
            return aiSummary;
        }
    }
}

