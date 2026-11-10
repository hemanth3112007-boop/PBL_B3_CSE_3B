import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  ShieldCheck, 
  Code2, 
  ChevronDown,
  ExternalLink,
  Award,
  Briefcase
} from 'lucide-react';
import { DeveloperProfile, TargetRole } from '../data/mockProfiles';

interface RecruiterCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: DeveloperProfile;
  targetRole: TargetRole;
  readinessPercentage: number;
}

export const RecruiterCardModal: React.FC<RecruiterCardModalProps> = ({
  isOpen,
  onClose,
  profile,
  targetRole,
  readinessPercentage,
}) => {
  const [copied, setCopied] = useState(false);
  const [cardView, setCardView] = useState<'metrics' | 'skills' | 'terms'>('metrics');

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://codolio.com/profile/${profile.handle}?benchmark=${targetRole.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 relative text-[#F8FAFC]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#181818] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between pr-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2cbb5d] text-[#050505] flex items-center justify-center font-bold shadow-md shadow-[#2cbb5d]/20">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F8FAFC]">Recruiter Pass Card</h3>
              <p className="text-[11px] text-neutral-400">Cryptographic proof-of-competence</p>
            </div>
          </div>

          {/* Quick View Mode Dropdown */}
          <div className="relative">
            <select
              value={cardView}
              onChange={(e) => setCardView(e.target.value as 'metrics' | 'skills' | 'terms')}
              className="bg-[#141414] border border-white/10 rounded-lg px-2.5 py-1 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#2cbb5d] cursor-pointer"
            >
              <option value="metrics">View: Key Metrics</option>
              <option value="skills">View: Verified Skills</option>
              <option value="terms">View: Role & Terms</option>
            </select>
          </div>
        </div>

        {/* The Card Artifact */}
        <div className="rounded-xl bg-[#000000] border border-white/10 p-5 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#2cbb5d]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top user row */}
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
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2cbb5d]" />
                </div>
                <div className="text-[11px] font-mono text-[#71717A]">@{profile.handle}</div>
              </div>
            </div>

            {/* Circular Match Badge */}
            <div className="flex items-center gap-2 bg-[#121212] px-3 py-1.5 rounded-xl border border-white/5">
              <div className="w-2 h-2 rounded-full bg-[#2cbb5d]" />
              <div>
                <div className="text-base font-bold font-mono text-[#2cbb5d] leading-none">
                  {readinessPercentage}%
                </div>
                <span className="text-[9px] font-mono text-[#71717A] uppercase">Match</span>
              </div>
            </div>
          </div>

          {/* Dynamic Content based on View Dropdown */}
          {cardView === 'metrics' && (
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2.5 rounded-lg bg-[#0F0F0F] border border-white/5">
                <div className="text-[9px] font-mono text-[#71717A]">DSA SOLVED</div>
                <div className="text-base font-bold font-mono text-[#F8FAFC] mt-0.5">{profile.stats.totalSolved}</div>
                <div className="text-[9px] text-[#2cbb5d] font-mono">{profile.stats.hardSolved} Hard</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0F0F0F] border border-white/5">
                <div className="text-[9px] font-mono text-[#71717A]">CONTEST PEAK</div>
                <div className="text-base font-bold font-mono text-[#60A5FA] mt-0.5">{profile.ratings.leetcodeRating}</div>
                <div className="text-[9px] text-neutral-400 font-mono">{profile.ratings.leetcodeRank}</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0F0F0F] border border-white/5">
                <div className="text-[9px] font-mono text-[#71717A]">COMMITS</div>
                <div className="text-base font-bold font-mono text-[#2cbb5d] mt-0.5">{profile.stats.githubCommits}</div>
                <div className="text-[9px] text-neutral-400 font-mono">{profile.stats.githubPRs} PRs</div>
              </div>
            </div>
          )}

          {cardView === 'skills' && (
            <div className="space-y-2 pt-1">
              <div className="text-[10px] font-mono text-[#71717A] uppercase">Top Verified Capabilities</div>
              <div className="flex flex-wrap gap-1.5">
                {['Go', 'Rust', 'Spring Boot 3', 'PostgreSQL ACID', 'Distributed Consensus', 'Kafka', 'Docker'].map((sk) => (
                  <span key={sk} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141414] text-[#2cbb5d] border border-[#2cbb5d]/20">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {cardView === 'terms' && (
            <div className="p-3 rounded-lg bg-[#0F0F0F] border border-white/5 space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between text-[#71717A]">
                <span>Target Role</span>
                <span className="text-[#F8FAFC] font-semibold">{targetRole.title.split('//')[0]}</span>
              </div>
              <div className="flex items-center justify-between text-[#71717A]">
                <span>Compensation Benchmark</span>
                <span className="text-[#2cbb5d] font-semibold">{targetRole.compensation}</span>
              </div>
              <div className="flex items-center justify-between text-[#71717A]">
                <span>Availability</span>
                <span className="text-[#2cbb5d]">Immediate / 2 Weeks Notice</span>
              </div>
            </div>
          )}

          {/* Compact Trust Badge */}
          <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] font-mono text-[#71717A]">
            <span>Verified Platforms: LeetCode &bull; GitHub &bull; Spring API</span>
            <span className="text-[#2cbb5d] font-semibold">Active Profile</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleCopyLink}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[#2cbb5d] hover:bg-[#22a450] text-[#050505] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-[#2cbb5d]/20"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied!' : 'Copy Verification Link'}</span>
          </button>

          <button
            onClick={onClose}
            className="py-2 px-3.5 rounded-xl text-xs font-mono text-neutral-300 hover:text-white bg-[#141414] hover:bg-[#1E1E1E] border border-white/10 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
