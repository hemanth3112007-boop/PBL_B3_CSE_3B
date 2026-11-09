package com.skillloop.skills;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AiSkillExtractionService {

    private static final Logger log = LoggerFactory.getLogger(AiSkillExtractionService.class);

    // Built-in comprehensive industry skill taxonomy for zero-dependency AI extraction
    private static final Map<String, SkillEnums.SkillCategory> SKILL_TAXONOMY = new LinkedHashMap<>();

    static {
        // Data & AI
        SKILL_TAXONOMY.put("Python", SkillEnums.SkillCategory.DATA_AI);
        SKILL_TAXONOMY.put("SQL", SkillEnums.SkillCategory.DATA_AI);
        SKILL_TAXONOMY.put("PostgreSQL", SkillEnums.SkillCategory.DATA_AI);
        SKILL_TAXONOMY.put("MySQL", SkillEnums.SkillCategory.DATA_AI);
        SKILL_TAXONOMY.put("Power BI", SkillEnums.SkillCategory.TOOL);
        SKILL_TAXONOMY.put("Tableau", SkillEnums.SkillCategory.TOOL);
        SKILL_TAXONOMY.put("Excel", SkillEnums.SkillCategory.TOOL);
        SKILL_TAXONOMY.put("Advanced Excel", SkillEnums.SkillCategory.TOOL);
        SKILL_TAXONOMY.put("Pandas", SkillEnums.SkillCategory.DATA_AI);
        SKILL_TAXONOMY.put("NumPy", SkillEnums.SkillCategory.DATA_AI);
        SKILL_TAXONOMY.put("Machine Learning", SkillEnums.SkillCategory.DATA_AI);
        SKILL_TAXONOMY.put("Deep Learning", SkillEnums.SkillCategory.DATA_AI);
        SKILL_TAXONOMY.put("DAX", SkillEnums.SkillCategory.DATA_AI);
        SKILL_TAXONOMY.put("Statistics", SkillEnums.SkillCategory.DATA_AI);
        SKILL_TAXONOMY.put("Data Visualization", SkillEnums.SkillCategory.DATA_AI);
        SKILL_TAXONOMY.put("Data Cleaning", SkillEnums.SkillCategory.DATA_AI);
        SKILL_TAXONOMY.put("ETL Pipelines", SkillEnums.SkillCategory.DATA_AI);

        // Web & Software Development
        SKILL_TAXONOMY.put("Java", SkillEnums.SkillCategory.TECHNICAL);
        SKILL_TAXONOMY.put("Spring Boot", SkillEnums.SkillCategory.TECHNICAL);
        SKILL_TAXONOMY.put("JavaScript", SkillEnums.SkillCategory.TECHNICAL);
        SKILL_TAXONOMY.put("TypeScript", SkillEnums.SkillCategory.TECHNICAL);
        SKILL_TAXONOMY.put("React", SkillEnums.SkillCategory.TECHNICAL);
        SKILL_TAXONOMY.put("HTML5", SkillEnums.SkillCategory.TECHNICAL);
        SKILL_TAXONOMY.put("CSS3", SkillEnums.SkillCategory.TECHNICAL);
        SKILL_TAXONOMY.put("Tailwind CSS", SkillEnums.SkillCategory.TOOL);
        SKILL_TAXONOMY.put("Node.js", SkillEnums.SkillCategory.TECHNICAL);
        SKILL_TAXONOMY.put("REST API", SkillEnums.SkillCategory.TECHNICAL);
        SKILL_TAXONOMY.put("Git", SkillEnums.SkillCategory.TOOL);
        SKILL_TAXONOMY.put("GitHub", SkillEnums.SkillCategory.TOOL);
        SKILL_TAXONOMY.put("C++", SkillEnums.SkillCategory.TECHNICAL);
        SKILL_TAXONOMY.put("Hibernate", SkillEnums.SkillCategory.TECHNICAL);

        // Cloud & DevOps
        SKILL_TAXONOMY.put("AWS", SkillEnums.SkillCategory.CLOUD_DEVOPS);
        SKILL_TAXONOMY.put("Azure", SkillEnums.SkillCategory.CLOUD_DEVOPS);
        SKILL_TAXONOMY.put("Google Cloud", SkillEnums.SkillCategory.CLOUD_DEVOPS);
        SKILL_TAXONOMY.put("Docker", SkillEnums.SkillCategory.CLOUD_DEVOPS);
        SKILL_TAXONOMY.put("Kubernetes", SkillEnums.SkillCategory.CLOUD_DEVOPS);
        SKILL_TAXONOMY.put("Linux", SkillEnums.SkillCategory.CLOUD_DEVOPS);
        SKILL_TAXONOMY.put("CI/CD", SkillEnums.SkillCategory.CLOUD_DEVOPS);

        // Soft Skills & Professional
        SKILL_TAXONOMY.put("Communication", SkillEnums.SkillCategory.SOFT_SKILL);
        SKILL_TAXONOMY.put("Problem Solving", SkillEnums.SkillCategory.SOFT_SKILL);
        SKILL_TAXONOMY.put("Teamwork", SkillEnums.SkillCategory.SOFT_SKILL);
        SKILL_TAXONOMY.put("Agile Scrum", SkillEnums.SkillCategory.DOMAIN_KNOWLEDGE);
        SKILL_TAXONOMY.put("Business Intelligence", SkillEnums.SkillCategory.DOMAIN_KNOWLEDGE);
    }

    public List<String> extractSkills(String text) {
        if (text == null || text.isBlank()) {
            return Collections.emptyList();
        }

        Set<String> matched = new LinkedHashSet<>();
        String lowerText = " " + text.toLowerCase() + " ";

        for (Map.Entry<String, SkillEnums.SkillCategory> entry : SKILL_TAXONOMY.entrySet()) {
            String skill = entry.getKey();
            // Handle word boundary correctly even for skills with symbols like C++
            String boundaryStart = Character.isLetterOrDigit(skill.charAt(0)) ? "\\b" : "(?<!\\S)";
            String boundaryEnd = Character.isLetterOrDigit(skill.charAt(skill.length() - 1)) ? "\\b" : "(?![a-zA-Z0-9+])";
            Pattern pattern = Pattern.compile(boundaryStart + Pattern.quote(skill) + boundaryEnd, Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(text);
            if (matcher.find()) {
                matched.add(skill);
            }
        }

        return new ArrayList<>(matched);
    }

    public SkillEnums.SkillCategory categorizeSkill(String skillName) {
        return SKILL_TAXONOMY.getOrDefault(skillName, SkillEnums.SkillCategory.TECHNICAL);
    }

    public String generateSkillGapExplanation(String courseTitle, String jobTitle, String company,
                                              Set<String> matchedSkills, Set<String> missingSkills, double matchPercentage) {
        StringBuilder explanation = new StringBuilder();

        if (matchedSkills.isEmpty() && missingSkills.isEmpty()) {
            return String.format("Analysis of '%s' curriculum against '%s' position at %s: No specific required skills could be identified for this job position. Unable to perform alignment diagnosis.",
                    courseTitle, jobTitle, company);
        }

        explanation.append(String.format(
                "Analysis of '%s' curriculum against '%s' position at %s reveals a %.1f%% skill alignment. ",
                courseTitle, jobTitle, company, matchPercentage
        ));

        if (!matchedSkills.isEmpty()) {
            explanation.append(String.format(
                    "The course effectively equips trainees with foundational core competencies: [%s]. ",
                    String.join(", ", matchedSkills)
            ));
        }

        if (!missingSkills.isEmpty()) {
            explanation.append(String.format(
                    "However, critical employer requirements are missing from the training syllabus: [%s]. ",
                    String.join(", ", missingSkills)
            ));

            if (missingSkills.stream().anyMatch(s -> s.equalsIgnoreCase("Power BI") || s.equalsIgnoreCase("Tableau"))) {
                explanation.append("Employer demand heavily stresses dashboarding and interactive reporting tools; trainees lacking hands-on project exposure in these tools face placement attrition. ");
            }
            if (missingSkills.stream().anyMatch(s -> s.equalsIgnoreCase("Docker") || s.equalsIgnoreCase("AWS") || s.equalsIgnoreCase("CI/CD"))) {
                explanation.append("Modern enterprise teams require basic containerization and deployment familiarity for production readiness. ");
            }
        } else {
            explanation.append("Trainees from this program have a comprehensive skill profile matching 100% of the employer's requested competencies. ");
        }

        if (matchPercentage < 50.0) {
            explanation.append("Urgent recommendation: Revise course syllabus to incorporate practical capstone projects covering the missing competencies before the next cohort enrollment.");
        } else if (matchPercentage < 80.0) {
            explanation.append("Recommendation: Supplement curriculum with targeted workshops on the identified missing skills.");
        } else {
            explanation.append("Course curriculum is strongly aligned with current industry hiring expectations.");
        }

        return explanation.toString();
    }
}

