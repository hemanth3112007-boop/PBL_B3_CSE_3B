-- ==============================================================================
-- SkillLoop AI - Flyway V3 Security & Integrity Hardening
-- 1. Adds user_id foreign key on trainees table for explicit user ownership
-- 2. Adds unique constraint on enrollments(trainee_id, batch_id) to prevent duplicate cohort enrollments
-- ==============================================================================

-- 1. Explicit User Ownership on Trainees
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;

-- 2. Prevent duplicate enrollments per trainee per batch
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_enrollment_trainee_batch'
    ) THEN
        ALTER TABLE enrollments ADD CONSTRAINT uk_enrollment_trainee_batch UNIQUE (trainee_id, batch_id);
    END IF;
END $$;

