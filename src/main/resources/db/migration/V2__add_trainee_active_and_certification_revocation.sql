-- ==============================================================================
-- SkillLoop AI - Flyway V2 Incremental Schema Evolution
-- 1. Adds soft deletion/deactivation support for trainees
-- 2. Adds controlled certificate revocation and audit fields
-- ==============================================================================

-- 1. Soft deletion support for trainees
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Controlled Certificate Revocation & Audit fields
ALTER TABLE certifications ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE certifications ADD COLUMN IF NOT EXISTS revoked BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE certifications ADD COLUMN IF NOT EXISTS revocation_reason VARCHAR(1000);
ALTER TABLE certifications ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP;
ALTER TABLE certifications ADD COLUMN IF NOT EXISTS revoked_by VARCHAR(80);
