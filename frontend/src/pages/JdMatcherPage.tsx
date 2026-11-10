import React, { useState, useEffect } from 'react';
import { 
  DeveloperProfile, 
  TargetRole, 
  SAMPLE_JOB_DESCRIPTIONS 
} from '../data/mockProfiles';
import { 
  scanJobDescription, 
  JDMatchResult 
} from '../engine/gapAnalyzer';
import { 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  Copy, 
  Check, 
  ShieldCheck, 
  RefreshCw, 
  Brain, 
  AlertTriangle,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { SkillsService } from '../services/modules';
import { SkillGapResult, ApiRequestError, ValidationErrors } from '../types/api';

interface JdMatcherPageProps {
  profile: DeveloperProfile;
  targetRole: TargetRole;
  readinessPercentage: number;
  onOpenCardModal: () => void;
}

export const JdMatcherPage: React.FC<JdMatcherPageProps> = ({
  profile,
  targetRole,
  readinessPercentage,
  onOpenCardModal,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('jd-stripe');
  const [jdText, setJdText] = useState<string>(SAMPLE_JOB_DESCRIPTIONS[0].text);
  const [matchResult, setMatchResult] = useState<JDMatchResult>(() => {
    return scanJobDescription(SAMPLE_JOB_DESCRIPTIONS[0].text, profile);
  });
  const [copiedCard, setCopiedCard] = useState(false);

  // Popup Modal for AI Analysis & Verdict
  const [showAiModal, setShowAiModal] = useState(false);

  // Spring Boot Neural Skill Extraction & Gap Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [backendGapResult, setBackendGapResult] = useState<SkillGapResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleRunAnalysis = async (textToScan: string) => {
    setValidationErrors(null);
    setGeneralError(null);

    if (!textToScan || textToScan.trim().length < 20) {
      setValidationErrors({
        text: 'Job description text must be at least 20 characters long to extract enterprise skill requirements.',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const extraction = await SkillsService.extractSkills(textToScan);
      setExtractedSkills(extraction.extractedSkills);
      setAiSummary(extraction.aiSummary);

      const traineeSkills = [
        'Java', 'Spring Boot', 'PostgreSQL', 'Docker', 'REST APIs', 
        'Distributed Systems', 'Git', 'Go', 'Rust', 'Concurrency'
      ];

      const gapRes = await SkillsService.analyzeGap(traineeSkills, extraction.extractedSkills);
      setBackendGapResult(gapRes);
    } catch (err: unknown) {
      if (err instanceof ApiRequestError) {
        if (err.validationErrors) {
          setValidationErrors(err.validationErrors);
        } else {
          setGeneralError(err.message);
        }
      } else {
        setGeneralError('Failed to analyze job description.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    handleRunAnalysis(jdText);
  }, []);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = SAMPLE_JOB_DESCRIPTIONS.find((p) => p.id === presetId);
    if (found) {
      setJdText(found.text);
      setMatchResult(scanJobDescription(found.text, profile));
      handleRunAnalysis(found.text);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJdText(val);
    setMatchResult(scanJobDescription(val, profile));
    if (validationErrors) setValidationErrors(null);
  };

  const handleCopyCardText = () => {
    const text = `Codolio Verified Candidate: ${profile.name} (@${profile.handle})
Role Benchmark: ${targetRole.title} (${readinessPercentage}% Match)
Total DSA Solved: ${profile.stats.totalSolved} (Hard: ${profile.stats.hardSolved})
Contest Ratings: LeetCode ${profile.ratings.leetcodeRating} (${profile.ratings.leetcodeRank}), Codeforces ${profile.ratings.codeforcesRating}
GitHub Commits: ${profile.stats.githubCommits} (PRs: ${profile.stats.githubPRs})
Top Verified Skills: Go, Rust, Distributed Systems, Raft Consensus, PostgreSQL ACID, Concurrency`;
    navigator.clipboard.writeText(text);
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2000);
  };

  const activeScore = backendGapResult ? backendGapResult.matchPercentage : matchResult.matchScore;
  const activeMatchedSkills = backendGapResult ? backendGapResult.matchedSkills : matchResult.matchedSkills;
  const activeMissingSkills = backendGapResult ? backendGapResult.missingSkills : matchResult.missingSkills;

  // SVG Gauge calculations
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (activeScore / 100) * circumference;

  return (
    <div className="w-full bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-y-auto min-h-[calc(100vh-3.5rem)] px-5 sm:px-8 py-6 space-y-6 transition-colors duration-200">
      
      {/* 1. Header Strip */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC]">
              Job Description Matcher & Verified Recruiter Card
            </h2>
          </div>
        </div>
      </div>

      {/* 2. Sleek 2-Column Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* LEFT COLUMN: Clean JD Input & Analytical Telemetry */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <span className="text-xs font-bold font-mono text-[#F8FAFC] uppercase tracking-wider">
                Job Description Input
              </span>

              {/* Company Presets Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#64748B]">Preset:</span>
                <select
                  value={selectedPresetId}
                  onChange={(e) => handleSelectPreset(e.target.value)}
                  className="bg-[#121212] border border-white/10 rounded-lg px-2.5 py-1 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#38BDF8]"
                >
                  {SAMPLE_JOB_DESCRIPTIONS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.company} ({preset.title})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clean Textarea */}
            <div className="space-y-1.5">
              <textarea
                value={jdText}
                onChange={handleTextChange}
                rows={6}
                placeholder="Paste Job Description text here (minimum 20 characters)..."
                className={`w-full p-3.5 rounded-xl bg-black border text-xs font-mono text-[#CBD5E1] focus:outline-none transition-colors resize-y leading-relaxed ${
                  validationErrors?.text
                    ? 'border-[#EF4444] focus:border-[#EF4444]'
                    : 'border-white/10 focus:border-[#38BDF8]'
                }`}
              />

              {validationErrors?.text && (
                <div className="p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Validation Error: {validationErrors.text}</span>
                </div>
              )}

              {generalError && (
                <div className="p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs font-mono">
                  {generalError}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleRunAnalysis(jdText)}
                disabled={isAnalyzing}
                className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold bg-[#2cbb5d] hover:bg-[#22a450] text-[#050505] flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-sm shadow-[#2cbb5d]/25"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? 'Analyzing...' : 'Scan via Spring Boot API'}</span>
              </button>

              {(aiSummary || backendGapResult) && (
                <button
                  onClick={() => setShowAiModal(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono bg-[#141414] hover:bg-[#1E1E1E] text-[#2cbb5d] border border-[#2cbb5d]/30 hover:border-[#2cbb5d]/50 flex items-center gap-1.5 transition-colors"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>View AI Verdict</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sleek Score Gauge Strip */}
            <div className="p-3.5 rounded-xl bg-[#121212] border border-white/10 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#64748B] uppercase font-semibold block">
                  Telemetric Fit Alignment
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold font-mono text-[#2cbb5d]">
                    {activeScore}% Match
                  </span>
                  {backendGapResult && (
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        backendGapResult.matchLevel === 'HIGH_MATCH'
                          ? 'bg-[#2cbb5d]/15 border-[#2cbb5d]/30 text-[#2cbb5d]'
                          : backendGapResult.matchLevel === 'MODERATE_MATCH'
                          ? 'bg-[#0284C7]/15 border-[#0284C7]/30 text-[#38BDF8]'
                          : 'bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]'
                      }`}
                    >
                      {backendGapResult.matchLevel.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Radial Score Gauge */}
              <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
                <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 60 60">
                  <circle
                    cx="30"
                    cy="30"
                    r={radius}
                    stroke="#222222"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="30"
                    cy="30"
                    r={radius}
                    stroke="#2cbb5d"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-xs font-bold font-mono text-[#2cbb5d]">
                  {activeScore}%
                </span>
              </div>
            </div>

            {/* Matched & Missing Skills Tags */}
            <div className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-[#2cbb5d] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Matched Requirements ({activeMatchedSkills.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeMatchedSkills.map((kw) => (
                    <span
                      key={kw}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2cbb5d]/10 text-[#2cbb5d] border border-[#2cbb5d]/25"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {activeMissingSkills.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono text-[#60A5FA] font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Missing or Unverified in Profile ({activeMissingSkills.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeMissingSkills.map((kw) => (
                      <span
                        key={kw}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#60A5FA]/10 text-[#60A5FA] border border-[#60A5FA]/25"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sleek Recruiter Card Preview */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold font-mono text-[#F8FAFC] uppercase tracking-wider">
                Shareable Recruiter Card
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCardText}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#141414] hover:bg-[#1E1E1E] text-[#CBD5E1] hover:text-[#F8FAFC] border border-white/10 flex items-center gap-1.5 transition-colors"
                >
                  {copiedCard ? <Check className="w-3.5 h-3.5 text-[#2cbb5d]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCard ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={onOpenCardModal}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#2cbb5d] hover:bg-[#22a450] text-[#050505] font-bold flex items-center gap-1.5 transition-colors shadow-sm shadow-[#2cbb5d]/20"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Recruiter Card Body */}
            <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-white/10 shadow-2xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2cbb5d]/5 rounded-full blur-2xl pointer-events-none" />

              {/* User Identity */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#2cbb5d] shadow-sm shadow-[#2cbb5d]/20"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-[#F8FAFC]">{profile.name}</h4>
                      <ShieldCheck className="w-4 h-4 text-[#2cbb5d]" />
                    </div>
                    <div className="text-[11px] font-mono text-[#64748B]">@{profile.handle}</div>
                    <div className="text-[11px] text-[#CBD5E1]">{profile.title}</div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-[9px] font-mono text-[#64748B] uppercase font-semibold">Match Score</span>
                  <div className="text-2xl font-bold font-mono text-[#2cbb5d] font-mono-nums">
                    {readinessPercentage}%
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-[#141414] border border-white/5">
                  <div className="text-[9px] font-mono text-[#64748B]">TOTAL SOLVED</div>
                  <div className="text-base font-bold font-mono text-[#F8FAFC]">
                    {profile.stats.totalSolved}
                  </div>
                  <div className="text-[9px] text-[#2cbb5d] font-mono">{profile.stats.hardSolved} Hard</div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#141414] border border-white/5">
                  <div className="text-[9px] font-mono text-[#64748B]">LEETCODE</div>
                  <div className="text-base font-bold font-mono text-[#60A5FA]">
                    {profile.ratings.leetcodeRating}
                  </div>
                  <div className="text-[9px] text-[#CBD5E1] font-mono">{profile.ratings.leetcodeRank}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#141414] border border-white/5">
                  <div className="text-[9px] font-mono text-[#64748B]">COMMITS</div>
                  <div className="text-base font-bold font-mono text-[#2cbb5d]">
                    {profile.stats.githubCommits}
                  </div>
                  <div className="text-[9px] text-[#CBD5E1] font-mono">{profile.stats.githubPRs} PRs</div>
                </div>
              </div>

              {/* Target Benchmark */}
              <div className="p-3 rounded-xl bg-[#141414] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#64748B] uppercase">Target Benchmark</span>
                  <div className="text-xs font-bold text-[#F8FAFC]">{targetRole.title}</div>
                </div>
                <span className="text-[11px] font-mono text-[#2cbb5d] bg-[#2cbb5d]/15 border border-[#2cbb5d]/30 px-2 py-0.5 rounded font-bold">
                  {targetRole.compensation}
                </span>
              </div>

              {/* Skills Tags */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#64748B] uppercase">Verified Core Proficiencies</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Distributed ACID', 'Go', 'Rust', 'Raft Consensus', 'Concurrency', 'PostgreSQL'].map((s) => (
                    <span
                      key={s}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-black text-[#CBD5E1] border border-white/10"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Signature Footer */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                <div className="flex items-center gap-1 text-[#2cbb5d]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Signed by Codolio Telemetry</span>
                </div>
                <span>ID: CDS-2026-X9</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-mono text-[#64748B]">Need to view full candidate pass?</span>
            <button
              onClick={onOpenCardModal}
              className="text-xs font-mono text-[#2cbb5d] hover:underline flex items-center gap-1"
            >
              <span>Open Pass Modal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* POPUP MODAL: NEURAL AI VERDICT & EXTRACTED CAPABILITIES */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D0D0D] border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowAiModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#181818] text-[#94A3B8] hover:text-[#F8FAFC] border border-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
                Spring Boot Neural Extraction
              </span>
              <h3 className="text-base font-bold text-[#F8FAFC] pt-1">
                AI Gap Analysis & Capabilities Summary
              </h3>
            </div>

            {aiSummary && (
              <div className="p-3.5 rounded-xl bg-[#141414] border border-white/10 space-y-1.5">
                <span className="text-[10px] font-mono text-[#38BDF8] uppercase font-bold block">
                  Extracted Job Requirements
                </span>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  {aiSummary}
                </p>
                {extractedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1.5">
                    {extractedSkills.map((sk) => (
                      <span key={sk} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black text-[#CBD5E1] border border-white/10">
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {backendGapResult?.aiExplanation && (
              <div className="p-3.5 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/25 text-[#38BDF8] space-y-1.5">
                <span className="text-[10px] font-mono uppercase font-bold block">
                  Candidate Fit Verdict
                </span>
                <p className="text-xs text-[#E2E8F0] leading-relaxed">
                  {backendGapResult.aiExplanation}
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-[#181818] hover:bg-[#222222] text-[#F8FAFC] border border-white/10 transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
