import React, { useState, useEffect } from 'react';
import { 
  DeveloperProfile, 
  TargetRole 
} from '../data/mockProfiles';
import { 
  GapAnalysisResult,
  AxisAnalysis
} from '../engine/gapAnalyzer';
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  Check, 
  Layers,
  BookOpen,
  MapPin,
  Zap,
  X,
  Info,
  ChevronRight,
  Filter
} from 'lucide-react';
import { AnalyticsService } from '../services/modules';
import { 
  SkillGapSummaryDTO, 
  CoursePerformanceDTO, 
  DistrictPerformanceDTO 
} from '../types/api';

interface SkillGapPageProps {
  profile: DeveloperProfile;
  targetRole: TargetRole;
  targetRoles: TargetRole[];
  onSelectRole: (role: TargetRole) => void;
  gapAnalysis: GapAnalysisResult;
  onNavigateToSheet: () => void;
}

export const SkillGapPage: React.FC<SkillGapPageProps> = ({
  profile,
  targetRole,
  targetRoles,
  onSelectRole,
  gapAnalysis,
  onNavigateToSheet,
}) => {
  const [viewMode, setViewMode] = useState<'radar' | 'delta'>('radar');
  const [activeAxisModal, setActiveAxisModal] = useState<AxisAnalysis | null>(null);
  const [filterGapCategory, setFilterGapCategory] = useState<'ALL' | 'CRITICAL' | 'PARTIAL' | 'SURPLUS'>('ALL');

  // Spring Boot Analytics State
  const [skillGapSummary, setSkillGapSummary] = useState<SkillGapSummaryDTO[]>([]);
  const [coursePerformance, setCoursePerformance] = useState<CoursePerformanceDTO[]>([]);
  const [districtPerformance, setDistrictPerformance] = useState<DistrictPerformanceDTO[]>([]);

  useEffect(() => {
    let isCancelled = false;
    async function loadAnalytics() {
      try {
        const [gaps, courses, districts] = await Promise.all([
          AnalyticsService.getSkillGapSummary(),
          AnalyticsService.getCoursePerformance(),
          AnalyticsService.getDistricts(),
        ]);
        if (!isCancelled) {
          setSkillGapSummary(gaps);
          setCoursePerformance(courses);
          setDistrictPerformance(districts);
        }
      } catch (err) {
        console.error('Failed to load skill-gap analytics', err);
      }
    }
    loadAnalytics();
    return () => { isCancelled = true; };
  }, []);

  const { axes, readinessPercentage, criticalCount, partialCount, surplusCount } = gapAnalysis;

  // Radar geometry
  const size = 320;
  const center = size / 2;
  const maxRadius = 110;
  const totalAxes = axes.length;

  const getCoordinates = (index: number, value: number, radius = maxRadius) => {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const r = (Math.min(100, Math.max(0, value)) / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      angle,
    };
  };

  const levels = [25, 50, 75, 100];
  const gridPolygons = levels.map((lvl) => {
    return axes.map((_, i) => {
      const { x, y } = getCoordinates(i, lvl);
      return `${x},${y}`;
    }).join(' ');
  });

  const userPolygonPoints = axes.map((a, i) => {
    const { x, y } = getCoordinates(i, a.userScore);
    return `${x},${y}`;
  }).join(' ');

  const targetPolygonPoints = axes.map((a, i) => {
    const { x, y } = getCoordinates(i, a.targetScore);
    return `${x},${y}`;
  }).join(' ');

  const criticalGaps = axes.filter((a) => a.status === 'CRITICAL');
  const partialGaps = axes.filter((a) => a.status === 'PARTIAL');
  const strengths = axes.filter((a) => a.status === 'SURPLUS');

  const displayedGaps = axes.filter((a) => {
    if (filterGapCategory === 'ALL') return true;
    return a.status === filterGapCategory;
  });

  return (
    <div className="w-full bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-y-auto min-h-[calc(100vh-3.5rem)] px-5 sm:px-8 py-6 space-y-6 transition-colors duration-200">
      
      {/* 1. Partner Company Benchmarks Selector Strip */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC]">
              Skill-Gap Analytics & Hiring Bars
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              Select a benchmark company pavilion to audit your verified coding footprint against their exact hiring bar.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#64748B]">Active Readiness:</span>
            <span className="text-base font-mono font-bold text-[#2cbb5d] bg-[#2cbb5d]/15 px-3 py-1 rounded-lg border border-[#2cbb5d]/30">
              {readinessPercentage}% Match
            </span>
          </div>
        </div>

        {/* 6 Partner Company Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {targetRoles.map((role) => {
            const isSelected = role.id === targetRole.id;
            return (
              <button
                key={role.id}
                onClick={() => onSelectRole(role)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-[#141414] border-[#2cbb5d] shadow-sm shadow-[#2cbb5d]/20'
                    : 'bg-[#0E0E0E] border-white/5 hover:border-white/20 hover:bg-[#121212]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F8FAFC]">{role.companyName}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#2cbb5d]" />}
                </div>
                <div className="text-[10px] font-mono text-[#64748B] truncate mt-0.5">{role.campusPavilion}</div>
                <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#94A3B8]">{role.openRoles} Roles</span>
                  <span className="text-[#2cbb5d] font-bold">{role.matchPercentage}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Primary Analytical Visuals: Interactive Radar + Visual Deficit Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT (5 cols): 6-Axis Visual Radar & Delta Visualizer */}
        <div className="lg:col-span-5 bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-xs font-bold font-mono text-[#F8FAFC] uppercase tracking-wider">
                6-Axis Telemetry
              </h3>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono bg-[#121212] p-0.5 rounded-lg border border-white/10">
              <button
                onClick={() => setViewMode('radar')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  viewMode === 'radar'
                    ? 'bg-[#38BDF8] text-black font-bold'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                Radar
              </button>
              <button
                onClick={() => setViewMode('delta')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  viewMode === 'delta'
                    ? 'bg-[#38BDF8] text-black font-bold'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                Deltas
              </button>
            </div>
          </div>

          {/* Radar or Delta Chart */}
          {viewMode === 'radar' ? (
            <div className="flex flex-col items-center justify-center pt-2">
              <svg className="w-full max-w-[320px] aspect-square overflow-visible" viewBox={`0 0 ${size} ${size}`}>
                {/* Background Concentric Polygons */}
                {gridPolygons.map((pts, idx) => (
                  <polygon
                    key={idx}
                    points={pts}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="1"
                    strokeDasharray={idx === 3 ? 'none' : '2 2'}
                  />
                ))}

                {/* Axis Radial Lines */}
                {axes.map((_, i) => {
                  const { x, y } = getCoordinates(i, 100);
                  return (
                    <line
                      key={i}
                      x1={center}
                      y1={center}
                      x2={x}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.10)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Company Benchmark Polygon (Soft Electric Blue #60A5FA) */}
                <polygon
                  points={targetPolygonPoints}
                  fill="rgba(96, 165, 250, 0.14)"
                  stroke="#60A5FA"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />

                {/* User Verified Score Polygon (LeetCode Green #2cbb5d) */}
                <polygon
                  points={userPolygonPoints}
                  fill="rgba(44, 187, 93, 0.24)"
                  stroke="#2cbb5d"
                  strokeWidth="2.5"
                />

                {/* Axis Nodes & Interactive Click Handlers */}
                {axes.map((a, i) => {
                  const userCoords = getCoordinates(i, a.userScore);
                  const targetCoords = getCoordinates(i, a.targetScore);
                  const labelCoords = getCoordinates(i, 120);

                  return (
                    <g 
                    key={a.key}
                    className="cursor-pointer group"
                    onClick={() => setActiveAxisModal(a)}
                  >
                    {/* Target node */}
                    <circle
                      cx={targetCoords.x}
                      cy={targetCoords.y}
                      r="3.5"
                      fill="#60A5FA"
                    />
                    {/* User node */}
                    <circle
                      cx={userCoords.x}
                      cy={userCoords.y}
                      r="5"
                      fill="#2cbb5d"
                      stroke="#000000"
                      strokeWidth="1.5"
                      className="group-hover:scale-125 transition-transform"
                    />
                    {/* Text Label */}
                    <text
                      x={labelCoords.x}
                      y={labelCoords.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-[9px] font-mono fill-[#CBD5E1] group-hover:fill-[#2cbb5d] transition-colors"
                    >
                      {a.label.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Radar Legend */}
            <div className="flex items-center justify-center gap-6 pt-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#2cbb5d]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2cbb5d]" />
                Your Verified Proof
              </span>
                <span className="flex items-center gap-1.5 text-[#60A5FA]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#60A5FA]" />
                  {targetRole.companyName} Bar
                </span>
              </div>
            </div>
          ) : (
            /* Delta Horizontal Bars View */
            <div className="space-y-3 pt-2">
              {axes.map((a) => {
                const diff = a.userScore - a.targetScore;
                const isSurplus = diff >= 0;

                return (
                  <div 
                    key={a.key} 
                    onClick={() => setActiveAxisModal(a)}
                    className="p-3 rounded-xl bg-[#121212] border border-white/5 hover:border-white/15 cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-semibold text-[#F8FAFC]">{a.label}</span>
                      <span className={isSurplus ? 'text-[#38BDF8] font-bold' : 'text-[#FB7185] font-bold'}>
                        {isSurplus ? `+${diff}%` : `${diff}%`}
                      </span>
                    </div>
                    <div className="relative w-full h-2 rounded-full bg-black overflow-hidden">
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-[#60A5FA] z-10"
                        style={{ left: `${a.targetScore}%` }}
                      />
                      <div
                        className={`h-full rounded-full ${
                          isSurplus ? 'bg-[#38BDF8]' : a.status === 'CRITICAL' ? 'bg-[#FB7185]' : 'bg-[#60A5FA]'
                        }`}
                        style={{ width: `${a.userScore}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Metrics Strip */}
          <div className="pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center font-mono">
            <div 
              onClick={() => setFilterGapCategory('CRITICAL')}
              className={`p-2 rounded-xl bg-[#121212] border border-white/5 cursor-pointer transition-colors ${filterGapCategory === 'CRITICAL' ? 'border-[#FB7185]' : ''}`}
            >
              <div className="text-[10px] text-[#64748B]">CRITICAL</div>
              <div className="text-base font-bold text-[#FB7185]">{criticalCount}</div>
            </div>
            <div 
              onClick={() => setFilterGapCategory('PARTIAL')}
              className={`p-2 rounded-xl bg-[#121212] border border-white/5 cursor-pointer transition-colors ${filterGapCategory === 'PARTIAL' ? 'border-[#60A5FA]' : ''}`}
            >
              <div className="text-[10px] text-[#64748B]">PARTIAL</div>
              <div className="text-base font-bold text-[#60A5FA]">{partialCount}</div>
            </div>
            <div 
              onClick={() => setFilterGapCategory('SURPLUS')}
              className={`p-2 rounded-xl bg-[#121212] border border-white/5 cursor-pointer transition-colors ${filterGapCategory === 'SURPLUS' ? 'border-[#38BDF8]' : ''}`}
            >
              <div className="text-[10px] text-[#64748B]">STRENGTHS</div>
              <div className="text-base font-bold text-[#38BDF8]">{surplusCount}</div>
            </div>
          </div>
        </div>

        {/* RIGHT (7 cols): Visual Analytical Deficit Matrix & Inspector */}
        <div className="lg:col-span-7 bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <h3 className="text-xs font-bold font-mono text-[#F8FAFC] uppercase tracking-wider">
                Skill Gap Telemetry Breakdown
              </h3>
              <p className="text-[11px] text-[#64748B]">Click any dimension for detailed remediation roadmap</p>
            </div>

            {/* Category Filter Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#64748B]">Filter:</span>
              <select
                value={filterGapCategory}
                onChange={(e) => setFilterGapCategory(e.target.value as any)}
                className="bg-[#121212] border border-white/10 rounded-lg px-2.5 py-1 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#38BDF8]"
              >
                <option value="ALL">All Dimensions ({axes.length})</option>
                <option value="CRITICAL">Critical Deficits ({criticalCount})</option>
                <option value="PARTIAL">Optimization Gaps ({partialCount})</option>
                <option value="SURPLUS">Surplus Strengths ({surplusCount})</option>
              </select>
            </div>
          </div>

          {/* Gaps List / Analytical Cards */}
          <div className="space-y-3">
            {displayedGaps.map((gap) => {
              const isCrit = gap.status === 'CRITICAL';
              const isPart = gap.status === 'PARTIAL';

              return (
                <div
                  key={gap.key}
                  onClick={() => setActiveAxisModal(gap)}
                  className={`p-3.5 rounded-xl bg-[#121212] border cursor-pointer hover:border-white/30 transition-all flex items-center justify-between gap-4 ${
                    isCrit ? 'border-l-4 border-l-[#FB7185] border-white/5' :
                    isPart ? 'border-l-4 border-l-[#60A5FA] border-white/5' :
                    'border-l-4 border-l-[#38BDF8] border-white/5'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#F8FAFC]">{gap.label}</span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        isCrit ? 'bg-[#FB7185]/10 text-[#FB7185] border-[#FB7185]/30' :
                        isPart ? 'bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/30' :
                        'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/30'
                      }`}>
                        {gap.status}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#64748B]">
                      Verified: <strong className="text-[#38BDF8]">{gap.userScore}%</strong> &bull; Target: <strong className="text-[#60A5FA]">{gap.targetScore}%</strong> &bull; Delta: <strong className={gap.delta >= 0 ? 'text-[#38BDF8]' : 'text-[#FB7185]'}>{gap.delta >= 0 ? `+${gap.delta}` : gap.delta}%</strong>
                    </div>
                  </div>

                  <button className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#181818] hover:bg-[#222222] text-[#38BDF8] border border-white/10 flex items-center gap-1 flex-shrink-0">
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick Bridge Action Callout */}
          <div className="pt-2 flex items-center justify-between border-t border-white/10">
            <span className="text-xs font-mono text-[#64748B]">
              Ready to remediate identified deficits?
            </span>
            <button
              onClick={onNavigateToSheet}
              className="px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-[#2cbb5d] text-black hover:bg-[#22a450] flex items-center gap-1.5 transition-colors shadow-sm shadow-[#2cbb5d]/20 cursor-pointer"
            >
              <span>Open Bridge Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* 3. Industry Demand vs Course Coverage Visual Analytical Matrix */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#F8FAFC] tracking-tight">
              Industry Demand vs Curriculum Coverage Matrix
            </h3>
          </div>
        </div>

        {/* Visual Demand vs Coverage Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {skillGapSummary.map((skill) => (
            <div
              key={skill.skillName}
              className={`p-3.5 rounded-xl border transition-all ${
                skill.isCurriculumGap
                  ? 'bg-[#140D0D] border-[#EF4444]/40'
                  : 'bg-[#121212] border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="text-xs font-bold text-[#F8FAFC]">{skill.skillName}</div>
                  <span className="text-[10px] font-mono text-[#64748B]">{skill.category}</span>
                </div>
                {skill.isCurriculumGap ? (
                  <span className="text-[9px] font-mono uppercase font-bold text-[#EF4444] bg-[#EF4444]/15 px-1.5 py-0.5 rounded border border-[#EF4444]/30">
                    Curriculum Gap
                  </span>
                ) : (
                  <span className="text-[9px] font-mono uppercase font-semibold text-[#38BDF8] bg-[#38BDF8]/15 px-1.5 py-0.5 rounded border border-[#38BDF8]/20">
                    Covered
                  </span>
                )}
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#CBD5E1]">
                    Coverage: <strong className={skill.isCurriculumGap ? 'text-[#EF4444]' : 'text-[#38BDF8]'}>{skill.coveragePercentageInCourses}%</strong>
                  </span>
                  <span className="text-[#38BDF8]">
                    Demand: {skill.demandCount} JDs
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-black overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      skill.isCurriculumGap ? 'bg-[#EF4444]' : 'bg-[#38BDF8]'
                    }`}
                    style={{ width: `${skill.coveragePercentageInCourses}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Visual Course Performance Tiers & District Placement Radial Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Course Performance Tiers (2 Cols) */}
        <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h4 className="text-xs font-bold font-mono text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#38BDF8]" />
                Course Performance Tiers
              </h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Placement rates, 12-month retention, and skill relevance
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {coursePerformance.map((course) => {
              const isExc = course.performanceTier === 'EXCELLENT';
              const isStable = course.performanceTier === 'STABLE';

              return (
                <div
                  key={course.courseCode}
                  className="p-3.5 rounded-xl bg-[#121212] border border-white/10 space-y-2 hover:border-[#2cbb5d]/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-[#F8FAFC]">{course.courseTitle}</h4>
                      <div className="text-[10px] font-mono text-[#64748B] mt-0.5">
                        Enrolled: {course.enrolledCount} &bull; Completed: {course.completedCount} &bull; Employed: {course.employedCount}
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border self-start sm:self-auto ${
                        isExc
                          ? 'bg-[#2cbb5d]/15 border-[#2cbb5d]/30 text-[#2cbb5d]'
                          : isStable
                          ? 'bg-[#22c55e]/15 border-[#22c55e]/30 text-[#4ade80]'
                          : 'bg-white/10 border-white/20 text-neutral-300'
                      }`}
                    >
                      {course.performanceTier}
                    </span>
                  </div>

                  {/* Visual Percentage Gauges */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5 text-[11px] font-mono">
                    <div className="p-2 rounded-lg bg-black border border-white/5 text-center">
                      <span className="text-[#64748B] block text-[9px]">PLACEMENT</span>
                      <strong className="text-[#2cbb5d] font-mono-nums">{course.employmentRate}%</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-black border border-white/5 text-center">
                      <span className="text-[#64748B] block text-[9px]">RETENTION</span>
                      <strong className="text-[#22c55e] font-mono-nums">{course.retentionRate}%</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-black border border-white/5 text-center">
                      <span className="text-[#64748B] block text-[9px]">RELEVANCE</span>
                      <strong className="text-[#4ade80] font-mono-nums">{course.trainingRelevanceRate}%</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regional District Performance with SVG Circular Ring Gauges (1 Col) */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="text-xs font-bold font-mono text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2cbb5d]" />
              District Placement
            </h4>
          </div>

          <div className="space-y-3">
            {districtPerformance.map((d) => {
              const radius = 18;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset = circumference - (d.employmentRate / 100) * circumference;

              return (
                <div
                  key={d.district}
                  className="p-3 rounded-xl bg-[#121212] border border-white/5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#F8FAFC]">{d.district}</div>
                    <div className="text-[10px] font-mono text-[#64748B]">
                      Trainees: {d.totalTrainees} &bull; Placed: {d.employedCount}
                    </div>
                  </div>

                  {/* SVG Circular Ring Meter */}
                  <div className="relative w-11 h-11 flex items-center justify-center flex-shrink-0">
                    <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 44 44">
                      <circle
                        cx="22"
                        cy="22"
                        r={radius}
                        stroke="#222222"
                        strokeWidth="3.5"
                        fill="transparent"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r={radius}
                        stroke="#2cbb5d"
                        strokeWidth="3.5"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold font-mono text-[#2cbb5d]">
                      {d.employmentRate}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* POPUP MODAL: AXIS TELEMETRY DEEP DIVE MODAL */}
      {activeAxisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D0D0D] border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setActiveAxisModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#181818] text-[#94A3B8] hover:text-[#F8FAFC] border border-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                activeAxisModal.status === 'CRITICAL' ? 'bg-[#FB7185]/15 text-[#FB7185] border-[#FB7185]/30' :
                activeAxisModal.status === 'PARTIAL' ? 'bg-[#60A5FA]/15 text-[#60A5FA] border-[#60A5FA]/30' :
                'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30'
              }`}>
                {activeAxisModal.status} DIMENSION
              </span>
              <h3 className="text-base font-bold text-[#F8FAFC] pt-1">
                {activeAxisModal.label}
              </h3>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141414] border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-[#64748B]">Your Verified Score:</span>
                <span className="text-[#38BDF8] font-bold">{activeAxisModal.userScore}%</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-[#64748B]">{targetRole.companyName} Hiring Bar:</span>
                <span className="text-[#60A5FA] font-bold">{activeAxisModal.targetScore}%</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-[#64748B]">Deficit / Surplus:</span>
                <span className={activeAxisModal.delta >= 0 ? 'text-[#38BDF8] font-bold' : 'text-[#FB7185] font-bold'}>
                  {activeAxisModal.delta >= 0 ? `+${activeAxisModal.delta}%` : `${activeAxisModal.delta}%`}
                </span>
              </div>
            </div>

            <div className="text-xs text-[#CBD5E1] leading-relaxed">
              {activeAxisModal.status === 'CRITICAL' && (
                <p>
                  This dimension falls critically below {targetRole.companyName}'s entry threshold. To clear this hurdle, focus on solving the recommended Bridge Sheet problems on distributed consensus and system architecture.
                </p>
              )}
              {activeAxisModal.status === 'PARTIAL' && (
                <p>
                  Close to compliance. Solving 2-3 targeted hard problems in this category will push your profile into full compliance.
                </p>
              )}
              {activeAxisModal.status === 'SURPLUS' && (
                <p>
                  You exceed the hiring standard for this dimension. Your verified contest ratings and repository commits provide proof of proficiency.
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => setActiveAxisModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-[#181818] hover:bg-[#222222] text-[#CBD5E1] border border-white/10 transition-colors"
              >
                Close
              </button>

              <button
                onClick={() => {
                  setActiveAxisModal(null);
                  onNavigateToSheet();
                }}
                className="px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-[#38BDF8] text-black hover:bg-[#0284C7] flex items-center gap-1.5 transition-colors"
              >
                <span>Go to Bridge Tracker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
