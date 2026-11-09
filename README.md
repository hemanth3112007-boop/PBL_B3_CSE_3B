# SkillLoop AI — Backend (Modular Spring Boot Monolith)

**Project Title:** SkillLoop AI — Unified Training, Skill Development & Employment Intelligence Platform  
**Department:** Computer Science & Engineering, DSATM (PBL 3rd Sem — Group B3)  
**Backend Team:** Harshit Agarwalla (Backend 1: Academic & Training Core) & Hemanth V (Backend 2: Employment Intelligence & Analytics)  
**Frontend Team:** Dhanush CS & Christo George  

---

## 🚀 Quick Start

### Prerequisites
- **Java 21 LTS** or higher
- Embedded Maven wrapper included (`./mvnw.cmd` on Windows, `./mvnw` on Linux/macOS)

### 1. Run the Backend (Default In-Memory DB + Pre-Seeded Demo Data)
```powershell
.\mvnw.cmd spring-boot:run
```
By default, the application runs on **`http://localhost:8080`** using an in-memory database with **PostgreSQL compatibility mode** and automatically seeds complete, realistic demonstration data across courses, batches, trainees, assessments, certifications, employment outcomes, and analytics.

### 2. Run with PostgreSQL
Ensure your PostgreSQL instance is running and the `skillloop_db` database is created, then run:
```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=postgres"
```
*(Note: Wrapping the `-D` argument in double quotes is required in PowerShell to prevent syntax splitting).*

Database credentials can be customized via environment variables or in `src/main/resources/application-postgres.properties`:
- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_NAME=skillloop_db`
- `DB_USER=postgres`
- `DB_PASSWORD=postgres`

### 3. Run the Automated Test Suite
```powershell
.\mvnw.cmd test
```
All **29 automated tests** run across academic management, verification rules, certificate eligibility, audited corrections, longitudinal follow-ups, skill-gap analysis, cross-module ownership checks, and PostgreSQL DDL syntax compatibility.

---

## 📚 API Documentation & Dev Consoles

Once the application is running:

| Service / Tool | URL | Description |
| :--- | :--- | :--- |
| **OpenAPI Specification** | [http://localhost:8080/api-docs](http://localhost:8080/api-docs) | High-contrast pure black text monospace viewer (`Accept: text/html`) with one-click JSON copy, plus raw OpenAPI 3.1 JSON for API tools (`Accept: application/json`) |
| **Interactive Swagger UI** | [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) | Interactive testing console with custom high-contrast styling |
| **Public Credential Verification** | [http://localhost:8080/api/certifications/verify/{certNumber}](http://localhost:8080/api/certifications/verify/CERT-2026-CRS-DA-01-001) | Public endpoint returning privacy-preserving certificate validity |
| **H2 Web Console** *(in default profile)* | [http://localhost:8080/h2-console](http://localhost:8080/h2-console) | Database viewer (`JDBC URL: jdbc:h2:mem:skillloopdb`, User: `sa`, Password: *(empty)*) |

---

## 🔌 REST API Endpoints Summary

### 1. Authentication & Admin Provisioning (`/api/auth`, `/api/admin/users`)
- `POST /api/auth/register` — Public registration (unconditionally assigns `Role.TRAINEE` to prevent self-elevation)
- `POST /api/auth/login` — Authenticate and receive JWT bearer token
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `POST /api/admin/users` — Administrative provisioning for staff/admin accounts (`ADMIN` only)
- `GET /api/admin/users` — List system user directory (`ADMIN` only)

### 2. Trainee Management (`/api/trainees`)
- `GET /api/trainees` — List trainees with district and active-status filtering (`STAFF` or `ADMIN`)
- `GET /api/trainees/{id}` — Get trainee profile (`STAFF`, `ADMIN`, or matching trainee owner)
- `POST /api/trainees` — Register new trainee (`STAFF` or `ADMIN`)
- `PUT /api/trainees/{id}` — Update trainee profile (`STAFF`, `ADMIN`, or matching trainee owner)
- `DELETE /api/trainees/{id}` — Soft deactivation to preserve historical records (`STAFF` or `ADMIN`)

### 3. Courses & Batches (`/api/courses`, `/api/batches`)
- `GET /api/courses` — List courses (sector filter and active-only flag)
- `GET /api/courses/{id}` — Course details and curriculum metadata
- `POST /api/courses` — Create course (`STAFF` or `ADMIN`)
- `PUT /api/courses/{id}` — Update course (`STAFF` or `ADMIN`)
- `DELETE /api/courses/{id}` — Soft deactivation of course (`STAFF` or `ADMIN`)
- `GET /api/courses/{id}/batches` — List batches allocated to a course
- `POST /api/courses/{id}/batches` — Allocate new batch cohort to course (`STAFF` or `ADMIN`)
- `GET /api/batches` — List all batches across courses with active-status filter
- `GET /api/batches/{id}` — Batch details and trainer schedule
- `POST /api/batches` — Create batch cohort with seat capacity validation (`STAFF` or `ADMIN`)
- `PUT /api/batches/{id}` — Update batch details (`STAFF` or `ADMIN`)
- `DELETE /api/batches/{id}` — Soft deactivation of batch (`STAFF` or `ADMIN`)

### 4. Enrollments & Progress Tracking (`/api/enrollments`)
- `POST /api/enrollments` — Enroll trainee into a batch (validates batch capacity and prevents duplicates)
- `GET /api/enrollments/{id}` — Get enrollment record (with ownership check)
- `PUT /api/enrollments/{id}` — Update attendance percentage and completion status (`STAFF` or `ADMIN`)
- `GET /api/enrollments/batch/{batchId}` — Roster of trainees in a batch (`STAFF` or `ADMIN`)
- `GET /api/enrollments/trainee/{traineeId}` — Academic enrollment history for a trainee (with ownership check)

### 5. Assessments & Scoring (`/api/assessments`)
- `POST /api/assessments` — Record assessment score and auto-recalculate enrollment average (`STAFF` or `ADMIN`)
- `GET /api/assessments/{id}` — Assessment details (with ownership check)
- `GET /api/assessments/enrollment/{enrollmentId}` — List all assessments for an enrollment (with ownership check)
- `PUT /api/assessments/{id}` — Audited score update (requires mandatory `correctionReason`, blocks tampering on certified enrollments)
- `DELETE /api/assessments/{id}` — Remove assessment entry and recalculate averages (`STAFF` or `ADMIN`)

### 6. Certifications & Credential Verification (`/api/certifications`)
- `POST /api/certifications` — Issue certificate (evaluates attendance threshold, all-assessment pass rule, and overall average cutoff)
- `GET /api/certifications/{id}` — Certificate details (with ownership check)
- `GET /api/certifications/enrollment/{enrollmentId}` — Retrieve certificate for an enrollment (with ownership check)
- `POST /api/certifications/{id}/revoke` — Controlled certificate revocation with mandatory reason, timestamp, and audit trail (`ADMIN` only)
- `GET /api/certifications/verify/{certificateNumber}` — **Public** credential verification (consent-aware; masks name if consent withheld)

### 7. Employment Outcomes (`/api/employment`)
- `GET /api/employment` — List all employment outcomes (`STAFF` or `ADMIN`)
- `GET /api/employment/{id}` — Get outcome details (with ownership check)
- `GET /api/employment/trainee/{traineeId}` — Get trainee employment record (with ownership check)
- `POST /api/employment` — Record new employment outcome (auto-schedules 3, 6, 12 month follow-ups)
- `PUT /api/employment/{id}` — Update outcome details (`STAFF` or `ADMIN`)
- `DELETE /api/employment/{id}` — Delete outcome (`STAFF` or `ADMIN`)

### 8. Longitudinal Follow-ups (`/api/follow-ups`)
- `GET /api/follow-ups` — List all follow-up records (`STAFF` or `ADMIN`)
- `GET /api/follow-ups/trainee/{traineeId}` — Follow-up timeline for a trainee (with ownership check)
- `GET /api/follow-ups/milestone/{milestone}` — Milestone query (`MONTH_3`, `MONTH_6`, `MONTH_12`) (`STAFF` or `ADMIN`)
- `POST /api/follow-ups/{id}/respond` — Record response; unanswered follow-ups are marked as `OUTCOME_UNKNOWN` (with ownership check)

### 9. Employment Verification (`/api/verifications`)
- `GET /api/verifications` — List all verification records (`STAFF` or `ADMIN`)
- `GET /api/verifications/outcome/{outcomeId}` — Get verifications for an outcome (with ownership check)
- `GET /api/verifications/pending` — List pending verification reviews (`STAFF` or `ADMIN`)
- `GET /api/verifications/conflicts` — List conflicting records flagged for audit (`STAFF` or `ADMIN`)
- `POST /api/verifications/outcome/{outcomeId}` — Submit verification evidence (offer letter, payslip, HR contact) (with ownership check)
- `PUT /api/verifications/{id}/review` — Audit and approve/reject/flag verification with confidence rating (`STAFF` or `ADMIN`)

### 10. Skills Taxonomy & AI Extraction (`/api/skills`)
- `GET /api/skills` — Search and list industry skill taxonomy
- `POST /api/skills` — Add new skill to taxonomy (`STAFF` or `ADMIN`)
- `GET /api/skills/course/{courseId}` — List skills mapped to a course curriculum
- `POST /api/skills/course/{courseId}` — Map skill with proficiency & hours to course
- `DELETE /api/skills/course/{courseId}/skill/{skillId}` — Unmap skill
- `POST /api/skills/extract` — Keyword & semantic skill extraction from raw job description

### 11. Employer Job Requirements (`/api/jobs`)
- `GET /api/jobs` — List active job requirements
- `GET /api/jobs/{id}` — Get job requirement details
- `POST /api/jobs` — Create job posting with required/preferred skills

### 12. Skill-Gap Analysis (`/api/skill-gap`)
- `GET /api/skill-gap` — List all completed skill-gap analysis reports
- `GET /api/skill-gap/course/{courseId}` — Get skill gaps for a course
- `POST /api/skill-gap/analyze/course/{courseId}/job/{jobId}` — Run AI skill gap analysis against a specific job
- `POST /api/skill-gap/analyze/course/{courseId}/all-jobs` — Run batch analysis across all active industry jobs

### 13. Course Improvement Recommendations (`/api/recommendations`)
- `GET /api/recommendations` — List reviewable recommendations
- `GET /api/recommendations/{id}` — Get recommendation details
- `POST /api/recommendations` — Propose new curriculum change based on skill-gap data
- `PUT /api/recommendations/{id}/status` — Update review status (`UNDER_REVIEW`, `APPROVED`, `REJECTED`, `IMPLEMENTED`)
- `PUT /api/recommendations/{id}/cohort-result` — Record measured outcomes in next cohort to test hypothesis

### 14. Analytics Engine for Dashboards (`/api/analytics`)
- `GET /api/analytics/overview` — High-level KPIs (total trainees, completed, employed, employment rate %, verified %)
- `GET /api/analytics/longitudinal` — 3, 6, 12 month retention breakdown for Recharts line/bar charts
- `GET /api/analytics/salary-bands` — Trainee monthly salary band distribution for pie/bar charts
- `GET /api/analytics/course-performance` — Course comparison scorecard (placement, retention, relevance, skill match)
- `GET /api/analytics/skill-gap-summary` — Top demanded skills vs top missing curriculum gaps
- `GET /api/analytics/districts` — Trainee outcomes grouped by district

---

## 👥 Demo Logins (Pre-Seeded)

| Username | Password | Role | Responsibilities |
| :--- | :--- | :--- | :--- |
| `admin` | `admin123` | `ADMIN` | Institutional superuser, certificate revocation, user provisioning |
| `harshit` | `staff123` | `INSTITUTE_STAFF` | Training management, course/batch allocation, evidence review |
| `hemanth` | `hemanth123` | `ADMIN` (Lead Analyst) | Employment intelligence, analytics & curriculum recommendation review |
| `dhanush` | `trainee123` | `TRAINEE` | Trainee portal (strictly sees own enrollments, assessments & outcomes) |
| `tcs_recruiter` | `employer123` | `EMPLOYER` | Industry talent requirements & demanded skill benchmarks |

---

## 🛡️ Security & Privacy Architecture
- **Stateless JWT Authentication**: Tokens generated with HMAC-SHA256.
- **Trainee Data Ownership**: `OwnershipService` transparently inspects JWT claims and enforces ownership boundaries. Any trainee attempting to view or modify another student's record receives `403 Forbidden`.
- **Soft Deactivation**: Historical trainee, course, and batch records use boolean `active` flags, preventing accidental cascade deletion and preserving longitudinal employment analytics.
- **Privacy-Safe Public Verification**: Public certificate lookup returns only verifiable credential data; recipient names are withheld unless student consent is given.
