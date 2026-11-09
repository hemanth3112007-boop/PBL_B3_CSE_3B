package com.skillloop.seed;

import com.skillloop.auth.Role;
import com.skillloop.auth.User;
import com.skillloop.auth.UserRepository;
import com.skillloop.employment.*;
import com.skillloop.recommendations.CourseRecommendation;
import com.skillloop.recommendations.CourseRecommendationRepository;
import com.skillloop.skills.*;
import com.skillloop.training.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final BatchRepository batchRepository;
    private final TraineeRepository traineeRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AssessmentRepository assessmentRepository;
    private final CertificationRepository certificationRepository;
    private final SkillRepository skillRepository;
    private final CourseSkillRepository courseSkillRepository;
    private final JobRequirementRepository jobRequirementRepository;
    private final SkillGapAnalysisRepository analysisRepository;
    private final EmploymentOutcomeRepository outcomeRepository;
    private final EmploymentFollowUpRepository followUpRepository;
    private final EmploymentVerificationRepository verificationRepository;
    private final CourseRecommendationRepository recommendationRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${skillloop.seed.enabled:true}")
    private boolean seedEnabled;

    public DataInitializer(
            UserRepository userRepository,
            CourseRepository courseRepository,
            BatchRepository batchRepository,
            TraineeRepository traineeRepository,
            EnrollmentRepository enrollmentRepository,
            AssessmentRepository assessmentRepository,
            CertificationRepository certificationRepository,
            SkillRepository skillRepository,
            CourseSkillRepository courseSkillRepository,
            JobRequirementRepository jobRequirementRepository,
            SkillGapAnalysisRepository analysisRepository,
            EmploymentOutcomeRepository outcomeRepository,
            EmploymentFollowUpRepository followUpRepository,
            EmploymentVerificationRepository verificationRepository,
            CourseRecommendationRepository recommendationRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.batchRepository = batchRepository;
        this.traineeRepository = traineeRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.assessmentRepository = assessmentRepository;
        this.certificationRepository = certificationRepository;
        this.skillRepository = skillRepository;
        this.courseSkillRepository = courseSkillRepository;
        this.jobRequirementRepository = jobRequirementRepository;
        this.analysisRepository = analysisRepository;
        this.outcomeRepository = outcomeRepository;
        this.followUpRepository = followUpRepository;
        this.verificationRepository = verificationRepository;
        this.recommendationRepository = recommendationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled || userRepository.count() > 0) {
            log.info("Database already seeded or seeding disabled.");
            return;
        }

        log.info("Seeding realistic synthetic demonstration data for SkillLoop AI...");

        // 1. Users
        User admin = new User("admin", "admin@skillloop.ai", passwordEncoder.encode("admin123"), "Administrator", Role.ADMIN);
        User staff = new User("harshit", "harshit@skillloop.ai", passwordEncoder.encode("staff123"), "Harshit Agarwalla (Staff)", Role.INSTITUTE_STAFF);
        User staffHemanth = new User("hemanth", "hemanth@skillloop.ai", passwordEncoder.encode("hemanth123"), "Hemanth V (Lead Analyst)", Role.ADMIN);
        User traineeUser = new User("dhanush", "dhanush@skillloop.ai", passwordEncoder.encode("trainee123"), "Dhanush CS", Role.TRAINEE);
        User employerUser = new User("tcs_recruiter", "recruiter@tcs.com", passwordEncoder.encode("employer123"), "TCS Talent Acquisition", Role.EMPLOYER);
        userRepository.saveAll(List.of(admin, staff, staffHemanth, traineeUser, employerUser));

        // 2. Courses
        Course c1 = new Course("CRS-DA-01", "Data Analytics & Business Intelligence", "Comprehensive training in SQL, Python, Excel and data visualization.", "Data Analytics", 12, "DSATM Skills Academy", "Bangalore Urban");
        Course c2 = new Course("CRS-FSJ-02", "Full Stack Java & Cloud Development", "Modern web backend development with Java 21, Spring Boot, REST and React.", "Software Development", 16, "DSATM Skills Academy", "Bangalore Urban");
        Course c3 = new Course("CRS-ML-03", "Applied Machine Learning & AI", "Data preprocessing, predictive modeling, NLP and practical AI workflows.", "Data Analytics", 14, "Govt Tool Room & Training Centre", "Mysuru");
        Course c4 = new Course("CRS-CD-04", "Cloud Infrastructure & DevOps", "Linux systems, Docker containers, Kubernetes and AWS cloud operations.", "Cloud Computing", 10, "Skill Development Institute", "Ramanagara");
        courseRepository.saveAll(List.of(c1, c2, c3, c4));

        // 3. Batches
        Batch b1 = new Batch("BAT-2026-DA-1", c1, LocalDate.of(2026, 1, 10), LocalDate.of(2026, 4, 10), "Dr. Ramesh K", 35);
        Batch b2 = new Batch("BAT-2026-FSJ-1", c2, LocalDate.of(2026, 2, 1), LocalDate.of(2026, 5, 25), "Prof. Jyothis K P", 30);
        Batch b3 = new Batch("BAT-2026-ML-1", c3, LocalDate.of(2026, 1, 15), LocalDate.of(2026, 4, 30), "Dr. Sneha Rao", 25);
        Batch b4 = new Batch("BAT-2026-CD-1", c4, LocalDate.of(2026, 3, 1), LocalDate.of(2026, 5, 10), "Mr. Anand Kumar", 20);
        batchRepository.saveAll(List.of(b1, b2, b3, b4));

        // 4. Skills Catalog
        Skill skSql = new Skill("SQL", SkillEnums.SkillCategory.DATA_AI, "Relational querying, joins and aggregates");
        Skill skPython = new Skill("Python", SkillEnums.SkillCategory.DATA_AI, "Scripting, pandas and numpy");
        Skill skExcel = new Skill("Excel", SkillEnums.SkillCategory.TOOL, "Advanced formulas, pivot tables and lookups");
        Skill skPowerBi = new Skill("Power BI", SkillEnums.SkillCategory.TOOL, "DAX, data modeling and interactive reports");
        Skill skTableau = new Skill("Tableau", SkillEnums.SkillCategory.TOOL, "Visual analytics dashboards");
        Skill skJava = new Skill("Java", SkillEnums.SkillCategory.TECHNICAL, "Core Java 21 and OOP");
        Skill skSpringBoot = new Skill("Spring Boot", SkillEnums.SkillCategory.TECHNICAL, "Spring Framework, REST and JPA");
        Skill skReact = new Skill("React", SkillEnums.SkillCategory.TECHNICAL, "Component-based web frontend");
        Skill skDocker = new Skill("Docker", SkillEnums.SkillCategory.CLOUD_DEVOPS, "Containerization of microservices");
        Skill skAws = new Skill("AWS", SkillEnums.SkillCategory.CLOUD_DEVOPS, "Cloud computing core services");
        Skill skGit = new Skill("Git", SkillEnums.SkillCategory.TOOL, "Version control and collaborative branching");
        Skill skStats = new Skill("Statistics", SkillEnums.SkillCategory.DATA_AI, "Hypothesis testing and regression");
        Skill skComm = new Skill("Communication", SkillEnums.SkillCategory.SOFT_SKILL, "Technical presentations and business client meetings");
        skillRepository.saveAll(List.of(skSql, skPython, skExcel, skPowerBi, skTableau, skJava, skSpringBoot, skReact, skDocker, skAws, skGit, skStats, skComm));

        // 5. Course Skills Mapping
        courseSkillRepository.saveAll(List.of(
                new CourseSkill(c1, skSql, SkillEnums.ProficiencyLevel.ADVANCED, 40, true),
                new CourseSkill(c1, skPython, SkillEnums.ProficiencyLevel.INTERMEDIATE, 45, true),
                new CourseSkill(c1, skExcel, SkillEnums.ProficiencyLevel.ADVANCED, 30, true),
                new CourseSkill(c1, skStats, SkillEnums.ProficiencyLevel.INTERMEDIATE, 20, false),
                new CourseSkill(c1, skComm, SkillEnums.ProficiencyLevel.INTERMEDIATE, 15, false),

                new CourseSkill(c2, skJava, SkillEnums.ProficiencyLevel.ADVANCED, 60, true),
                new CourseSkill(c2, skSpringBoot, SkillEnums.ProficiencyLevel.ADVANCED, 50, true),
                new CourseSkill(c2, skSql, SkillEnums.ProficiencyLevel.INTERMEDIATE, 25, true),
                new CourseSkill(c2, skReact, SkillEnums.ProficiencyLevel.INTERMEDIATE, 35, true),
                new CourseSkill(c2, skGit, SkillEnums.ProficiencyLevel.INTERMEDIATE, 15, false),

                new CourseSkill(c3, skPython, SkillEnums.ProficiencyLevel.ADVANCED, 50, true),
                new CourseSkill(c3, skStats, SkillEnums.ProficiencyLevel.ADVANCED, 30, true),
                new CourseSkill(c3, skSql, SkillEnums.ProficiencyLevel.INTERMEDIATE, 20, false),

                new CourseSkill(c4, skDocker, SkillEnums.ProficiencyLevel.ADVANCED, 30, true),
                new CourseSkill(c4, skAws, SkillEnums.ProficiencyLevel.ADVANCED, 35, true),
                new CourseSkill(c4, skGit, SkillEnums.ProficiencyLevel.INTERMEDIATE, 15, true)
        ));

        // 6. Employer Job Requirements
        JobRequirement job1 = new JobRequirement("Junior Data Analyst", "TCS", "Information Technology", "Bangalore",
                EmploymentEnums.SalaryBand.RANGE_25K_40K, "Seeking data analyst proficient in SQL, Python, Excel and Power BI for enterprise reporting dashboards.");
        job1.getRequiredSkills().addAll(Set.of(skSql, skPython, skPowerBi, skExcel));

        JobRequirement job2 = new JobRequirement("Associate BI Developer", "Infosys", "Information Technology", "Mysuru",
                EmploymentEnums.SalaryBand.RANGE_25K_40K, "Requires strong Power BI, DAX, SQL queries and communication skills for business intelligence delivery.");
        job2.getRequiredSkills().addAll(Set.of(skPowerBi, skSql, skComm));

        JobRequirement job3 = new JobRequirement("Junior Software Engineer", "Swiggy", "E-Commerce", "Bangalore",
                EmploymentEnums.SalaryBand.ABOVE_40K, "Looking for enthusiastic developers with Java, Spring Boot, React, SQL and Docker familiarity.");
        job3.getRequiredSkills().addAll(Set.of(skJava, skSpringBoot, skReact, skSql, skDocker));

        JobRequirement job4 = new JobRequirement("Operations Analyst", "Accenture", "Consulting", "Bangalore",
                EmploymentEnums.SalaryBand.RANGE_15K_25K, "Analyzing operational metrics using Excel, SQL and basic Statistics.");
        job4.getRequiredSkills().addAll(Set.of(skExcel, skSql, skStats));

        jobRequirementRepository.saveAll(List.of(job1, job2, job3, job4));

        // 7. Trainees (Realistic synthetic records)
        Trainee t1 = new Trainee("TRN-2026-001", "Dhanush", "CS", "dhanush@skillloop.ai", "9845012341", "Bangalore Urban", "Graduate B.Sc");
        t1.setUser(traineeUser);

        List<Trainee> trainees = List.of(
                t1,
                new Trainee("TRN-2026-002", "Pooja", "Patil", "pooja.patil@gmail.com", "9845012342", "Mysuru", "Diploma CS"),
                new Trainee("TRN-2026-003", "Rohan", "Gowda", "rohan.gowda@gmail.com", "9845012343", "Ramanagara", "B.Com"),
                new Trainee("TRN-2026-004", "Ananya", "Rao", "ananya.rao@gmail.com", "9845012344", "Bangalore Urban", "B.E CS"),
                new Trainee("TRN-2026-005", "Kiran", "Kumar", "kiran.kumar@gmail.com", "9845012345", "Bangalore Rural", "B.Sc Statistics"),
                new Trainee("TRN-2026-006", "Sneha", "Kulkarni", "sneha.k@gmail.com", "9845012346", "Bangalore Urban", "BCA"),
                new Trainee("TRN-2026-007", "Vikram", "Hegde", "vikram.h@gmail.com", "9845012347", "Mysuru", "Graduate B.A"),
                new Trainee("TRN-2026-008", "Deepika", "Nair", "deepika.nair@gmail.com", "9845012348", "Bangalore Urban", "B.E Electronics"),
                new Trainee("TRN-2026-009", "Manoj", "Reddy", "manoj.reddy@gmail.com", "9845012349", "Ramanagara", "Higher Secondary"),
                new Trainee("TRN-2026-010", "Varun", "Teja", "varun.teja@gmail.com", "9845012350", "Bangalore Urban", "BCA")
        );
        traineeRepository.saveAll(trainees);

        // 8. Enrollments, Assessments & Certifications
        for (int i = 0; i < trainees.size(); i++) {
            Trainee t = trainees.get(i);
            Batch b = (i < 5) ? b1 : (i < 8) ? b2 : b3;
            Enrollment e = new Enrollment(t, b, b.getStartDate(), Enrollment.EnrollmentStatus.COMPLETED);
            e.setCompletionDate(b.getEndDate());
            e.setAttendancePercentage(85.0 + (i % 12));
            e.setAssessmentScore(76.0 + (i % 20));
            e.setCertificationIssued(true);
            e.setCertifiedAt(b.getEndDate().plusDays(2));
            Enrollment savedEnrollment = enrollmentRepository.save(e);

            // Seed realistic assessments
            Assessment a1 = new Assessment(savedEnrollment, "Mid-Term Technical Assessment", 42.0, 50.0, true, b.getStartDate().plusWeeks(6));
            Assessment a2 = new Assessment(savedEnrollment, "Final Capstone Practical Evaluation", 45.0, 50.0, true, b.getEndDate().minusDays(3));
            assessmentRepository.saveAll(List.of(a1, a2));

            // Seed certification
            String certNum = String.format("CERT-2026-%s-%03d", b.getCourse().getCourseCode(), i + 1);
            Certification cert = new Certification(
                    savedEnrollment,
                    certNum,
                    b.getEndDate().plusDays(2),
                    "DSATM Skills Academy Certification Board",
                    "https://verify.skillloop.ai/cert/" + certNum
            );
            cert.setStatus(Certification.Status.ACTIVE);
            cert.setRevoked(false);
            certificationRepository.save(cert);
        }

        // 9. Employment Outcomes & Follow-ups
        // Trainee 1: Employed at TCS (Verified)
        EmploymentOutcome o1 = new EmploymentOutcome(trainees.get(0), c1, EmploymentEnums.EmploymentStatus.EMPLOYED,
                "Junior Data Analyst", "TCS", EmploymentEnums.EmploymentType.FULL_TIME, EmploymentEnums.SalaryBand.RANGE_25K_40K, LocalDate.of(2026, 5, 2));
        o1.setExactMonthlySalary(32000.0);
        o1.setVerificationSource(EmploymentEnums.VerificationSource.EMPLOYER_CONFIRMED);
        o1.setVerificationStatus(EmploymentEnums.VerificationStatus.VERIFIED);
        o1.setDataQualityLabel(EmploymentEnums.DataQualityLabel.HIGH_CONFIDENCE);
        outcomeRepository.save(o1);

        // Trainee 2: Employed at Accenture
        EmploymentOutcome o2 = new EmploymentOutcome(trainees.get(1), c1, EmploymentEnums.EmploymentStatus.EMPLOYED,
                "Operations Analyst", "Accenture", EmploymentEnums.EmploymentType.FULL_TIME, EmploymentEnums.SalaryBand.RANGE_15K_25K, LocalDate.of(2026, 5, 10));
        o2.setExactMonthlySalary(24000.0);
        o2.setVerificationSource(EmploymentEnums.VerificationSource.SELF_REPORTED);
        o2.setVerificationStatus(EmploymentEnums.VerificationStatus.VERIFIED);
        o2.setDataQualityLabel(EmploymentEnums.DataQualityLabel.MEDIUM_CONFIDENCE);
        outcomeRepository.save(o2);

        // Trainee 3: Self-Employed (Freelance Analytics)
        EmploymentOutcome o3 = new EmploymentOutcome(trainees.get(2), c1, EmploymentEnums.EmploymentStatus.SELF_EMPLOYED,
                "Freelance Dashboard Consultant", "Independent", EmploymentEnums.EmploymentType.FREELANCE, EmploymentEnums.SalaryBand.RANGE_15K_25K, LocalDate.of(2026, 5, 15));
        o3.setVerificationSource(EmploymentEnums.VerificationSource.SELF_REPORTED);
        o3.setVerificationStatus(EmploymentEnums.VerificationStatus.PENDING_REVIEW);
        o3.setDataQualityLabel(EmploymentEnums.DataQualityLabel.LOW_CONFIDENCE);
        outcomeRepository.save(o3);

        // Trainee 4: Employed at Swiggy (Java Full Stack)
        EmploymentOutcome o4 = new EmploymentOutcome(trainees.get(3), c2, EmploymentEnums.EmploymentStatus.EMPLOYED,
                "Software Engineer - Backend", "Swiggy", EmploymentEnums.EmploymentType.FULL_TIME, EmploymentEnums.SalaryBand.ABOVE_40K, LocalDate.of(2026, 6, 1));
        o4.setExactMonthlySalary(48000.0);
        o4.setVerificationSource(EmploymentEnums.VerificationSource.EMPLOYER_CONFIRMED);
        o4.setVerificationStatus(EmploymentEnums.VerificationStatus.VERIFIED);
        o4.setDataQualityLabel(EmploymentEnums.DataQualityLabel.HIGH_CONFIDENCE);
        outcomeRepository.save(o4);

        // Trainee 5: Apprenticeship
        EmploymentOutcome o5 = new EmploymentOutcome(trainees.get(4), c1, EmploymentEnums.EmploymentStatus.APPRENTICESHIP,
                "Data Science Apprentice", "Mu Sigma", EmploymentEnums.EmploymentType.CONTRACT, EmploymentEnums.SalaryBand.RANGE_15K_25K, LocalDate.of(2026, 5, 20));
        o5.setVerificationSource(EmploymentEnums.VerificationSource.INDEPENDENTLY_CORROBORATED);
        o5.setVerificationStatus(EmploymentEnums.VerificationStatus.VERIFIED);
        o5.setDataQualityLabel(EmploymentEnums.DataQualityLabel.HIGH_CONFIDENCE);
        outcomeRepository.save(o5);

        // Trainee 6: Further Education
        EmploymentOutcome o6 = new EmploymentOutcome(trainees.get(5), c2, EmploymentEnums.EmploymentStatus.FURTHER_EDUCATION,
                "M.Tech Student", "DSATM Graduate School", EmploymentEnums.EmploymentType.NOT_APPLICABLE, EmploymentEnums.SalaryBand.UNDISCLOSED, null);
        o6.setVerificationStatus(EmploymentEnums.VerificationStatus.VERIFIED);
        outcomeRepository.save(o6);

        // Trainee 7: Outcome Unknown (Unreachable - Never mark as unemployed!)
        EmploymentOutcome o7 = new EmploymentOutcome(trainees.get(6), c2, EmploymentEnums.EmploymentStatus.OUTCOME_UNKNOWN,
                null, null, EmploymentEnums.EmploymentType.NOT_APPLICABLE, EmploymentEnums.SalaryBand.UNDISCLOSED, null);
        o7.setNotes("Trainee phone unreachable after 3 contact attempts; marked as OUTCOME_UNKNOWN per privacy guidelines.");
        outcomeRepository.save(o7);

        // Trainee 8: Actively Seeking / Unemployed
        EmploymentOutcome o8 = new EmploymentOutcome(trainees.get(7), c2, EmploymentEnums.EmploymentStatus.UNEMPLOYED,
                "Actively Seeking Software Roles", null, EmploymentEnums.EmploymentType.NOT_APPLICABLE, EmploymentEnums.SalaryBand.UNDISCLOSED, null);
        outcomeRepository.save(o8);

        // 10. Longitudinal Follow-ups (3, 6, 12 months)
        EmploymentFollowUp fu1 = new EmploymentFollowUp(trainees.get(0), o1, EmploymentEnums.FollowUpMilestone.MONTH_3, LocalDate.of(2026, 7, 10), EmploymentEnums.FollowUpChannel.WHATSAPP);
        fu1.setResponseStatus(EmploymentEnums.FollowUpResponseStatus.RESPONDED);
        fu1.setReportedStatus(EmploymentEnums.EmploymentStatus.EMPLOYED);
        fu1.setRetentionStatus(EmploymentEnums.RetentionStatus.STILL_EMPLOYED);
        fu1.setCurrentJobRole("Junior Data Analyst");
        fu1.setCurrentOrganization("TCS");
        fu1.setCurrentSalaryBand(EmploymentEnums.SalaryBand.RANGE_25K_40K);

        EmploymentFollowUp fu2 = new EmploymentFollowUp(trainees.get(0), o1, EmploymentEnums.FollowUpMilestone.MONTH_6, LocalDate.of(2026, 10, 10), EmploymentEnums.FollowUpChannel.SMS);
        fu2.setResponseStatus(EmploymentEnums.FollowUpResponseStatus.RESPONDED);
        fu2.setReportedStatus(EmploymentEnums.EmploymentStatus.EMPLOYED);
        fu2.setRetentionStatus(EmploymentEnums.RetentionStatus.PROMOTED);
        fu2.setCurrentJobRole("Data Analyst - Tier 2");
        fu2.setCurrentOrganization("TCS");
        fu2.setCurrentSalaryBand(EmploymentEnums.SalaryBand.RANGE_25K_40K);

        EmploymentFollowUp fu3 = new EmploymentFollowUp(trainees.get(0), o1, EmploymentEnums.FollowUpMilestone.MONTH_12, LocalDate.of(2027, 4, 10), EmploymentEnums.FollowUpChannel.WEB);
        fu3.setResponseStatus(EmploymentEnums.FollowUpResponseStatus.PENDING);

        // Unanswered follow-up for Trainee 7
        EmploymentFollowUp fuUnknown = new EmploymentFollowUp(trainees.get(6), o7, EmploymentEnums.FollowUpMilestone.MONTH_3, LocalDate.of(2026, 8, 1), EmploymentEnums.FollowUpChannel.SMS);
        fuUnknown.setResponseStatus(EmploymentEnums.FollowUpResponseStatus.NO_RESPONSE);
        fuUnknown.setReportedStatus(EmploymentEnums.EmploymentStatus.OUTCOME_UNKNOWN);

        followUpRepository.saveAll(List.of(fu1, fu2, fu3, fuUnknown));

        // 11. Employment Verifications
        EmploymentVerification v1 = new EmploymentVerification(o1, EmploymentEnums.VerificationSource.EMPLOYER_CONFIRMED,
                EmploymentEnums.VerificationStatus.VERIFIED, "OFFER_LETTER_AND_HR_EMAIL", "Harshit Agarwalla");
        v1.setEvidenceDocumentUrl("https://storage.skillloop.ai/evidence/tcs_aarav_offer.pdf");
        v1.setEmployerContactPerson("Suresh V (HR Manager, TCS)");
        v1.setEmployerContactEmail("suresh.v@tcs.com");
        v1.setConfidenceScore(0.98);
        v1.setDataQualityLabel(EmploymentEnums.DataQualityLabel.HIGH_CONFIDENCE);
        verificationRepository.save(v1);

        // Conflicting verification example for auditing
        EmploymentVerification vConflict = new EmploymentVerification(o2, EmploymentEnums.VerificationSource.SELF_REPORTED,
                EmploymentEnums.VerificationStatus.CONFLICT_DETECTED, "PAYSLIP", "Hemanth V");
        vConflict.setConflictFlag(true);
        vConflict.setConflictDetails("Reported joining date does not match employer verification record by 3 months. Flagged for review.");
        vConflict.setDataQualityLabel(EmploymentEnums.DataQualityLabel.CONFLICT_FLAGGED);
        vConflict.setConfidenceScore(0.15);
        verificationRepository.save(vConflict);

        // 12. Skill-Gap Analyses
        SkillGapAnalysisResult ga1 = new SkillGapAnalysisResult(
                c1, job1, 75.0,
                "SQL, Python, Excel",
                "Power BI",
                SkillEnums.SkillMatchLevel.MODERATE_MATCH,
                "Analysis of 'Data Analytics & Business Intelligence' against TCS 'Junior Data Analyst' reveals 75.0% skill alignment. The course effectively covers SQL, Python, and Excel. However, Power BI is missing from the curriculum, which is a required tool in enterprise analytics delivery."
        );

        SkillGapAnalysisResult ga2 = new SkillGapAnalysisResult(
                c1, job2, 66.7,
                "SQL, Communication",
                "Power BI",
                SkillEnums.SkillMatchLevel.MODERATE_MATCH,
                "Trainees match SQL and Communication competencies, but lack required Power BI and DAX skills demanded by Infosys BI Developer roles."
        );

        SkillGapAnalysisResult ga3 = new SkillGapAnalysisResult(
                c2, job3, 80.0,
                "Java, Spring Boot, React, SQL",
                "Docker",
                SkillEnums.SkillMatchLevel.HIGH_MATCH,
                "Strong full stack competency match (80.0%). Adding practical Docker containerization workshop will achieve 100% employer syllabus alignment."
        );

        analysisRepository.saveAll(List.of(ga1, ga2, ga3));

        // 13. Course Improvement Recommendations
        CourseRecommendation rec1 = new CourseRecommendation(
                c1, ga1, "Introduce 2-Week Hands-on Module on Power BI & DAX",
                CourseRecommendation.RecommendationActionType.CURRICULUM_UPDATE,
                "Power BI requested in 75% of local data analyst openings but currently missing in CRS-DA-01 syllabus.",
                "Data modeling, DAX measures, Power BI Service publishing, and interactive executive dashboards.",
                "Batch 2026-Q4",
                "Hypothesis: Incorporating a 2-week Power BI capstone project will raise cohort employment placement from 72% to > 85%."
        );
        rec1.setStatus(CourseRecommendation.RecommendationStatus.APPROVED);
        rec1.setReviewedBy("Hemanth V");
        rec1.setReviewedAt(LocalDateTime.now().minusDays(5));

        CourseRecommendation rec2 = new CourseRecommendation(
                c2, ga3, "Integrate Docker Microservice Deployment into Capstone Projects",
                CourseRecommendation.RecommendationActionType.PRACTICAL_PROJECT,
                "Enterprise software hiring requires containerization literacy for immediate project deployment readiness.",
                "Dockerfile authoring, multi-container compose, environment variable management, container registry pushes.",
                "Batch 2026-FSJ-2",
                "Hypothesis: Hands-on Docker projects will reduce employer onboarding lead time and eliminate placement technical screening drop-offs."
        );
        rec2.setStatus(CourseRecommendation.RecommendationStatus.PROPOSED);

        recommendationRepository.saveAll(List.of(rec1, rec2));

        log.info("SkillLoop AI demonstration seed data initialized successfully! 4 courses, 10 trainees, 8 outcomes, verifications, assessments, and certifications ready.");
    }
}
