package com.skillloop.skills;

import com.skillloop.training.Course;
import jakarta.persistence.*;

@Entity
@Table(name = "course_skills", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"course_id", "skill_id"})
})
public class CourseSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SkillEnums.ProficiencyLevel proficiencyLevel = SkillEnums.ProficiencyLevel.INTERMEDIATE;

    @Column(nullable = false)
    private Integer hoursAllocated = 20;

    @Column(nullable = false)
    private boolean isCore = true;

    public CourseSkill() {}

    public CourseSkill(Course course, Skill skill, SkillEnums.ProficiencyLevel proficiencyLevel, Integer hoursAllocated, boolean isCore) {
        this.course = course;
        this.skill = skill;
        this.proficiencyLevel = proficiencyLevel;
        this.hoursAllocated = hoursAllocated != null ? hoursAllocated : 20;
        this.isCore = isCore;
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

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
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

