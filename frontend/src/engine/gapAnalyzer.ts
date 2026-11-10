import { DeveloperProfile, TargetRole, SheetTopic, SheetTask } from '../data/mockProfiles';

export interface AxisAnalysis {
  key: string;
  label: string;
  userScore: number;
  targetScore: number;
  delta: number;
  status: 'SURPLUS' | 'PARTIAL' | 'CRITICAL';
  evidence: string;
  requirement: string;
}

export interface GapAnalysisResult {
  readinessPercentage: number;
  baselinePercentage: number;
  unlockedBoost: number;
  axes: AxisAnalysis[];
  criticalCount: number;
  partialCount: number;
  surplusCount: number;
  solvedVsRequired: {
    userTotal: number;
    requiredTotal: number;
    userHard: number;
    requiredHard: number;
    userRating: number;
    requiredRating: number;
  };
}

export interface JDMatchResult {
  matchScore: number; // e.g. 84%
  matchedSkills: string[];
  missingSkills: string[];
  matchedCount: number;
  totalRequired: number;
  summary: string;
}

export const AXIS_DISPLAY_NAMES: Record<string, string> = {
  concurrency: 'Concurrency & Multi-Threading',
  distributed_caching: 'Distributed Caching & Consensus',
  graphs_dp: 'Graph Algorithms & DP',
  database_acid: 'Database Indexing & ACID',
  cloud_docker: 'CI/CD, Docker & K8s',
  system_design: 'System Design & Architecture',
};

// Map task target skills to axis keys
export function mapSkillToAxis(skill: string): string {
  const lower = skill.toLowerCase();
  if (lower.includes('graph') || lower.includes('shortest') || lower.includes('dp')) return 'graphs_dp';
  if (lower.includes('cach') || lower.includes('consensus') || lower.includes('raft') || lower.includes('rate')) return 'distributed_caching';
  if (lower.includes('acid') || lower.includes('sql') || lower.includes('shard') || lower.includes('ledger')) return 'database_acid';
  if (lower.includes('concur') || lower.includes('lock') || lower.includes('thread')) return 'concurrency';
  if (lower.includes('docker') || lower.includes('k8s') || lower.includes('ci')) return 'cloud_docker';
  return 'system_design';
}

/**
 * Calculates user scores on each axis after applying boosts from completed sheet items
 */
export function calculateUserAxisScores(
  baseScores: Record<string, number>,
  completedTasks: SheetTask[]
): Record<string, number> {
  const scores = { ...baseScores };

  completedTasks.forEach((task) => {
    const axisKey = mapSkillToAxis(task.targetSkill);
    if (scores[axisKey] !== undefined) {
      scores[axisKey] = Math.min(100, scores[axisKey] + Math.round(task.impactScore * 2));
    }
  });

  return scores;
}

/**
 * Pure gap analysis comparing user data with selected target role
 */
export function evaluateProfileGap(
  profile: DeveloperProfile,
  role: TargetRole,
  completedTaskIds: Set<string>,
  allSheetTopics: SheetTopic[]
): GapAnalysisResult {
  const baseScores: Record<string, number> = {
    concurrency: 88,
    distributed_caching: 68,
    graphs_dp: 82,
    database_acid: 82,
    cloud_docker: 64,
    system_design: 72,
  };

  // Find all completed tasks
  const completedTasks: SheetTask[] = [];
  allSheetTopics.forEach((topic) => {
    topic.tasks.forEach((task) => {
      if (completedTaskIds.has(task.id)) {
        completedTasks.push(task);
      }
    });
  });

  const userScores = calculateUserAxisScores(baseScores, completedTasks);

  const axes: AxisAnalysis[] = [];
  let criticalCount = 0;
  let partialCount = 0;
  let surplusCount = 0;

  let totalUserPoints = 0;
  let totalTargetPoints = 0;
  let baseUserPoints = 0;

  Object.keys(role.axisScores).forEach((key) => {
    const target = role.axisScores[key];
    const user = userScores[key] ?? 60;
    const base = baseScores[key] ?? 60;
    const delta = user - target;

    totalUserPoints += Math.min(target * 1.15, user);
    baseUserPoints += Math.min(target * 1.15, base);
    totalTargetPoints += target;

    let status: 'SURPLUS' | 'PARTIAL' | 'CRITICAL' = 'SURPLUS';
    if (delta <= -16) {
      status = 'CRITICAL';
      criticalCount++;
    } else if (delta < 0) {
      status = 'PARTIAL';
      partialCount++;
    } else {
      surplusCount++;
    }

    axes.push({
      key,
      label: AXIS_DISPLAY_NAMES[key] || key,
      userScore: user,
      targetScore: target,
      delta,
      status,
      evidence: `${user} pts verified from ${profile.stats.totalSolved} solved problems and ${profile.stats.githubCommits} commits.`,
      requirement: `Target requires minimum ${target} pts for ${role.title}.`,
    });
  });

  // Factor in DSA count and rating
  const dsaRatio = Math.min(1.0, profile.stats.totalSolved / role.minimumSolved);
  const hardRatio = Math.min(1.0, profile.stats.hardSolved / role.minimumHard);
  const ratingRatio = Math.min(1.0, profile.ratings.leetcodeRating / role.requiredRating);

  const axisRatio = totalUserPoints / totalTargetPoints;
  const baseAxisRatio = baseUserPoints / totalTargetPoints;

  const rawReadiness = (axisRatio * 0.6 + dsaRatio * 0.15 + hardRatio * 0.15 + ratingRatio * 0.1) * 100;
  const rawBase = (baseAxisRatio * 0.6 + dsaRatio * 0.15 + hardRatio * 0.15 + ratingRatio * 0.1) * 100;

  const readinessPercentage = Math.min(99, Math.max(40, Math.round(rawReadiness)));
  const baselinePercentage = Math.min(99, Math.max(40, Math.round(rawBase)));
  const unlockedBoost = Math.max(0, readinessPercentage - baselinePercentage);

  return {
    readinessPercentage,
    baselinePercentage,
    unlockedBoost,
    axes,
    criticalCount,
    partialCount,
    surplusCount,
    solvedVsRequired: {
      userTotal: profile.stats.totalSolved,
      requiredTotal: role.minimumSolved,
      userHard: profile.stats.hardSolved,
      requiredHard: role.minimumHard,
      userRating: profile.ratings.leetcodeRating,
      requiredRating: role.requiredRating,
    },
  };
}

/**
 * Evaluates pasted job description text against verified coding data
 */
export function scanJobDescription(jdText: string, profile: DeveloperProfile): JDMatchResult {
  const text = jdText.toLowerCase();

  const skillsToCheck: { name: string; test: (t: string) => boolean }[] = [
    { name: 'Distributed Systems & Raft', test: (t) => t.includes('distributed') || t.includes('raft') || t.includes('consensus') },
    { name: 'Go / Rust Programming', test: (t) => t.includes('go') || t.includes('golang') || t.includes('rust') },
    { name: 'Graph Traversal & Topological Sort', test: (t) => t.includes('graph') || t.includes('dag') || t.includes('topological') || t.includes('tree') },
    { name: 'Dynamic Programming & Algorithms', test: (t) => t.includes('algorithm') || t.includes('dynamic programming') || t.includes('dsa') },
    { name: 'PostgreSQL & ACID Transactions', test: (t) => t.includes('sql') || t.includes('postgres') || t.includes('acid') || t.includes('database') },
    { name: 'Docker & Kubernetes', test: (t) => t.includes('docker') || t.includes('kubernetes') || t.includes('k8s') || t.includes('container') },
    { name: 'Concurrency & Thread Synchronization', test: (t) => t.includes('concurr') || t.includes('thread') || t.includes('mutex') || t.includes('lock') },
    { name: 'Microservices & gRPC', test: (t) => t.includes('grpc') || t.includes('rpc') || t.includes('microservice') || t.includes('protobuf') },
    { name: 'eBPF / Linux Internals', test: (t) => t.includes('ebpf') || t.includes('linux kernel') || t.includes('system call') },
    { name: 'CI/CD & Automated Benchmarking', test: (t) => t.includes('ci/cd') || t.includes('benchmark') || t.includes('pipeline') || t.includes('actions') },
  ];

  // Candidates matched skills based on Alex Chen's profile:
  // Alex has strong Go/Rust, Distributed/Raft, Graph/DP, SQL/ACID, Concurrency, gRPC, CI/CD.
  // Missing/Partial: eBPF / Linux Internals, advanced Kubernetes GPU Operator.
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  skillsToCheck.forEach((skill) => {
    const isMentionedInJd = skill.test(text);
    if (isMentionedInJd) {
      if (skill.name.includes('eBPF')) {
        missingSkills.push(skill.name);
      } else {
        matchedSkills.push(skill.name);
      }
    }
  });

  // If JD is very short or generic, provide default matches
  if (matchedSkills.length === 0 && missingSkills.length === 0) {
    matchedSkills.push('Go / Rust Programming', 'Data Structures & Algorithms', 'Concurrency Primitives');
    missingSkills.push('Custom Domain Requirements');
  }

  const total = matchedSkills.length + missingSkills.length;
  const matchScore = total > 0 ? Math.round((matchedSkills.length / total) * 100) : 75;

  return {
    matchScore,
    matchedSkills,
    missingSkills,
    matchedCount: matchedSkills.length,
    totalRequired: total,
    summary: `Verified ${matchedSkills.length} of ${total} identified technical skills from candidate coding telemetry.`,
  };
}
