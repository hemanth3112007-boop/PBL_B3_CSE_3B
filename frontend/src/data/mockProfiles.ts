export interface PlatformConnection {
  id: string;
  name: string;
  handle: string;
  verified: boolean;
  lastSynced: string;
  color: string;
  rankTitle: string;
  metricLabel: string;
  metricValue: string;
  url: string;
}

export interface MonthHeatmap {
  name: string; // Jan, Feb, etc.
  days: {
    dayOfMonth: number;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
    date: string;
  }[];
}

export interface TopicStat {
  name: string;
  solved: number;
  marketTarget: number;
  category: 'Algorithms' | 'Data Structures' | 'Systems';
}

export interface ContestRatingPoint {
  month: string;
  leetcode: number;
  codeforces: number;
  codechef: number;
}

export interface SheetTask {
  id: string;
  topicId: string;
  title: string;
  platform: 'LeetCode' | 'Codeforces' | 'CodeChef' | 'GitHub';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  targetSkill: string;
  url: string;
  completed: boolean;
  impactScore: number;
  requiredByCompany?: string;
}

export interface SheetTopic {
  id: string;
  title: string;
  description: string;
  tasks: SheetTask[];
}

export interface DeveloperProfile {
  id: string;
  name: string;
  handle: string;
  title: string;
  subtitle: string;
  location: string;
  avatarUrl: string;
  bio: string;
  platforms: PlatformConnection[];
  stats: {
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    totalActiveDays: number;
    maxStreak: number;
    currentStreak: number;
    globalPercentile: number;
    githubStars: number;
    githubPRs: number;
    githubCommits: number;
  };
  ratings: {
    leetcodeRating: number;
    leetcodeRank: string;
    codeforcesRating: number;
    codeforcesRank: string;
    codechefRating: number;
    codechefStars: string;
  };
  ratingHistory: ContestRatingPoint[];
  topicStats: TopicStat[];
  monthsHeatmap: MonthHeatmap[];
  languages: { name: string; percentage: number; color: string }[];
  badges: { id: string; name: string; date: string; icon: string; category: string }[];
  partnerShortlists: {
    company: string;
    role: string;
    match: number;
    verified: boolean;
    campusZone: string;
  }[];
}

export interface TargetRole {
  id: string;
  title: string;
  companyName: string;
  campusPavilion: string;
  campusZone: string;
  openRoles: number;
  matchPercentage: number;
  companyTier: string;
  compensation: string;
  description: string;
  minimumSolved: number;
  minimumHard: number;
  requiredRating: number;
  primaryTech: string[];
  axisScores: Record<string, number>;
  criticalDeficitKeys: string[];
}

// 12 Months Heatmap Generator (Authentic Codolio month blocks)
function generate12MonthHeatmap(): MonthHeatmap[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  return months.map((month, mIdx) => {
    const daysCount = daysInMonth[mIdx];
    const days = [];
    for (let d = 1; d <= daysCount; d++) {
      const isWeekend = (d + mIdx * 2) % 7 === 0 || (d + mIdx * 2) % 7 === 6;
      let count = 0;
      const rand = Math.sin(d * 3.7 + mIdx * 11) * 0.5 + 0.5;
      if (rand > 0.32) {
        count = isWeekend ? Math.floor(rand * 8) + 1 : Math.floor(rand * 5) + 1;
      }
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count >= 7) level = 4;
      else if (count >= 4) level = 3;
      else if (count >= 2) level = 2;
      else if (count > 0) level = 1;

      days.push({
        dayOfMonth: d,
        count,
        level,
        date: `2026-${String(mIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      });
    }
    return { name: month, days };
  });
}

export const TARGET_ROLES: TargetRole[] = [
  {
    id: 'stripe-backend-l4',
    title: 'Stripe // Distributed Ledger & Backend L4',
    companyName: 'Stripe',
    campusPavilion: 'Global Payments Pavilion',
    campusZone: 'Campus Zone 01 · West Plaza',
    openRoles: 14,
    matchPercentage: 91,
    companyTier: 'Global FinTech Core',
    compensation: '$240k - $340k TC + Equity',
    description: 'Zero-loss transactional payment pipelines, ACID Serializable isolation, idempotency keys, and multi-region ledger invariants.',
    minimumSolved: 580,
    minimumHard: 85,
    requiredRating: 2050,
    primaryTech: ['Go', 'PostgreSQL', 'Distributed ACID', 'gRPC', 'Idempotency'],
    axisScores: {
      concurrency: 92,
      distributed_caching: 88,
      graphs_dp: 80,
      database_acid: 96,
      cloud_docker: 84,
      system_design: 92,
    },
    criticalDeficitKeys: ['database_acid', 'system_design'],
  },
  {
    id: 'linear-workspace-systems',
    title: 'Linear // Frontend Architecture & Sync Engine',
    companyName: 'Linear',
    campusPavilion: 'Workspace Systems Ring',
    campusZone: 'Campus Zone 02 · North Orbit',
    openRoles: 6,
    matchPercentage: 86,
    companyTier: 'High-Craft Product Studio',
    compensation: '$210k - $290k TC + Equity',
    description: 'Real-time local-first state synchronization, CRDTs, SQLite in WASM, zero-latency canvas rendering, and high-frequency WebSocket mesh.',
    minimumSolved: 480,
    minimumHard: 55,
    requiredRating: 1850,
    primaryTech: ['TypeScript', 'CRDTs / Sync', 'WASM', 'WebSockets', 'Tailwind'],
    axisScores: {
      concurrency: 86,
      distributed_caching: 82,
      graphs_dp: 74,
      database_acid: 78,
      cloud_docker: 76,
      system_design: 90,
    },
    criticalDeficitKeys: ['distributed_caching'],
  },
  {
    id: 'anthropic-frontier-ai',
    title: 'Anthropic // ML Inference & Rust Systems',
    companyName: 'Anthropic',
    campusPavilion: 'Frontier AI Ziggurat',
    campusZone: 'Campus Zone 03 · South Plateau',
    openRoles: 19,
    matchPercentage: 72,
    companyTier: 'Frontier AI Research & Compute',
    compensation: '$280k - $440k TC',
    description: 'Continuous batching kernels, GPU memory tiering (HBM3 to NVMe), Triton/CUDA profiling, and zero-allocation Rust inference runtime.',
    minimumSolved: 620,
    minimumHard: 110,
    requiredRating: 2200,
    primaryTech: ['Rust', 'CUDA / Triton', 'vLLM', 'PyTorch DDP', 'InfiniBand'],
    axisScores: {
      concurrency: 94,
      distributed_caching: 92,
      graphs_dp: 88,
      database_acid: 70,
      cloud_docker: 96,
      system_design: 94,
    },
    criticalDeficitKeys: ['concurrency', 'cloud_docker'],
  },
  {
    id: 'cloudflare-edge-network',
    title: 'Cloudflare // Core Systems & eBPF Security',
    companyName: 'Cloudflare',
    campusPavilion: 'Edge Network Twin Towers',
    campusZone: 'Campus Zone 04 · East Spire',
    openRoles: 11,
    matchPercentage: 84,
    companyTier: 'Global Edge & Network Infra',
    compensation: '$220k - $310k TC',
    description: 'Kernel-bypass packet processing, XDP / eBPF filtering, Anycast routing telemetry, and low-latency proxy protocol handling.',
    minimumSolved: 540,
    minimumHard: 80,
    requiredRating: 1950,
    primaryTech: ['Rust', 'eBPF / Linux', 'C', 'QUIC / HTTP3', 'Distributed Edge'],
    axisScores: {
      concurrency: 90,
      distributed_caching: 86,
      graphs_dp: 82,
      database_acid: 72,
      cloud_docker: 88,
      system_design: 88,
    },
    criticalDeficitKeys: ['concurrency', 'graphs_dp'],
  },
  {
    id: 'databricks-lakehouse',
    title: 'Databricks // Distributed Data & Spark Internals',
    companyName: 'Databricks',
    campusPavilion: 'Lakehouse Hex-Campus',
    campusZone: 'Campus Zone 05 · Central Concourse',
    openRoles: 9,
    matchPercentage: 79,
    companyTier: 'Data Intelligence Cloud',
    compensation: '$250k - $360k TC',
    description: 'Vectorized query execution engines, Delta Lake parquet transaction logs, partition pruning algorithms, and distributed shuffle stages.',
    minimumSolved: 560,
    minimumHard: 90,
    requiredRating: 2000,
    primaryTech: ['Scala / Java', 'C++', 'Apache Spark', 'Delta Lake', 'Distributed Query'],
    axisScores: {
      concurrency: 88,
      distributed_caching: 94,
      graphs_dp: 85,
      database_acid: 90,
      cloud_docker: 82,
      system_design: 86,
    },
    criticalDeficitKeys: ['distributed_caching', 'graphs_dp'],
  },
  {
    id: 'vercel-cloud-edge',
    title: 'Vercel // Full-Stack Infrastructure Engineer',
    companyName: 'Vercel',
    campusPavilion: 'Cloud Edge Atrium',
    campusZone: 'Campus Zone 06 · South Gateway',
    openRoles: 8,
    matchPercentage: 94,
    companyTier: 'Modern Web Cloud Platform',
    compensation: '$200k - $280k TC + Equity',
    description: 'Edge functions runtime isolation, Next.js incremental static regeneration, global cache invalidation protocols, and serverless observability.',
    minimumSolved: 440,
    minimumHard: 45,
    requiredRating: 1750,
    primaryTech: ['TypeScript', 'Rust / Turbopack', 'Edge Runtime', 'V8 Isolates', 'Next.js'],
    axisScores: {
      concurrency: 80,
      distributed_caching: 84,
      graphs_dp: 72,
      database_acid: 75,
      cloud_docker: 84,
      system_design: 86,
    },
    criticalDeficitKeys: ['distributed_caching'],
  },
  {
    id: 'openai-frontier-systems',
    title: 'OpenAI // Distributed Systems & Supercomputing Infra',
    companyName: 'OpenAI',
    campusPavilion: 'Intelligence Quad Pavilion',
    campusZone: 'Campus Zone 07 · South Frontier',
    openRoles: 22,
    matchPercentage: 76,
    companyTier: 'Frontier AI Research & Supercomputing',
    compensation: '$300k - $480k TC + Equity',
    description: 'Ultra-scale GPU orchestration, RDMA InfiniBand cluster topology, checkpoint-recovery at scale, and high-throughput vector store sharding.',
    minimumSolved: 650,
    minimumHard: 120,
    requiredRating: 2250,
    primaryTech: ['Python / C++', 'RDMA / NCCL', 'Kubernetes', 'Ray', 'Distributed Storage'],
    axisScores: {
      concurrency: 96,
      distributed_caching: 90,
      graphs_dp: 86,
      database_acid: 74,
      cloud_docker: 98,
      system_design: 96,
    },
    criticalDeficitKeys: ['concurrency', 'cloud_docker'],
  },
  {
    id: 'figma-systems-canvas',
    title: 'Figma // Realtime Canvas & Rendering Engine',
    companyName: 'Figma',
    campusPavilion: 'Design Systems & Canvas Pavilion',
    campusZone: 'Campus Zone 08 · Southeast Concourse',
    openRoles: 7,
    matchPercentage: 88,
    companyTier: 'Collaborative Creative Cloud',
    compensation: '$230k - $320k TC + Equity',
    description: 'Multiplayer WebAssembly engine, C++ 2D vector rasterizer, CRDT canvas syncing, and low-latency GPU geometry generation.',
    minimumSolved: 510,
    minimumHard: 65,
    requiredRating: 1900,
    primaryTech: ['C++ / WASM', 'WebGL / WebGPU', 'CRDTs', 'TypeScript', 'Vector Math'],
    axisScores: {
      concurrency: 88,
      distributed_caching: 80,
      graphs_dp: 78,
      database_acid: 76,
      cloud_docker: 78,
      system_design: 92,
    },
    criticalDeficitKeys: ['system_design'],
  },
];

export const PRIMARY_PROFILE: DeveloperProfile = {
  id: 'alex-chen',
  name: 'Alex Chen',
  handle: 'alex_chen_dev',
  title: 'Senior Systems & SDE-2 @ Distributed Labs',
  subtitle: 'B.Tech CS · Ex-Intern @ Cloudflare · Open Source Contributor',
  location: 'San Francisco, CA (Open to Remote / Hybrid)',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  bio: 'Building low-latency event streaming, Raft consensus engines, and database internals. Top 1.8% LeetCode Knight.',
  platforms: [
    {
      id: 'leetcode',
      name: 'LeetCode',
      handle: 'achen_algo',
      verified: true,
      lastSynced: '6m ago',
      color: '#38bdf8',
      rankTitle: 'Knight (Top 1.8%)',
      metricLabel: 'Rating',
      metricValue: '2,240',
      url: 'https://leetcode.com',
    },
    {
      id: 'codeforces',
      name: 'Codeforces',
      handle: 'alex_craft',
      verified: true,
      lastSynced: '32m ago',
      color: '#38bdf8',
      rankTitle: 'Expert',
      metricLabel: 'Rating',
      metricValue: '1,680',
      url: 'https://codeforces.com',
    },
    {
      id: 'codechef',
      name: 'CodeChef',
      handle: 'alex_dist',
      verified: true,
      lastSynced: '2h ago',
      color: '#a78bfa',
      rankTitle: '5 Star',
      metricLabel: 'Rating',
      metricValue: '2,040',
      url: 'https://codechef.com',
    },
    {
      id: 'gfg',
      name: 'GeeksforGeeks',
      handle: 'alex_chen_gate',
      verified: true,
      lastSynced: '1d ago',
      color: '#34d399',
      rankTitle: 'Master Tier',
      metricLabel: 'Score',
      metricValue: '1,890',
      url: 'https://geeksforgeeks.org',
    },
    {
      id: 'github',
      name: 'GitHub',
      handle: 'alex-chen-dev',
      verified: true,
      lastSynced: '12m ago',
      color: '#f8fafc',
      rankTitle: 'Top 1% Committer',
      metricLabel: 'Commits',
      metricValue: '3,420',
      url: 'https://github.com',
    },
  ],
  stats: {
    totalSolved: 642,
    easySolved: 218,
    mediumSolved: 312,
    hardSolved: 112,
    totalActiveDays: 218,
    maxStreak: 142,
    currentStreak: 38,
    globalPercentile: 98.2,
    githubStars: 486,
    githubPRs: 84,
    githubCommits: 3420,
  },
  ratings: {
    leetcodeRating: 2240,
    leetcodeRank: 'Knight (Top 1.8%)',
    codeforcesRating: 1680,
    codeforcesRank: 'Expert',
    codechefRating: 2040,
    codechefStars: '5★ Div 1',
  },
  ratingHistory: [
    { month: 'Nov', leetcode: 1620, codeforces: 1410, codechef: 1540 },
    { month: 'Dec', leetcode: 1740, codeforces: 1460, codechef: 1620 },
    { month: 'Jan', leetcode: 1880, codeforces: 1510, codechef: 1710 },
    { month: 'Feb', leetcode: 1960, codeforces: 1540, codechef: 1800 },
    { month: 'Mar', leetcode: 2050, codeforces: 1600, codechef: 1890 },
    { month: 'Apr', leetcode: 2110, codeforces: 1620, codechef: 1940 },
    { month: 'May', leetcode: 2170, codeforces: 1650, codechef: 1990 },
    { month: 'Jun', leetcode: 2240, codeforces: 1680, codechef: 2040 },
  ],
  topicStats: [
    { name: 'Arrays & Hashing', solved: 94, marketTarget: 80, category: 'Data Structures' },
    { name: 'Two Pointers & Sliding Window', solved: 62, marketTarget: 50, category: 'Algorithms' },
    { name: 'Trees & Binary Search', solved: 88, marketTarget: 70, category: 'Data Structures' },
    { name: 'Graphs & BFS/DFS', solved: 76, marketTarget: 65, category: 'Algorithms' },
    { name: 'Dynamic Programming', solved: 68, marketTarget: 75, category: 'Algorithms' },
    { name: 'Backtracking & Greedy', solved: 48, marketTarget: 40, category: 'Algorithms' },
    { name: 'Tries & Disjoint Sets', solved: 34, marketTarget: 30, category: 'Data Structures' },
    { name: 'Heap & Priority Queues', solved: 42, marketTarget: 35, category: 'Data Structures' },
    { name: 'Concurrency & Threads', solved: 38, marketTarget: 45, category: 'Systems' },
    { name: 'Distributed Caching', solved: 32, marketTarget: 45, category: 'Systems' },
    { name: 'SQL & Serializable ACID', solved: 36, marketTarget: 40, category: 'Systems' },
    { name: 'System Design Patterns', solved: 24, marketTarget: 35, category: 'Systems' },
  ],
  monthsHeatmap: generate12MonthHeatmap(),
  languages: [
    { name: 'Go', percentage: 42, color: '#00add8' },
    { name: 'Rust', percentage: 28, color: '#dea584' },
    { name: 'C++', percentage: 18, color: '#f34b7d' },
    { name: 'TypeScript', percentage: 8, color: '#3178c6' },
    { name: 'Python', percentage: 4, color: '#3572A5' },
  ],
  badges: [
    { id: 'b1', name: 'LeetCode Knight', date: 'Earned May 2026', icon: 'Award', category: 'Competitive' },
    { id: 'b2', name: '100 Days Badge 2026', date: 'Earned Apr 2026', icon: 'Flame', category: 'Consistency' },
    { id: 'b3', name: 'Codeforces Expert', date: 'Earned Mar 2026', icon: 'Trophy', category: 'Competitive' },
    { id: 'b4', name: 'Open Source Fellow', date: 'Earned Feb 2026', icon: 'GitPullRequest', category: 'Systems' },
  ],
  partnerShortlists: [
    { company: 'Stripe', role: 'Distributed Ledger & Backend L4', match: 91, verified: true, campusZone: 'Zone 01 · West Plaza' },
    { company: 'Vercel', role: 'Full-Stack Infrastructure Engineer', match: 94, verified: true, campusZone: 'Zone 06 · South Gateway' },
    { company: 'Linear', role: 'Frontend Architecture & Sync Engine', match: 86, verified: true, campusZone: 'Zone 02 · North Orbit' },
    { company: 'Cloudflare', role: 'Core Systems & eBPF Security', match: 84, verified: true, campusZone: 'Zone 04 · East Spire' },
    { company: 'Databricks', role: 'Distributed Data & Spark Internals', match: 79, verified: true, campusZone: 'Zone 05 · Central Concourse' },
    { company: 'Anthropic', role: 'ML Inference & Rust Systems', match: 72, verified: true, campusZone: 'Zone 03 · South Plateau' },
  ],
};

export const INITIAL_BRIDGE_TOPICS: SheetTopic[] = [
  {
    id: 'topic-distributed-caching',
    title: '1. Distributed Caching & Invalidation (Stripe & Databricks Requirement)',
    description: 'Master cache-aside, write-through, probabilistic early expiration, and Redis cluster failover.',
    tasks: [
      {
        id: 't-dc1',
        topicId: 'topic-distributed-caching',
        title: 'Design In-Memory LRU Cache with O(1) Eviction & TTL Expiry',
        platform: 'LeetCode',
        difficulty: 'Medium',
        targetSkill: 'LRU Cache Design',
        url: 'https://leetcode.com/problems/lru-cache/',
        completed: true,
        impactScore: 1.5,
        requiredByCompany: 'Stripe',
      },
      {
        id: 't-dc2',
        topicId: 'topic-distributed-caching',
        title: 'Design LFU (Least Frequently Used) Cache with Doubly Linked Lists',
        platform: 'LeetCode',
        difficulty: 'Hard',
        targetSkill: 'LFU Frequency Bucket',
        url: 'https://leetcode.com/problems/lfu-cache/',
        completed: true,
        impactScore: 2.2,
        requiredByCompany: 'Databricks',
      },
      {
        id: 't-dc3',
        topicId: 'topic-distributed-caching',
        title: 'Build Consistent Hashing Ring with Virtual Nodes in Go',
        platform: 'GitHub',
        difficulty: 'Hard',
        targetSkill: 'Consistent Hashing',
        url: 'https://github.com',
        completed: false,
        impactScore: 3.5,
        requiredByCompany: 'Cloudflare',
      },
    ],
  },
  {
    id: 'topic-acid-isolation',
    title: '2. Serializable ACID & Idempotent Transactions (Stripe & Vercel Requirement)',
    description: 'High-throughput database design: MVCC, Two-Phase Locking, and Deadlock Prevention.',
    tasks: [
      {
        id: 't-acid1',
        topicId: 'topic-acid-isolation',
        title: 'PostgreSQL Serializable Snapshot Isolation (SSI) Anomaly Detector',
        platform: 'GitHub',
        difficulty: 'Hard',
        targetSkill: 'Serializable Isolation',
        url: 'https://github.com',
        completed: false,
        impactScore: 4.0,
        requiredByCompany: 'Stripe',
      },
      {
        id: 't-acid2',
        topicId: 'topic-acid-isolation',
        title: 'Idempotent Payment Processing Webhook with Redis Leases & UUID Keys',
        platform: 'GitHub',
        difficulty: 'Medium',
        targetSkill: 'Idempotency Keys',
        url: 'https://github.com',
        completed: false,
        impactScore: 3.0,
        requiredByCompany: 'Stripe',
      },
    ],
  },
  {
    id: 'topic-graphs-dp',
    title: '3. Advanced Graph Algorithms & Flow Networks (Anthropic & Cloudflare Requirement)',
    description: 'Bipartite matching, topological sorting, and shortest path trees for DAG execution engines.',
    tasks: [
      {
        id: 't-g1',
        topicId: 'topic-graphs-dp',
        title: 'Alien Dictionary / Topological Sort with Cycle Detection',
        platform: 'LeetCode',
        difficulty: 'Hard',
        targetSkill: 'Topological Sort',
        url: 'https://leetcode.com',
        completed: true,
        impactScore: 2.0,
        requiredByCompany: 'Anthropic',
      },
      {
        id: 't-g2',
        topicId: 'topic-graphs-dp',
        title: 'Word Ladder II - Bidirectional BFS Path Reconstruction',
        platform: 'LeetCode',
        difficulty: 'Hard',
        targetSkill: 'Bidirectional BFS',
        url: 'https://leetcode.com',
        completed: false,
        impactScore: 2.8,
        requiredByCompany: 'Cloudflare',
      },
      {
        id: 't-g3',
        topicId: 'topic-graphs-dp',
        title: 'Network Delay Time - Dijkstra with Min-Heap Optimization',
        platform: 'LeetCode',
        difficulty: 'Medium',
        targetSkill: 'Dijkstra Routing',
        url: 'https://leetcode.com',
        completed: true,
        impactScore: 1.5,
        requiredByCompany: 'Cloudflare',
      },
    ],
  },
  {
    id: 'topic-concurrency',
    title: '4. Concurrency Primitives & Lock-Free Internals (Linear & Anthropic Requirement)',
    description: 'Thread synchronization, atomic CAS instructions, channel pipelines, and memory barriers.',
    tasks: [
      {
        id: 't-co1',
        topicId: 'topic-concurrency',
        title: 'Print in Order & Building H2O with Semaphores and Mutexes',
        platform: 'LeetCode',
        difficulty: 'Medium',
        targetSkill: 'Thread Synchronization',
        url: 'https://leetcode.com',
        completed: true,
        impactScore: 1.8,
        requiredByCompany: 'Linear',
      },
      {
        id: 't-co2',
        topicId: 'topic-concurrency',
        title: 'Lock-Free Single-Producer Single-Consumer Ring Buffer in Rust',
        platform: 'GitHub',
        difficulty: 'Hard',
        targetSkill: 'Lock-Free Memory',
        url: 'https://github.com',
        completed: false,
        impactScore: 3.5,
        requiredByCompany: 'Anthropic',
      },
    ],
  },
];

export const SAMPLE_JOB_DESCRIPTIONS = [
  {
    id: 'jd-stripe',
    title: 'Stripe // Distributed Ledger & Backend L4',
    company: 'Stripe',
    role: 'Distributed Ledger & Backend L4',
    text: `About Stripe Infrastructure:
Our infrastructure moves hundreds of billions of dollars per year. You will work on Stripe's core accounting engine, maintaining mathematical precision across concurrent global payments.

What You Will Do:
- Design transactional data models with PostgreSQL using Serializable isolation levels and MVCC consistency.
- Build idempotent APIs and webhook delivery systems with cryptographic HMAC validation and distributed leases.
- Solve high-concurrency race conditions, deadlock cycles, and row-level lock contention under heavy write load.
- Develop fault-tolerant payment state machines with gRPC microservices and Raft-based ledgers.
- 500+ problems solved across competitive coding platforms with high accuracy in Graph and DP algorithms.`,
  },
  {
    id: 'jd-linear',
    title: 'Linear // Frontend Architecture & Sync Engine',
    company: 'Linear',
    role: 'Frontend Architecture & Sync Engine',
    text: `About Linear:
Linear builds tools for high-performance software teams. Our app runs with zero noticeable latency through local-first sync architecture.

Requirements:
- Mastery of TypeScript, React component lifecycle, and canvas rendering pipelines.
- Deep experience in local-first database sync, Conflict-free Replicated Data Types (CRDTs), and client-side SQLite/WASM.
- Expertise in WebSocket message passing, optimistic UI mutations, and state reconciliation algorithms.
- Strong problem-solving skills in Tree traversals, Topological sorting, and Graph diffing.`,
  },
  {
    id: 'jd-anthropic',
    title: 'Anthropic // ML Inference & Rust Systems',
    company: 'Anthropic',
    role: 'ML Inference & Rust Systems',
    text: `Role Overview:
Join Anthropic's Inference Infrastructure team to build low-latency model serving engines powering frontier LLMs.

Requirements:
- Deep fluency in Rust, C++, and systems programming with zero-allocation constraints.
- Experience with CUDA memory profiling, vLLM continuous batching, and PyTorch distributed training (DDP/FSDP).
- Strong foundation in multi-threading, atomic CAS primitives, lock-free ring buffers, and NUMA memory topology.
- Proficiency in graph topological sort, dynamic memory paging, and asynchronous network pipelines.`,
  },
  {
    id: 'jd-cloudflare',
    title: 'Cloudflare // Core Systems & eBPF Security',
    company: 'Cloudflare',
    role: 'Core Systems & eBPF Security',
    text: `About Cloudflare:
Our global network protects and accelerates millions of web properties. You will work on high-speed traffic filtering at line rate.

Requirements:
- Deep experience in Rust and C for Linux kernel development and eBPF/XDP networking.
- Strong knowledge of TCP/IP, QUIC, Anycast routing, and socket multiplexing.
- Algorithmic expertise in Trie prefix lookups, consistent hashing rings, and flow network algorithms.
- Proven track record with open-source systems repositories or competitive programming rankings.`,
  },
  {
    id: 'jd-databricks',
    title: 'Databricks // Distributed Data & Spark Internals',
    company: 'Databricks',
    role: 'Distributed Data & Spark Internals',
    text: `About the Role:
Work on the query optimization engine of the Databricks Lakehouse platform processing exabytes of enterprise data.

Requirements:
- Strong algorithmic background in query execution trees, hash joins, and cost-based query optimization.
- Deep expertise in distributed caching, cache-aside invalidation, and columnar storage formats (Parquet/Delta).
- Proficient in Java, Scala, or C++ with low garbage-collection latency.
- High problem-solving capacity with 500+ solved algorithmic challenges.`,
  },
  {
    id: 'jd-vercel',
    title: 'Vercel // Full-Stack Infrastructure Engineer',
    company: 'Vercel',
    role: 'Full-Stack Infrastructure Engineer',
    text: `About Vercel:
We are building the developer platform for the web, enabling instant deployment and edge execution globally.

Requirements:
- Deep knowledge of V8 Isolates, Edge runtime environments, and HTTP/3 streaming protocols.
- Experience building high-performance TypeScript and Rust toolchains (Turbopack, Next.js internals).
- Solid grasp of global cache invalidation protocols, distributed leases, and microservice resilience patterns.
- Strong coding fundamentals in hash maps, prefix trees, and event loop synchronization.`,
  },
  {
    id: 'jd-openai',
    title: 'OpenAI // Distributed Systems & Supercomputing Infra',
    company: 'OpenAI',
    role: 'Distributed Systems & Supercomputing Infra',
    text: `About OpenAI:
OpenAI's mission is to ensure that artificial general intelligence benefits all of humanity.

Requirements:
- Strong track record in ultra-large-scale distributed systems, GPU cluster topology, and high-bandwidth interconnects (RDMA, RoCEv2, InfiniBand).
- Deep experience in checkpointing, collective communication (NCCL), and zero-loss storage replication.
- Fluency in systems programming (C++, Rust, or Python internals) and Linux kernel tracing.
- Outstanding algorithmic competence across Graph algorithms, dynamic partition hashing, and distributed locking.`,
  },
  {
    id: 'jd-figma',
    title: 'Figma // Realtime Canvas & Rendering Engine',
    company: 'Figma',
    role: 'Realtime Canvas & Rendering Engine',
    text: `About Figma:
Figma connects teams with the browser-based platform for modern product design.

Requirements:
- Deep mastery of WebAssembly, C++, and GPU-accelerated 2D graphics rendering pipelines (WebGL/WebGPU).
- Experience designing Conflict-free Replicated Data Types (CRDTs) and multi-user optimistic sync algorithms.
- Proven expertise in spatial indexing (BVH, R-trees, Quadtrees) and geometric math.
- High-level problem-solving background in tree traversals, segment trees, and concurrent state reconciliation.`,
  },
];
