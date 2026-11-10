import { apiRequest } from './apiClient';
import {
  AuthLoginData,
  UserSummary,
  Course,
  Batch,
  Trainee,
  Enrollment,
  Assessment,
  Certification,
  PublicCertificateVerification,
  EmploymentOutcome,
  FollowUpRecord,
  EmploymentVerification,
  SkillExtractionResponse,
  SkillGapResultRaw,
  SkillGapResult,
  CurriculumRecommendation,
  CurriculumActionType,
  CurriculumStatus,
  AnalyticsOverviewDTO,
  LongitudinalRowDTO,
  SalaryBandDistributionDTO,
  CoursePerformanceDTO,
  SkillGapSummaryDTO,
  DistrictPerformanceDTO,
} from '../types/api';
import { normalizeSkillGapResult } from '../utils/normalizers';

// 1. Authentication & User Profile Service
export const AuthService = {
  async login(credentials: { username?: string; usernameOrEmail?: string; password: string }): Promise<AuthLoginData> {
    const userVal = credentials.usernameOrEmail || credentials.username || '';
    const data = await apiRequest<AuthLoginData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: userVal,
        usernameOrEmail: userVal,
        password: credentials.password,
      }),
    });
    if (data?.token && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', data.token);
    }
    return data;
  },

  async getProfile(): Promise<UserSummary> {
    return apiRequest<UserSummary>('/auth/me');
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
    }
  },
};

// 2. Training Core Service (Courses, Batches, Trainees, Certifications)
export const TrainingService = {
  async getCourses(): Promise<Course[]> {
    return apiRequest<Course[]>('/courses');
  },

  async getBatches(): Promise<Batch[]> {
    return apiRequest<Batch[]>('/batches');
  },

  async getTrainees(): Promise<Trainee[]> {
    return apiRequest<Trainee[]>('/trainees');
  },

  async getEnrollments(): Promise<Enrollment[]> {
    return apiRequest<Enrollment[]>('/enrollments');
  },

  async getAssessments(): Promise<Assessment[]> {
    return apiRequest<Assessment[]>('/assessments');
  },

  async getCertifications(): Promise<Certification[]> {
    return apiRequest<Certification[]>('/certifications');
  },

  async verifyPublicCertificate(certNo: string): Promise<PublicCertificateVerification> {
    return apiRequest<PublicCertificateVerification>(`/public/verify/${encodeURIComponent(certNo)}`);
  },
};

// 3. Employment Intelligence Service
export const EmploymentService = {
  async getOutcomes(): Promise<EmploymentOutcome[]> {
    return apiRequest<EmploymentOutcome[]>('/outcomes');
  },

  async getFollowUps(): Promise<FollowUpRecord[]> {
    return apiRequest<FollowUpRecord[]>('/follow-ups');
  },

  async getVerifications(): Promise<EmploymentVerification[]> {
    return apiRequest<EmploymentVerification[]>('/verifications');
  },
};

// 4. Skills & Gaps Engine Service
export const SkillsService = {
  async extractSkills(jdText: string): Promise<SkillExtractionResponse> {
    return apiRequest<SkillExtractionResponse>('/skills/extract', {
      method: 'POST',
      body: JSON.stringify({ text: jdText }),
    });
  },

  async analyzeGap(traineeSkills: string[], requiredSkills: string[]): Promise<SkillGapResult> {
    const raw = await apiRequest<SkillGapResultRaw>('/skills/gap-analysis', {
      method: 'POST',
      body: JSON.stringify({
        traineeSkills,
        requiredSkills,
      }),
    });
    return normalizeSkillGapResult(raw);
  },

  async getRecommendations(filters?: {
    actionType?: CurriculumActionType;
    status?: CurriculumStatus;
  }): Promise<CurriculumRecommendation[]> {
    const params = new URLSearchParams();
    if (filters?.actionType) params.append('actionType', filters.actionType);
    if (filters?.status) params.append('status', filters.status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<CurriculumRecommendation[]>(`/recommendations${query}`);
  },
};

// 5. Analytics & Performance Intelligence Service
export const AnalyticsService = {
  async getOverview(): Promise<AnalyticsOverviewDTO> {
    return apiRequest<AnalyticsOverviewDTO>('/analytics/overview');
  },

  async getLongitudinal(): Promise<LongitudinalRowDTO[]> {
    return apiRequest<LongitudinalRowDTO[]>('/analytics/longitudinal');
  },

  async getSalaryBands(): Promise<SalaryBandDistributionDTO[]> {
    return apiRequest<SalaryBandDistributionDTO[]>('/analytics/salary-bands');
  },

  async getCoursePerformance(): Promise<CoursePerformanceDTO[]> {
    return apiRequest<CoursePerformanceDTO[]>('/analytics/course-performance');
  },

  async getSkillGapSummary(): Promise<SkillGapSummaryDTO[]> {
    return apiRequest<SkillGapSummaryDTO[]>('/analytics/skill-gap-summary');
  },

  async getDistricts(): Promise<DistrictPerformanceDTO[]> {
    return apiRequest<DistrictPerformanceDTO[]>('/analytics/districts');
  },
};
