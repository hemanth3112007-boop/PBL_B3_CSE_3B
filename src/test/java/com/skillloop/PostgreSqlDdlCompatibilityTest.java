package com.skillloop;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

class PostgreSqlDdlCompatibilityTest {

    @Test
    @DisplayName("Verify V1 schema migration adheres to strict PostgreSQL dialect and data types")
    void testV1SchemaPostgreSqlCompatibility() throws Exception {
        ClassPathResource resource = new ClassPathResource("db/migration/V1__init_schema.sql");
        assertTrue(resource.exists(), "V1__init_schema.sql must exist");

        String sql = new BufferedReader(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))
                .lines().collect(Collectors.joining("\n"));

        // Verify PostgreSQL specific syntax
        assertTrue(sql.contains("BIGSERIAL PRIMARY KEY"), "Must use PostgreSQL BIGSERIAL for auto-incrementing PKs");
        assertTrue(sql.contains("DOUBLE PRECISION"), "Must use PostgreSQL DOUBLE PRECISION for floating point numbers");
        assertTrue(sql.contains("BOOLEAN NOT NULL DEFAULT"), "Must use PostgreSQL native BOOLEAN");
        assertTrue(sql.contains("CURRENT_TIMESTAMP"), "Must use standard SQL / PostgreSQL timestamp default");

        // Verify non-PostgreSQL keywords are NOT used
        assertFalse(sql.contains("AUTO_INCREMENT"), "Must not use MySQL AUTO_INCREMENT in PostgreSQL Flyway migration");
        assertFalse(sql.contains("DATETIME"), "Must use PostgreSQL TIMESTAMP instead of MySQL DATETIME");
        assertFalse(sql.contains("NVARCHAR"), "Must use PostgreSQL VARCHAR instead of SQL Server NVARCHAR");
    }

    @Test
    @DisplayName("Verify V2 incremental migration adheres to strict PostgreSQL DDL syntax")
    void testV2SchemaPostgreSqlCompatibility() throws Exception {
        ClassPathResource resource = new ClassPathResource("db/migration/V2__add_trainee_active_and_certification_revocation.sql");
        assertTrue(resource.exists(), "V2__add_trainee_active_and_certification_revocation.sql must exist");

        String sql = new BufferedReader(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))
                .lines().collect(Collectors.joining("\n"));

        assertTrue(sql.contains("ALTER TABLE trainees ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;"));
        assertTrue(sql.contains("ALTER TABLE certifications ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE';"));
        assertTrue(sql.contains("ALTER TABLE certifications ADD COLUMN IF NOT EXISTS revoked BOOLEAN NOT NULL DEFAULT FALSE;"));
    }

    @Test
    @DisplayName("Verify V3 incremental migration adheres to strict PostgreSQL DDL syntax")
    void testV3SchemaPostgreSqlCompatibility() throws Exception {
        ClassPathResource resource = new ClassPathResource("db/migration/V3__security_and_constraint_hardening.sql");
        assertTrue(resource.exists(), "V3__security_and_constraint_hardening.sql must exist");

        String sql = new BufferedReader(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))
                .lines().collect(Collectors.joining("\n"));

        assertTrue(sql.contains("ALTER TABLE trainees ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;"));
        assertTrue(sql.contains("uk_enrollment_trainee_batch"));
    }
}
