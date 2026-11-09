-- ==============================================================================
-- SkillLoop AI - Flyway V1 Initial Schema (PostgreSQL & H2 PostgreSQL Mode)
-- Shared schema syncing Harshit (Trainee/Course/Auth) and Hemanth (Outcomes/Skills/Analytics)
-- ==============================================================================

-- 1. Users & Roles (Harshit)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Courses (Harshit)
CREATE TABLE IF NOT EXISTS courses (
    id BIGSERIAL PRIMARY KEY,
    course_code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    description VARCHAR(2000),
    domain_sector VARCHAR(80),
    duration_weeks INTEGER NOT NULL,
    provider_name VARCHAR(120),
    district VARCHAR(80),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Batches (Harshit)
CREATE TABLE IF NOT EXISTS batches (
    id BIGSERIAL PRIMARY KEY,
    batch_code VARCHAR(50) NOT NULL UNIQUE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    trainer_name VARCHAR(100),
    max_capacity INTEGER NOT NULL DEFAULT 40,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 4. Trainees (Harshit - Consent-based tracking)
CREATE TABLE IF NOT EXISTS trainees (
    id BIGSERIAL PRIMARY KEY,
    trainee_code VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(60) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    district VARCHAR(80),
    date_of_birth DATE,
    gender VARCHAR(20),
    education_level VARCHAR(80),
    consent_given BOOLEAN NOT NULL DEFAULT TRUE,
    consent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Enrollments & Certifications (Harshit)
CREATE TABLE IF NOT EXISTS enrollments (
    id BIGSERIAL PRIMARY KEY,
    trainee_id BIGINT NOT NULL REFERENCES trainees(id) ON DELETE CASCADE,
    batch_id BIGINT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    enrollment_date DATE NOT NULL,
    completion_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'ENROLLED',
    attendance_percentage DOUBLE PRECISION,
    assessment_score DOUBLE PRECISION,
    certification_issued BOOLEAN NOT NULL DEFAULT FALSE,
    certified_at DATE
);

CREATE TABLE IF NOT EXISTS assessments (
    id BIGSERIAL PRIMARY KEY,
    enrollment_id BIGINT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    assessment_name VARCHAR(120) NOT NULL,
    score DOUBLE PRECISION NOT NULL,
    max_score DOUBLE PRECISION NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT TRUE,
    assessment_date DATE
);

CREATE TABLE IF NOT EXISTS certifications (
    id BIGSERIAL PRIMARY KEY,
    enrollment_id BIGINT NOT NULL UNIQUE REFERENCES enrollments(id) ON DELETE CASCADE,
    certificate_number VARCHAR(60) NOT NULL UNIQUE,
    issue_date DATE NOT NULL,
    verifying_authority VARCHAR(120),
    verification_url VARCHAR(255)
);

-- 6. Skills Taxonomy & Course Curriculum Mapping (Hemanth)
CREATE TABLE IF NOT EXISTS skills (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    normalized_key VARCHAR(80) NOT NULL UNIQUE,
    category VARCHAR(30) NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS course_skills (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(30) NOT NULL DEFAULT 'INTERMEDIATE',
    hours_allocated INTEGER NOT NULL DEFAULT 20,
    is_core BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_course_skill UNIQUE (course_id, skill_id)
);

-- 7. Employer Job Requirements (Hemanth)
CREATE TABLE IF NOT EXISTS job_requirements (
    id BIGSERIAL PRIMARY KEY,
    job_title VARCHAR(120) NOT NULL,
    company VARCHAR(120) NOT NULL,
    industry_sector VARCHAR(80),
    location VARCHAR(80),
    salary_band VARCHAR(30),
    raw_job_description VARCHAR(4000),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_required_skills (
    job_id BIGINT NOT NULL REFERENCES job_requirements(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, skill_id)
);

CREATE TABLE IF NOT EXISTS job_preferred_skills (
    job_id BIGINT NOT NULL REFERENCES job_requirements(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, skill_id)
);

-- 8. Post-Training Employment Outcomes (Hemanth)
CREATE TABLE IF NOT EXISTS employment_outcomes (
    id BIGSERIAL PRIMARY KEY,
    trainee_id BIGINT NOT NULL REFERENCES trainees(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    job_role VARCHAR(120),
    organization VARCHAR(150),
    industry_sector VARCHAR(100),
    employment_type VARCHAR(30),
    salary_band VARCHAR(30),
    exact_monthly_salary DOUBLE PRECISION,
    joining_date DATE,
    retention_status VARCHAR(30) DEFAULT 'STILL_EMPLOYED',
    job_relevance VARCHAR(30) DEFAULT 'HIGHLY_RELEVANT',
    verification_source VARCHAR(35) DEFAULT 'SELF_REPORTED',
    verification_status VARCHAR(30) DEFAULT 'UNVERIFIED',
    data_quality_label VARCHAR(30) DEFAULT 'LOW_CONFIDENCE',
    notes VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Longitudinal Follow-ups at 3, 6, 12 Months (Hemanth)
CREATE TABLE IF NOT EXISTS employment_follow_ups (
    id BIGSERIAL PRIMARY KEY,
    trainee_id BIGINT NOT NULL REFERENCES trainees(id) ON DELETE CASCADE,
    outcome_id BIGINT REFERENCES employment_outcomes(id) ON DELETE SET NULL,
    milestone VARCHAR(20) NOT NULL,
    scheduled_date DATE NOT NULL,
    contact_date DATE,
    channel VARCHAR(20) NOT NULL DEFAULT 'WEB',
    response_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reported_status VARCHAR(30),
    current_job_role VARCHAR(120),
    current_organization VARCHAR(150),
    current_salary_band VARCHAR(30),
    retention_status VARCHAR(30),
    follow_up_notes VARCHAR(1000),
    recorded_by_staff VARCHAR(80),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. Employment Verification Evidence & Auditing (Hemanth)
CREATE TABLE IF NOT EXISTS employment_verifications (
    id BIGSERIAL PRIMARY KEY,
    outcome_id BIGINT NOT NULL REFERENCES employment_outcomes(id) ON DELETE CASCADE,
    source VARCHAR(35) NOT NULL DEFAULT 'SELF_REPORTED',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_REVIEW',
    evidence_type VARCHAR(80),
    evidence_document_url VARCHAR(255),
    employer_contact_person VARCHAR(100),
    employer_contact_phone VARCHAR(30),
    employer_contact_email VARCHAR(120),
    verified_by_staff VARCHAR(80),
    verified_at TIMESTAMP,
    conflict_flag BOOLEAN NOT NULL DEFAULT FALSE,
    conflict_details VARCHAR(1000),
    verification_notes VARCHAR(1000),
    confidence_score DOUBLE PRECISION DEFAULT 0.5,
    data_quality_label VARCHAR(30) DEFAULT 'MEDIUM_CONFIDENCE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. AI Skill-Gap Analysis Results (Hemanth)
CREATE TABLE IF NOT EXISTS skill_gap_analysis_results (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    job_requirement_id BIGINT NOT NULL REFERENCES job_requirements(id) ON DELETE CASCADE,
    match_percentage DOUBLE PRECISION NOT NULL,
    matched_skills VARCHAR(1000),
    missing_skills VARCHAR(1000),
    match_level VARCHAR(30) NOT NULL,
    ai_explanation VARCHAR(3000),
    analyzed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. Course Improvement Recommendations & Cohort Testing (Hemanth)
CREATE TABLE IF NOT EXISTS course_recommendations (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    analysis_result_id BIGINT REFERENCES skill_gap_analysis_results(id) ON DELETE SET NULL,
    title VARCHAR(180) NOT NULL,
    action_type VARCHAR(30) NOT NULL DEFAULT 'CURRICULUM_UPDATE',
    justification VARCHAR(2000),
    suggested_topics VARCHAR(1000),
    target_cohort VARCHAR(60),
    status VARCHAR(30) NOT NULL DEFAULT 'PROPOSED',
    reviewed_by VARCHAR(80),
    reviewed_at TIMESTAMP,
    hypothesis_note VARCHAR(1500),
    measured_outcome_result VARCHAR(1500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

