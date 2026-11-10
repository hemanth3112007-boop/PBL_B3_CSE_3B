/**
 * Spring Boot / JPA Backend API Envelope and Domain Types
 */

// 1. Envelope & Error Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export type ValidationErrors = Record<string, string>;

export class ApiRequestError extends Error {
  public status: number;
  public validationErrors?: ValidationErrors;
  public timestamp?: string;

  constructor(
    status: number,
    message: string,
    validationErrors?: ValidationErrors,
    timestamp?: string
  ) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.validationErrors = validationErrors;
    this.timestamp = timestamp;
  }
}

// 2. Auth Types
export type UserRole = 'ADMIN' | 'INSTITUTE_STAFF' | 'TRAINEE' | 'EMPLOYER';

export interface AuthLoginData {
  token: string;
  tokenType: 'Bearer';
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface UserSummary {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  active: boolean;
}

// 3. Training Core Types
export interface Course {
  id?: number;
  code: string;
  title: string;
  sector: string;
  durationInWeeks: number;
  provider: string;
  district: string;
  active: boolean;
}

export interface Batch {
  id?: number;
  code: string;
  course: Course;
  startDate: string;
  endDate: string;
  trainer: string;
  maxCapacity: number;
  active: boolean;
}

export interface Trainee {
  id?: number;
  code: string;
  name: string;
  email: string;
  phone: string;
  district: string;
  dateOfBirth: string;
  gender: string;
  educationLevel: string;
  consent: boolean;
  active: boolean;
}

export type EnrollmentStatus = 'ENROLLED' | 'COMPLETED' | 'DROPPED_OUT';

export interface Enrollment {
  id?: number;
  trainee?: Trainee;
  batch?: Batch;
  status: EnrollmentStatus;
  attendancePercentage: number;
  averageAssessmentScore: number;
  certificationIssued: boolean;
  certifiedAt?: string;
}

export interface Assessment {
  id?: number;
  name: string;
  score: number;
  maxScore: number;
  passed: boolean;
  date: string;
}

export type CertificationStatus = 'ACTIVE' | 'REVOKED';

export interface Certification {
  id?: number;
  certificateNumber: string;
  issueDate: string;
  status: CertificationStatus;
  revocationReason?: string;
  revokedAt?: string;
  revokedBy?: string;
}

export interface PublicCertificateVerification {
  certificateNumber: string;
  valid: boolean;
  status: string;
  courseTitle: string;
  verifyingAuthority: string;
  issueDate: string;
  recipientName: string;
  revokedAt?: string;
  message?: string;
}

// 4. Employment Intelligence Types
export type EmploymentStatus = 
  | 'EMPLOYED' 
  | 'UNEMPLOYED' 
  | 'SELF_EMPLOYED' 
  | 'APPRENTICESHIP' 
  | 'FURTHER_EDUCATION' 
  | 'OUTCOME_UNKNOWN';

export type SalaryBand = 
  | 'BELOW_15K' 
  | 'RANGE_15K_25K' 
  | 'RANGE_25K_40K' 
  | 'ABOVE_40K' 
  | 'UNDISCLOSED';

export interface EmploymentOutcome {
  id?: number;
  status: EmploymentStatus;
  role: string;
  organization: string;
  sector: string;
  employmentType: string;
  salaryBand: SalaryBand;
  exactSalary?: number;
  joiningDate: string;
  retentionStatus: string;
  jobRelevance: string;
  verificationSource: string;
  verificationStatus: string;
  dataQualityLabel: string;
}

export interface FollowUpRecord {
  id?: number;
  milestone: 3 | 6 | 12;
  scheduledDate: string;
  contactDate: string;
  channel: 'WhatsApp' | 'SMS' | 'Web' | 'Phone';
  responseStatus: 'RESPONDED' | 'NO_RESPONSE' | 'PENDING';
  reportedStatus: EmploymentStatus;
  currentRole?: string;
  organization?: string;
  salaryBand?: SalaryBand;
}

export interface EmploymentVerification {
  id?: number;
  evidenceType: string;
  documentUrl?: string;
  employerContact?: string;
  conflict: boolean;
  conflictDetails?: string;
  confidenceScore: number;
  dataQualityLabel: string;
}

// 5. Skills & Gaps Types
export interface SkillExtractionResponse {
  extractedSkills: string[];
  aiSummary: string;
}

export type MatchLevel = 'HIGH_MATCH' | 'MODERATE_MATCH' | 'CRITICAL_GAP';

export interface SkillGapResultRaw {
  matchPercentage: number;
  matchedSkills: string; // comma-separated
  missingSkills: string; // comma-separated
  matchLevel: MatchLevel;
  aiExplanation: string;
  analyzedAt: string;
}

export interface SkillGapResult {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchLevel: MatchLevel;
  aiExplanation: string;
  analyzedAt: string;
}

export type CurriculumActionType = 
  | 'CURRICULUM_UPDATE' 
  | 'PRACTICAL_PROJECT' 
  | 'INDUSTRY_PARTNERSHIP' 
  | 'PEDAGOGY_ENHANCEMENT';

export type CurriculumStatus = 
  | 'PROPOSED' 
  | 'UNDER_REVIEW' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'IMPLEMENTED';

export interface CurriculumRecommendation {
  id?: number;
  title: string;
  actionType: CurriculumActionType;
  justification: string;
  suggestedTopics: string;
  targetCohort: string;
  status: CurriculumStatus;
  hypothesisNote: string;
  measuredOutcome?: string;
}

// 6. Analytics DTOs
export interface AnalyticsOverviewDTO {
  totalTrainees: number;
  completed: number;
  employed: number;
  selfEmployed: number;
  apprenticeship: number;
  furtherEducation: number;
  unemployed: number;
  unknown: number;
  positiveOutcomeRate: number;
  rawPlacementRate: number;
  verificationRate: number;
  activeCoursesCount: number;
  activeJobOpeningsCount: number;
  recommendationsCount: number;
}

export interface LongitudinalRowDTO {
  milestone: number;
  totalFollowedUp: number;
  stillEmployed: number;
  promoted: number;
  changedJob: number;
  leftJob: number;
  outcomeUnknown: number;
  retentionRate: number;
}

export interface SalaryBandDistributionDTO {
  band: SalaryBand;
  label: string;
  count: number;
  percentage: number;
}

export type PerformanceTier = 'EXCELLENT' | 'STABLE' | 'NEEDS_CURRICULUM_IMPROVEMENT';

export interface CoursePerformanceDTO {
  courseCode: string;
  courseTitle: string;
  enrolledCount: number;
  completedCount: number;
  employedCount: number;
  employmentRate: number;
  retentionRate: number;
  trainingRelevanceRate: number;
  averageSkillMatch: number;
  performanceTier: PerformanceTier;
}

export interface SkillGapSummaryDTO {
  skillName: string;
  category: string;
  demandCount: number;
  coveragePercentageInCourses: number;
  isCurriculumGap: boolean;
}

export interface DistrictPerformanceDTO {
  district: string;
  totalTrainees: number;
  employedCount: number;
  employmentRate: number;
}
