package com.skillloop.skills;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "skills")
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String name; // e.g. "SQL", "Power BI", "Python", "React"

    @Column(nullable = false, unique = true, length = 80)
    private String normalizedKey; // lowercase trimmed e.g. "sql", "power bi"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SkillEnums.SkillCategory category;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Skill() {}

    public Skill(String name, SkillEnums.SkillCategory category, String description) {
        this.name = name;
        this.normalizedKey = name != null ? name.trim().toLowerCase() : "";
        this.category = category;
        this.description = description;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        this.normalizedKey = name != null ? name.trim().toLowerCase() : "";
    }

    public String getNormalizedKey() {
        return normalizedKey;
    }

    public void setNormalizedKey(String normalizedKey) {
        this.normalizedKey = normalizedKey;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

