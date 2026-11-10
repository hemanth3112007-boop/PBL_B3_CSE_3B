import React, { useState, useEffect } from 'react';
import { 
  DeveloperProfile, 
  TargetRole, 
  TopicStat 
} from '../data/mockProfiles';
import { 
  ShieldCheck, 
  Share2, 
  Flame, 
  ExternalLink, 
  Check, 
  Clock, 
  Layers, 
  DollarSign,
  Award,
  X,
  FileBadge,
  Search,
  ChevronRight
} from 'lucide-react';
import { TrainingService, AnalyticsService, EmploymentService } from '../services/modules';
import { 
  EmploymentOutcome, 
  Certification, 
  PublicCertificateVerification,
  AnalyticsOverviewDTO,
  LongitudinalRowDTO,
  SalaryBandDistributionDTO 
} from '../types/api';

interface PortfolioPageProps {
  profile: DeveloperProfile;
  targetRole: TargetRole;
  readinessPercentage: number;
  onOpenCardModal: () => void;
  onNavigateToGapEngine?: () => void;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({
  profile,
  targetRole,
  readinessPercentage,
  onOpenCardModal,
  onNavigateToGapEngine,
}) => {
  const { stats, ratings, languages, topicStats } = profile;

  // Active Tab: 'activity' | 'topics' | 'outcomes'
  const [activeTab, setActiveTab] = useState<'activity' | 'topics' | 'outcomes'>('activity');

  // Popup Modals
  const [domainModalOpen, setDomainModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  // Platform Filter for Heatmap
  const [platformFilter, setPlatformFilter] = useState<'all' | 'leetcode' | 'github' | 'codeforces'>('all');

  // Spring Boot API State
  const [employmentOutcomes, setEmploymentOutcomes] = useState<EmploymentOutcome[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [analyticsOverview, setAnalyticsOverview] = useState<AnalyticsOverviewDTO | null>(null);
  const [longitudinalRows, setLongitudinalRows] = useState<LongitudinalRowDTO[]>([]);
  const [salaryBands, setSalaryBands] = useState<SalaryBandDistributionDTO[]>([]);
  const [verifyCertInput, setVerifyCertInput] = useState('CERT-2025-0891');
  const [verificationResult, setVerificationResult] = useState<PublicCertificateVerification | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Load Spring Boot Employment and Analytics Data
  useEffect(() => {
    let isCancelled = false;
    async function loadBackendData() {
      try {
        const [outcomes, certs, overview, longi, bands] = await Promise.all([
          EmploymentService.getOutcomes(),
          TrainingService.getCertifications(),
          AnalyticsService.getOverview(),
          AnalyticsService.getLongitudinal(),
          AnalyticsService.getSalaryBands(),
        ]);
        if (!isCancelled) {
          setEmploymentOutcomes(outcomes);
          setCertifications(certs);
          setAnalyticsOverview(overview);
          setLongitudinalRows(longi);
          setSalaryBands(bands);
        }
      } catch (err) {
        console.error('Failed to load portfolio backend telemetry', err);
      }
    }
    loadBackendData();
    return () => { isCancelled = true; };
  }, []);

  const handleVerifyCert = async (certNo: string) => {
    if (!certNo) return;
    setIsVerifying(true);
    try {
      const result = await TrainingService.verifyPublicCertificate(certNo);
      setVerificationResult(result);
    } catch (err) {
      console.error('Verification failed', err);
    } finally {
      setIsVerifying(false);
    }
  };

  // Generate 52 weeks continuous heatmap data (364 days)
  const calendarWeeks = React.useMemo(() => {
    const totalDays = 364;
    const now = new Date(2026, 3, 15);
    const startDate = new Date(now.getTime() - totalDays * 24 * 60 * 60 * 1000);

    const prng = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const days: Array<{
      date: Date;
      formattedDate: string;
      level: number;
      count: number;
      dayOfWeek: number;
      weekIndex: number;
    }> = [];

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayOfWeek = d.getDay();
      const weekIndex = Math.floor(i / 7);

      const r = prng(i * 997 + (platformFilter === 'leetcode' ? 100 : platformFilter === 'github' ? 200 : 300));
      let level = 0;
      let count = 0;

      if (r > 0.3) {
        if (r > 0.88) { level = 4; count = Math.floor(r * 12) + 6; }
        else if (r > 0.68) { level = 3; count = Math.floor(r * 7) + 3; }
        else if (r > 0.48) { level = 2; count = Math.floor(r * 4) + 1; }
        else { level = 1; count = 1; }
      }

      days.push({
        date: d,
        formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        level,
        count,
        dayOfWeek,
        weekIndex,
      });
    }

    const weeks: Array<{
      weekIndex: number;
      days: Array<(typeof days)[0] | null>;
    }> = [];

    for (let w = 0; w < 52; w++) {
      const weekDays: Array<(typeof days)[0] | null> = [];
      for (let dow = 0; dow < 7; dow++) {
        const found = days.find((item) => item.weekIndex === w && item.dayOfWeek === dow);
        weekDays.push(found || null);
      }
      weeks.push({ weekIndex: w, days: weekDays });
    }

    return weeks;
  }, [platformFilter]);

  const [hoveredDay, setHoveredDay] = useState<{
    date: Date;
    formattedDate: string;
    level: number;
    count: number;
  } | null>(null);

  // LeetCode style green activity levels
  const getCellColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-[#004d26] border-[#006030]/50';
      case 2: return 'bg-[#007038] border-[#00994d]/50';
      case 3: return 'bg-[#00a84e] border-[#00d060]/60';
      case 4: return 'bg-[#2cbb5d] border-[#4ade80] shadow-[0_0_6px_rgba(44,187,93,0.5)]';
      default: return 'bg-[#141414] border-white/5 hover:border-[#2cbb5d]/50';
    }
  };

  return (
    <div className="w-full bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-y-auto min-h-[calc(100vh-3.5rem)] px-6 sm:px-9 py-6 space-y-6 transition-colors duration-200">
      
      {/* 1. COMPACT PROFILE & BENCHMARK HEADER */}
      <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-[#2cbb5d] shadow-md shadow-[#2cbb5d]/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#F8FAFC] tracking-tight">{profile.name}</h2>
              <ShieldCheck className="w-4 h-4 text-[#2cbb5d]" />
              <span className="text-[10px] font-mono text-[#2cbb5d] bg-[#2cbb5d]/10 px-2 py-0.5 rounded border border-[#2cbb5d]/20">
                Verified Candidate
              </span>
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">
              @{profile.handle} &bull; {profile.title} &bull; Target: <strong className="text-neutral-200">{targetRole.title.split('//')[0]}</strong>
            </div>
          </div>
        </div>

        {/* Action Controls & Match Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[9px] font-mono text-neutral-400 uppercase block">Benchmark Readiness</span>
            <span className="text-xl font-bold font-mono text-[#2cbb5d]">{readinessPercentage}% Match</span>
          </div>

          <button
            onClick={onOpenCardModal}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#2cbb5d] hover:bg-[#22a450] text-[#050505] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-[#2cbb5d]/20"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Recruiter Card</span>
          </button>
        </div>
      </div>

      {/* 2. CORE METRICS STRIP (Compact & Tabular) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-white/10">
          <div className="text-[10px] font-mono uppercase text-neutral-400">Total DSA Solved</div>
          <div className="text-xl font-bold font-mono text-[#F8FAFC] mt-0.5">{stats.totalSolved}</div>
          <div className="text-[10px] text-[#38BDF8] font-mono">{stats.hardSolved} Hard Problems Verified</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-white/10">
          <div className="text-[10px] font-mono uppercase text-neutral-400">LeetCode Contest Peak</div>
          <div className="text-xl font-bold font-mono text-[#60A5FA] mt-0.5">{ratings.leetcodeRating}</div>
          <div className="text-[10px] text-neutral-400 font-mono">{ratings.leetcodeRank} (Top 1.8%)</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-white/10">
          <div className="text-[10px] font-mono uppercase text-neutral-400">GitHub Commits</div>
          <div className="text-xl font-bold font-mono text-[#38BDF8] mt-0.5">{stats.githubCommits}</div>
          <div className="text-[10px] text-neutral-400 font-mono">{stats.githubPRs} Merged PRs</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-white/10">
          <div className="text-[10px] font-mono uppercase text-neutral-400">Placement Outcome</div>
          <div className="text-xl font-bold font-mono text-[#38BDF8] mt-0.5">
            {analyticsOverview ? `${analyticsOverview.positiveOutcomeRate}%` : '94.3%'}
          </div>
          <div className="text-[10px] text-[#38BDF8] font-mono">Positive Placement Rate</div>
        </div>
      </div>

      {/* 3. SIMPLIFIED SECTION NAVIGATION (Interactive Tab Switcher) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5 p-1 bg-[#0A0A0A] rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              activeTab === 'activity'
                ? 'bg-[#181818] text-[#38BDF8] font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Activity & Heatmap
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              activeTab === 'topics'
                ? 'bg-[#181818] text-[#38BDF8] font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            DSA Topic Mastery
          </button>
          <button
            onClick={() => setActiveTab('outcomes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              activeTab === 'outcomes'
                ? 'bg-[#181818] text-[#38BDF8] font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Placement & Certifications
          </button>
        </div>

        {/* Quick Popups Triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDomainModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-[#141414] hover:bg-[#1E1E1E] text-neutral-300 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>12 Domains</span>
          </button>

          <button
            onClick={() => setAuditModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-[#141414] hover:bg-[#1E1E1E] text-neutral-300 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Audit Timeline</span>
          </button>
        </div>
      </div>

      {/* 4. TAB 1: ACTIVITY & HEATMAP */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-white/10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#38BDF8]" />
                  Annual Continuous Activity Matrix
                </h3>
                <p className="text-[11px] text-neutral-400">
                  {stats.totalActiveDays} Active Days &bull; {stats.currentStreak} Day Max Streak
                </p>
              </div>

              {/* Platform Filter Dropdown */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-neutral-400 text-[11px]">Platform:</span>
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value as any)}
                  className="bg-[#141414] border border-white/10 rounded-lg px-2.5 py-1 text-xs font-mono text-neutral-200 focus:outline-none focus:border-[#38BDF8] cursor-pointer"
                >
                  <option value="all">All Platforms</option>
                  <option value="leetcode">LeetCode Only</option>
                  <option value="github">GitHub Only</option>
                  <option value="codeforces">Codeforces Only</option>
                </select>
              </div>
            </div>

            {/* Heatmap Grid Viewport */}
            <div className="overflow-x-auto pb-2">
              <div className="inline-flex gap-1">
                {calendarWeeks.map((week) => (
                  <div key={week.weekIndex} className="flex flex-col gap-1">
                    {week.days.map((day, dIdx) => (
                      <div
                        key={dIdx}
                        onMouseEnter={() => day && setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-3 h-3 rounded-xs border transition-transform hover:scale-125 ${
                          day ? getCellColor(day.level) : 'bg-transparent border-transparent'
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Hover Tooltip display */}
            <div className="h-5 text-xs font-mono text-neutral-400 flex items-center justify-between border-t border-white/5 pt-2">
              <span>{hoveredDay ? `${hoveredDay.count} submissions on ${hoveredDay.formattedDate}` : 'Hover over any day for submission breakdown'}</span>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span>Less</span>
                <span className="w-2.5 h-2.5 rounded-xs bg-[#141414] border border-white/5" />
                <span className="w-2.5 h-2.5 rounded-xs bg-[#004d26]" />
                <span className="w-2.5 h-2.5 rounded-xs bg-[#007038]" />
                <span className="w-2.5 h-2.5 rounded-xs bg-[#00a84e]" />
                <span className="w-2.5 h-2.5 rounded-xs bg-[#2cbb5d]" />
                <span>More</span>
              </div>
            </div>
          </div>

          {/* Languages Row */}
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-300 font-semibold">Production Language Distribution</span>
              <span className="text-neutral-400">Verified Public Repositories</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#141414] overflow-hidden flex">
              {languages.map((lang) => (
                <div key={lang.name} style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }} />
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-[11px] font-mono text-neutral-300">
              {languages.map((lang) => (
                <span key={lang.name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.color }} />
                  {lang.name} ({lang.percentage}%)
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 2: TOPIC MASTERY (With "View All Domains" Popup) */}
      {activeTab === 'topics' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#F8FAFC]">High-Priority Core Domains</h3>
                <p className="text-[11px] text-neutral-400">Key algorithmic categories tested by Tier-1 enterprise campuses</p>
              </div>

              {/* Popup trigger button */}
              <button
                onClick={() => setDomainModalOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#141414] hover:bg-[#1E1E1E] text-[#38BDF8] border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>View All 12 Domains</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Displaying first 6 key topics compactly */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {topicStats.slice(0, 6).map((topic: TopicStat) => {
                const ratio = Math.min(100, Math.round((topic.solved / topic.marketTarget) * 100));
                const isMet = topic.solved >= topic.marketTarget;
                return (
                  <div key={topic.name} className="p-3 rounded-xl bg-[#121212] border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#F8FAFC]">{topic.name}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isMet ? 'text-[#38BDF8] bg-[#38BDF8]/10' : 'text-[#60A5FA] bg-[#60A5FA]/10'}`}>
                        {isMet ? 'Target Met' : `${topic.marketTarget - topic.solved} left`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                      <span>{topic.solved} / {topic.marketTarget}</span>
                      <span>{ratio}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#181818] overflow-hidden">
                      <div className={`h-full rounded-full ${isMet ? 'bg-[#38BDF8]' : 'bg-[#60A5FA]'}`} style={{ width: `${ratio}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 3: PLACEMENT & CERTIFICATIONS */}
      {activeTab === 'outcomes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Left: Verified Certifications & Outcome */}
            <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#38BDF8]" />
                  Cryptographic Certifications
                </h3>
                <button
                  onClick={() => setVerifyModalOpen(true)}
                  className="text-xs font-mono text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Query Registry</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2.5">
                {certifications.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-[#121212] border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono font-bold text-[#F8FAFC] flex items-center gap-1.5">
                        <FileBadge className="w-3.5 h-3.5 text-[#38BDF8]" />
                        <span>{c.certificateNumber}</span>
                      </div>
                      <div className="text-[10px] font-mono text-neutral-400 mt-0.5">
                        Issued: {c.issueDate} &bull; Status: <span className="text-[#38BDF8] font-semibold">{c.status}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setVerifyCertInput(c.certificateNumber);
                        handleVerifyCert(c.certificateNumber);
                        setVerifyModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#181818] hover:bg-[#222222] text-[#38BDF8] border border-white/10 transition-colors cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                ))}
              </div>

              {/* Active Employment Outcome */}
              {employmentOutcomes.length > 0 && (
                <div className="p-3.5 rounded-xl bg-[#000000] border border-[#38BDF8]/20 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[#38BDF8] font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Active Role: {employmentOutcomes[0].role}
                    </span>
                    <span className="text-[10px] text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded">
                      {employmentOutcomes[0].dataQualityLabel}
                    </span>
                  </div>
                  <div className="text-neutral-400">
                    Organization: <strong className="text-neutral-200">{employmentOutcomes[0].organization}</strong> &bull; Status: <span className="text-[#38BDF8]">{employmentOutcomes[0].retentionStatus}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Salary Band Distribution */}
            <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#38BDF8]" />
                  Verified Compensation Distribution
                </h3>
                <span className="text-[10px] font-mono text-[#38BDF8]">INR Verified</span>
              </div>

              <div className="space-y-3">
                {salaryBands.map((band) => (
                  <div key={band.band} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-300 font-medium">{band.label}</span>
                      <span className="font-bold text-[#38BDF8]">{band.percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#141414] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          band.band === 'ABOVE_40K' ? 'bg-[#38BDF8]' : 'bg-[#0284C7]'
                        }`}
                        style={{ width: `${band.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-[#121212] border border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400">12-Month Audit Retention:</span>
                <button
                  onClick={() => setAuditModalOpen(true)}
                  className="text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  <span>{longitudinalRows[longitudinalRows.length - 1]?.retentionRate ?? 86.9}% (View Timeline)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* POPUP 1: DOMAIN BREAKDOWN MODAL */}
      {domainModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0A0A0A] border border-white/15 rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#F8FAFC]">All 12 Tracked Technical Domains</h3>
                <p className="text-xs text-neutral-400">Granular progress against Tier-1 enterprise benchmarks</p>
              </div>
              <button
                onClick={() => setDomainModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-[#181818] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto pr-1">
              {topicStats.map((topic: TopicStat) => {
                const ratio = Math.min(100, Math.round((topic.solved / topic.marketTarget) * 100));
                const isMet = topic.solved >= topic.marketTarget;
                return (
                  <div key={topic.name} className="p-3 rounded-xl bg-[#121212] border border-white/5 space-y-1.5">
                    <div className="text-xs font-bold text-[#F8FAFC]">{topic.name}</div>
                    <span className="text-[10px] font-mono text-neutral-500 block">{topic.category}</span>
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-300">
                      <span>{topic.solved} / {topic.marketTarget}</span>
                      <span className={isMet ? 'text-[#38BDF8]' : 'text-[#60A5FA]'}>{ratio}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#181818] overflow-hidden">
                      <div className={`h-full rounded-full ${isMet ? 'bg-[#38BDF8]' : 'bg-[#60A5FA]'}`} style={{ width: `${ratio}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setDomainModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono bg-[#141414] hover:bg-[#1E1E1E] text-neutral-300 hover:text-white border border-white/10 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 2: LONGITUDINAL AUDIT TIMELINE MODAL */}
      {auditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0A0A0A] border border-white/15 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#38BDF8]" />
                  Post-Placement Longitudinal Audit (3m / 6m / 12m)
                </h3>
                <p className="text-xs text-neutral-400">Automated retention follow-ups via WhatsApp, SMS, and Web</p>
              </div>
              <button
                onClick={() => setAuditModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-[#181818] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {longitudinalRows.map((row) => {
                const channel = row.milestone === 3 ? 'WhatsApp' : row.milestone === 6 ? 'SMS' : 'Web';
                return (
                  <div key={row.milestone} className="p-3.5 rounded-xl bg-[#121212] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-[#181818] text-[#38BDF8] flex items-center justify-center text-xs font-mono font-bold">
                          {row.milestone}m
                        </span>
                        <div>
                          <div className="text-xs font-bold text-[#F8FAFC]">{row.milestone}-Month Cohort Retention</div>
                          <div className="text-[10px] font-mono text-neutral-400">Channel: {channel} &bull; Followed Up: {row.totalFollowedUp}</div>
                        </div>
                      </div>
                      <span className="text-base font-bold font-mono text-[#38BDF8]">{row.retentionRate}%</span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-[#181818] overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#0284C7] to-[#38BDF8] rounded-full" style={{ width: `${row.retentionRate}%` }} />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-1 border-t border-white/5">
                      <span>Still Employed: <strong className="text-white">{row.stillEmployed}</strong></span>
                      <span>Promoted: <strong className="text-[#38BDF8]">{row.promoted}</strong></span>
                      <span>Role Upgrade: <strong className="text-[#60A5FA]">{row.changedJob}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setAuditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono bg-[#141414] hover:bg-[#1E1E1E] text-neutral-300 hover:text-white border border-white/10 cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 3: PUBLIC CERTIFICATE VERIFICATION MODAL */}
      {verifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0A0A0A] border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
                  Cryptographic Certificate Verification
                </h3>
                <p className="text-xs text-neutral-400">Official blockchain &amp; training registrar</p>
              </div>
              <button
                onClick={() => setVerifyModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-[#181818] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={verifyCertInput}
                onChange={(e) => setVerifyCertInput(e.target.value)}
                placeholder="Enter Certificate ID"
                className="flex-1 bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#38BDF8]"
              />
              <button
                onClick={() => handleVerifyCert(verifyCertInput)}
                disabled={isVerifying}
                className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-[#38BDF8] hover:bg-[#0284C7] text-[#050505] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isVerifying ? 'Querying...' : 'Query'}</span>
              </button>
            </div>

            {verificationResult && (
              <div className="p-4 rounded-xl bg-[#000000] border border-[#38BDF8]/30 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F8FAFC]">{verificationResult.certificateNumber}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#38BDF8]/15 text-[#38BDF8] font-bold">
                    {verificationResult.status}
                  </span>
                </div>
                <div className="text-neutral-300 font-sans font-semibold">{verificationResult.courseTitle}</div>
                <div className="text-neutral-400 text-[11px]">Authority: {verificationResult.verifyingAuthority}</div>
                <div className="text-neutral-400 text-[11px]">Recipient: <strong className="text-[#38BDF8]">{verificationResult.recipientName}</strong></div>
                <div className="text-[10px] text-[#38BDF8] bg-[#38BDF8]/10 p-2 rounded-lg border border-[#38BDF8]/20">
                  &bull; {verificationResult.message}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setVerifyModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono bg-[#141414] hover:bg-[#1E1E1E] text-neutral-300 hover:text-white border border-white/10 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
