import React, { useState, useEffect } from 'react';
import { 
  SheetTopic, 
  SheetTask, 
  TargetRole 
} from '../data/mockProfiles';
import { 
  Check, 
  ExternalLink, 
  Filter, 
  Zap,
  Clock, 
  Code2, 
  Github, 
  Lightbulb, 
  TrendingUp, 
  X,
  FileText,
  Sparkles,
  Info,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { SkillsService, AnalyticsService } from '../services/modules';
import { 
  CurriculumRecommendation, 
  CurriculumActionType, 
  CurriculumStatus,
  LongitudinalRowDTO 
} from '../types/api';

interface SheetTrackerPageProps {
  topics: SheetTopic[];
  completedTaskIds: Set<string>;
  onToggleTask: (taskId: string) => void;
  targetRole: TargetRole;
  readinessPercentage: number;
}

export const SheetTrackerPage: React.FC<SheetTrackerPageProps> = ({
  topics,
  completedTaskIds,
  onToggleTask,
  targetRole,
  readinessPercentage,
}) => {
  // Topic dropdown filter: 'ALL' or topic.id
  const [selectedTopicId, setSelectedTopicId] = useState<string>('ALL');
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  // Popup Modals
  const [activeTaskModal, setActiveTaskModal] = useState<SheetTask | null>(null);
  const [activeRecModal, setActiveRecModal] = useState<CurriculumRecommendation | null>(null);

  // Spring Boot Recommendations & Longitudinal State
  const [recommendations, setRecommendations] = useState<CurriculumRecommendation[]>([]);
  const [filterActionType, setFilterActionType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [longitudinalData, setLongitudinalData] = useState<LongitudinalRowDTO[]>([]);

  useEffect(() => {
    let isCancelled = false;
    async function loadData() {
      try {
        const actionParam = filterActionType !== 'ALL' ? (filterActionType as CurriculumActionType) : undefined;
        const statusParam = filterStatus !== 'ALL' ? (filterStatus as CurriculumStatus) : undefined;

        const [recs, longi] = await Promise.all([
          SkillsService.getRecommendations({ actionType: actionParam, status: statusParam }),
          AnalyticsService.getLongitudinal(),
        ]);
        if (!isCancelled) {
          setRecommendations(recs);
          setLongitudinalData(longi);
        }
      } catch (err) {
        console.error('Failed to load recommendations', err);
      }
    }
    loadData();
    return () => { isCancelled = true; };
  }, [filterActionType, filterStatus]);

  let totalTasks = 0;
  let completedCount = 0;
  let totalEstimatedHours = 0;

  topics.forEach((topic) => {
    topic.tasks.forEach((task) => {
      totalTasks++;
      if (completedTaskIds.has(task.id)) {
        completedCount++;
      } else {
        totalEstimatedHours += task.difficulty === 'Hard' ? 3 : task.difficulty === 'Medium' ? 1.5 : 0.8;
      }
    });
  });

  const completionPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Filter tasks based on selected topic, company, difficulty
  const displayedTopics = selectedTopicId === 'ALL'
    ? topics
    : topics.filter((t) => t.id === selectedTopicId);

  const getPlatformBadge = (platform: SheetTask['platform']) => {
    switch (platform) {
      case 'LeetCode':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#2cbb5d] bg-[#2cbb5d]/10 px-2 py-0.5 rounded border border-[#2cbb5d]/25 font-semibold">
            <Code2 className="w-3 h-3 text-[#2cbb5d]" /> LeetCode
          </span>
        );
      case 'GitHub':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#F8FAFC] bg-[#141414] px-2 py-0.5 rounded border border-white/10 font-semibold">
            <Github className="w-3 h-3 text-[#38BDF8]" /> GitHub
          </span>
        );
      case 'Codeforces':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#60A5FA] bg-[#60A5FA]/10 px-2 py-0.5 rounded border border-[#60A5FA]/25 font-semibold">
            Codeforces
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#93C5FD] bg-[#93C5FD]/10 px-2 py-0.5 rounded border border-[#93C5FD]/25 font-semibold">
            CodeChef
          </span>
        );
    }
  };

  const getDifficultyBadge = (diff: SheetTask['difficulty']) => {
    if (diff === 'Easy') {
      return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#38BDF8]/15 text-[#38BDF8] font-semibold border border-[#38BDF8]/30">Easy</span>;
    }
    if (diff === 'Medium') {
      return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#60A5FA]/15 text-[#60A5FA] font-semibold border border-[#60A5FA]/30">Medium</span>;
    }
    return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FB7185]/15 text-[#FB7185] font-semibold border border-[#FB7185]/30">Hard</span>;
  };

  return (
    <div className="w-full bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-y-auto min-h-[calc(100vh-3.5rem)] px-5 sm:px-8 py-6 space-y-6 transition-colors duration-200">
      
      {/* 1. Header & Summary Strip */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC]">
              Bridge Sheet Tracker
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              Target Benchmark: <span className="text-[#38BDF8] font-semibold">{targetRole.companyName}</span> ({targetRole.title})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Live Hiring Score</span>
              <div className="text-xl font-bold font-mono text-[#2cbb5d] font-mono-nums">
                {readinessPercentage}% Match
              </div>
            </div>
          </div>
        </div>

        {/* Compact Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
          <div className="p-3 rounded-xl bg-[#121212] border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#64748B]">TASKS COMPLETED</span>
              <span className="text-[#F8FAFC] font-bold">{completedCount} / {totalTasks} ({completionPct}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-black overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#22c55e] to-[#2cbb5d] rounded-full transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#121212] border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-[#64748B]">REMAINING EFFORT</div>
              <div className="text-base font-bold font-mono text-[#F8FAFC]">~{totalEstimatedHours.toFixed(1)} hrs</div>
            </div>
            <Clock className="w-5 h-5 text-[#38BDF8]" />
          </div>

          <div className="p-3 rounded-xl bg-[#121212] border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-[#64748B]">LIVE BOOST</div>
              <div className="text-base font-bold font-mono text-[#2cbb5d]">+{(completedCount * 1.5).toFixed(1)}% Ready</div>
            </div>
            <Zap className="w-5 h-5 text-[#2cbb5d]" />
          </div>
        </div>

        {/* Dropdown Filters Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-3">
            {/* Topic Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#64748B]">Topic:</span>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#38BDF8]"
              >
                <option value="ALL">All Topics ({topics.length})</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.tasks.length} tasks)
                  </option>
                ))}
              </select>
            </div>

            {/* Company Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#64748B]">Company:</span>
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="bg-[#121212] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#38BDF8]"
              >
                <option value="all">All Companies</option>
                {['Stripe', 'Anthropic', 'Cloudflare', 'Databricks', 'Linear'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#64748B]">Difficulty:</span>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="bg-[#121212] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#38BDF8]"
              >
                <option value="all">All Levels</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="text-[11px] font-mono text-[#64748B]">
            Showing {displayedTopics.reduce((acc, t) => acc + t.tasks.length, 0)} available tasks
          </div>
        </div>
      </div>

      {/* 2. Compact Streamlined Tasks Table */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden space-y-3">
        {displayedTopics.map((topic) => {
          const filteredTasks = topic.tasks.filter((t) => {
            const matchesComp = filterCompany === 'all' || t.requiredByCompany === filterCompany;
            const matchesDiff = filterDifficulty === 'all' || t.difficulty === filterDifficulty;
            return matchesComp && matchesDiff;
          });

          if (filteredTasks.length === 0) return null;

          const topicDone = topic.tasks.filter((t) => completedTaskIds.has(t.id)).length;

          return (
            <div key={topic.id} className="border-b border-white/10 last:border-b-0">
              {/* Topic Subheader */}
              <div className="px-5 py-3 bg-[#0E0E0E] flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-[#2cbb5d] bg-[#2cbb5d]/10 px-2 py-0.5 rounded border border-[#2cbb5d]/20">
                    {topicDone}/{topic.tasks.length}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-[#F8FAFC]">{topic.title}</h3>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#64748B]">
                  {topic.tasks.length - topicDone === 0 ? (
                    <span className="text-[#2cbb5d] font-bold">Done</span>
                  ) : (
                    `${topic.tasks.length - topicDone} remaining`
                  )}
                </span>
              </div>

              {/* Tasks List */}
              <div className="divide-y divide-white/5">
                {filteredTasks.map((task) => {
                  const isDone = completedTaskIds.has(task.id);

                  return (
                    <div
                      key={task.id}
                      className={`px-5 py-3 flex items-center justify-between gap-4 hover:bg-[#121212] transition-colors ${
                        isDone ? 'bg-[#2cbb5d]/5' : ''
                      }`}
                    >
                      {/* Left: Checkbox + Title */}
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className="w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
                          style={{
                            borderColor: isDone ? '#2cbb5d' : '#333333',
                            backgroundColor: isDone ? '#2cbb5d' : '#141414',
                          }}
                        >
                          {isDone && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                        </button>

                        <div className="min-w-0">
                          <button
                            onClick={() => setActiveTaskModal(task)}
                            className={`text-xs font-medium text-left truncate block hover:text-[#2cbb5d] transition-colors ${
                              isDone ? 'line-through text-[#64748B]' : 'text-[#F8FAFC]'
                            }`}
                          >
                            {task.title}
                          </button>
                          <span className="text-[10px] font-mono text-[#64748B] block mt-0.5">
                            Target: {task.targetSkill} &bull; {task.requiredByCompany || 'Tier-1'}
                          </span>
                        </div>
                      </div>

                      {/* Right: Badges & Popup Actions */}
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <div className="hidden sm:flex items-center gap-2">
                          {getPlatformBadge(task.platform)}
                          {getDifficultyBadge(task.difficulty)}
                          <span className="text-xs font-mono font-bold text-[#2cbb5d]">
                            +{task.impactScore}%
                          </span>
                        </div>

                        {/* Open Quick Details Popup */}
                        <button
                          onClick={() => setActiveTaskModal(task)}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#141414] hover:bg-[#1C1C1C] text-[#CBD5E1] hover:text-[#F8FAFC] border border-white/10 transition-colors"
                        >
                          Details
                        </button>

                        {/* Solve External Link */}
                        <a
                          href={task.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded-lg text-xs font-mono bg-[#141414] hover:bg-[#1C1C1C] text-[#38BDF8] border border-white/10 transition-colors"
                          title="Open problem in new tab"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Spring Boot Curriculum Recommendations */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-[#2cbb5d]" />
              Curriculum Bridge Interventions
            </h3>
          </div>

          {/* Action Type & Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterActionType}
              onChange={(e) => setFilterActionType(e.target.value)}
              className="bg-[#121212] border border-white/10 rounded-lg px-2.5 py-1 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#2cbb5d]"
            >
              <option value="ALL">All Action Types</option>
              <option value="CURRICULUM_UPDATE">Curriculum Update</option>
              <option value="PRACTICAL_PROJECT">Practical Project</option>
              <option value="INDUSTRY_PARTNERSHIP">Industry Partnership</option>
              <option value="PEDAGOGY_ENHANCEMENT">Pedagogy Enhancement</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#121212] border border-white/10 rounded-lg px-2.5 py-1 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#2cbb5d]"
            >
              <option value="ALL">All Statuses</option>
              <option value="PROPOSED">Proposed</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="IMPLEMENTED">Implemented</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Clean, Compact Interventions List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.map((rec) => (
            <div
              key={rec.id || rec.title}
              className="p-3.5 rounded-xl bg-[#121212] border border-white/10 flex items-center justify-between gap-3 hover:border-[#2cbb5d]/40 transition-colors"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-black text-[#2cbb5d] border border-white/10">
                    {rec.actionType.replace('_', ' ')}
                  </span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                    rec.status === 'IMPLEMENTED' ? 'bg-[#2cbb5d]/10 border-[#2cbb5d]/30 text-[#2cbb5d]' :
                    rec.status === 'APPROVED' ? 'bg-[#22c55e]/10 border-[#22c55e]/30 text-[#4ade80]' :
                    'bg-[#60A5FA]/10 border-[#60A5FA]/30 text-[#60A5FA]'
                  }`}>
                    {rec.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#F8FAFC] truncate">{rec.title}</h4>
                <div className="text-[10px] font-mono text-[#64748B] truncate">
                  Target: {rec.targetCohort}
                </div>
              </div>

              <button
                onClick={() => setActiveRecModal(rec)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-[#181818] hover:bg-[#222222] text-[#2cbb5d] border border-white/10 transition-colors flex items-center gap-1 flex-shrink-0"
              >
                <span>View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Longitudinal Retention Metric Banner */}
        {longitudinalData.length > 0 && (
          <div className="p-3.5 rounded-xl bg-[#0E0E0E] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4 text-[#2cbb5d] flex-shrink-0" />
              <div className="text-xs text-[#CBD5E1]">
                <strong className="text-[#F8FAFC]">12-Month Retention Impact:</strong> Interventions elevated retention to {longitudinalData[longitudinalData.length - 1]?.retentionRate ?? 86.9}%.
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono font-mono-nums">
              {longitudinalData.map((m) => (
                <div key={m.milestone} className="text-center px-2 py-1 rounded bg-[#141414] border border-white/5">
                  <span className="text-[9px] text-[#64748B] block">{m.milestone}M Retention</span>
                  <span className="font-bold text-[#2cbb5d]">{m.retentionRate}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* POPUP MODAL 1: TASK DETAILS MODAL */}
      {activeTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D0D0D] border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setActiveTaskModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#181818] text-[#94A3B8] hover:text-[#F8FAFC] border border-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {getPlatformBadge(activeTaskModal.platform)}
                {getDifficultyBadge(activeTaskModal.difficulty)}
                <span className="text-xs font-mono font-bold text-[#38BDF8]">
                  +{activeTaskModal.impactScore}% Impact
                </span>
              </div>
              <h3 className="text-base font-bold text-[#F8FAFC] pt-1">
                {activeTaskModal.title}
              </h3>
              <p className="text-xs font-mono text-[#38BDF8]">
                Target Skill: {activeTaskModal.targetSkill}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141414] border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-[#64748B]">Required By:</span>
                <span className="text-[#F8FAFC] font-semibold">{activeTaskModal.requiredByCompany || 'Tier-1 Engineering Standard'}</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-[#64748B]">Estimated Time:</span>
                <span className="text-[#F8FAFC] font-semibold">{activeTaskModal.difficulty === 'Hard' ? '3.0 Hours' : activeTaskModal.difficulty === 'Medium' ? '1.5 Hours' : '45 Minutes'}</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-[#64748B]">Current Status:</span>
                <span className={completedTaskIds.has(activeTaskModal.id) ? 'text-[#38BDF8] font-bold' : 'text-[#60A5FA] font-bold'}>
                  {completedTaskIds.has(activeTaskModal.id) ? 'Completed (Verified)' : 'Pending Solution'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  onToggleTask(activeTaskModal.id);
                  setActiveTaskModal(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 ${
                  completedTaskIds.has(activeTaskModal.id)
                    ? 'bg-[#181818] text-[#94A3B8] hover:text-[#F8FAFC] border border-white/10'
                    : 'bg-[#38BDF8] text-black hover:bg-[#0284C7]'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{completedTaskIds.has(activeTaskModal.id) ? 'Mark as Incomplete' : 'Mark as Completed'}</span>
              </button>

              <a
                href={activeTaskModal.url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-[#38BDF8] text-black hover:bg-[#0284C7] flex items-center gap-1.5 transition-colors"
              >
                <span>Launch Problem</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: CURRICULUM INTERVENTION MODAL */}
      {activeRecModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D0D0D] border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setActiveRecModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#181818] text-[#94A3B8] hover:text-[#F8FAFC] border border-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-black text-[#38BDF8] border border-white/10">
                  {activeRecModal.actionType.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
                  {activeRecModal.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#F8FAFC] pt-1">
                {activeRecModal.title}
              </h3>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-[#CBD5E1]">
              <div className="p-3 rounded-xl bg-[#141414] border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-[#38BDF8] uppercase font-bold block">Academic Justification</span>
                <p>{activeRecModal.justification}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#141414] border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-[#60A5FA] uppercase font-bold block">Efficacy Hypothesis</span>
                <p className="font-mono text-[11px] text-[#CBD5E1]">{activeRecModal.hypothesisNote}</p>
              </div>

              {activeRecModal.measuredOutcome && (
                <div className="p-3 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold block">Measured Outcome</span>
                  <p className="font-mono text-[11px]">{activeRecModal.measuredOutcome}</p>
                </div>
              )}

              <div className="flex items-center justify-between font-mono text-[11px] text-[#64748B] pt-1">
                <span>Cohort: <strong className="text-[#F8FAFC]">{activeRecModal.targetCohort}</strong></span>
                <span>Topics: <strong className="text-[#38BDF8]">{activeRecModal.suggestedTopics}</strong></span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveRecModal(null)}
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
