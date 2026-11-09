package com.skillloop.skills;

public class SkillEnums {

    public enum SkillCategory {
        TECHNICAL,
        DATA_AI,
        CLOUD_DEVOPS,
        TOOL,
        SOFT_SKILL,
        DOMAIN_KNOWLEDGE
    }

    public enum ProficiencyLevel {
        BEGINNER(1),
        INTERMEDIATE(2),
        ADVANCED(3);

        private final int weight;

        ProficiencyLevel(int weight) {
            this.weight = weight;
        }

        public int getWeight() {
            return weight;
        }
    }

    public enum SkillMatchLevel {
        HIGH_MATCH(">= 80% Skill Alignment"),
        MODERATE_MATCH("50% - 79% Skill Alignment"),
        CRITICAL_GAP("< 50% Skill Alignment - Needs Curriculum Update");

        private final String description;

        SkillMatchLevel(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}

