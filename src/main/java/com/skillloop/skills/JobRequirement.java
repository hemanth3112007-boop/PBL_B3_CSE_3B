package com.skillloop.skills;

import com.skillloop.employment.EmploymentEnums;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "job_requirements")
public class JobRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String jobTitle; // e.g. "Junior Data Analyst", "Frontend Developer"

    @Column(nullable = false, length = 120)
    private String company; // e.g. "TCS", "Infosys", "Swiggy", "Accenture"

    @Column(length = 80)
    private String industrySector; // e.g. "Information Technology", "E-Commerce", "Finance"

    @Column(length = 80)
    private String location; // e.g. "Bangalore"

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private EmploymentEnums.SalaryBand salaryBand;

    @Column(length = 4000)
    private String rawJobDescription;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "job_required_skills",
            joinColumns = @JoinColumn(name = "job_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    private Set<Skill> requiredSkills = new HashSet<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "job_preferred_skills",
            joinColumns = @JoinColumn(name = "job_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    private Set<Skill> preferredSkills = new HashSet<>();

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public JobRequirement() {}

    public JobRequirement(String jobTitle, String company, String industrySector, String location,
                          EmploymentEnums.SalaryBand salaryBand, String rawJobDescription) {
        this.jobTitle = jobTitle;
        this.company = company;
        this.industrySector = industrySector;
        this.location = location;
        this.salaryBand = salaryBand;
        this.rawJobDescription = rawJobDescription;
        this.active = true;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Set<Skill> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(Set<Skill> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public Set<Skill> getPreferredSkills() {
        return preferredSkills;
    }

    public void setPreferredSkills(Set<Skill> preferredSkills) {
        this.preferredSkills = preferredSkills;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

