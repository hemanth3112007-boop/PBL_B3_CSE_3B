import React, { useState } from 'react';
import { 
  Share2, 
  RefreshCw, 
  ChevronDown, 
  Check,
  Sun,
  Moon,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import { PageId } from './Sidebar';
import { TargetRole } from '../data/mockProfiles';
import { UserSummary } from '../types/api';

interface TopHeaderProps {
  activePage: PageId;
  targetRole: TargetRole;
  targetRoles: TargetRole[];
  onSelectTargetRole: (role: TargetRole) => void;
  onOpenCardModal: () => void;
  onRefreshSync: () => void;
  isSyncing: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  currentUser: UserSummary | null;
  onOpenLoginModal: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activePage: _activePage,
  targetRole,
  targetRoles,
  onSelectTargetRole,
  onOpenCardModal,
  onRefreshSync,
  isSyncing,
  theme,
  onToggleTheme,
  currentUser,
  onOpenLoginModal,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  return (
    <header
      className={`h-14 border-b px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm transition-colors duration-300 ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0A0A0A] border-white/10'
      }`}
    >
      <div className="flex items-center gap-2" />

      <div className="flex items-center gap-2.5">
        {/* Target Role Dropdown */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs bg-[#141414] hover:bg-[#1E1E1E] border border-white/10 text-[#F8FAFC] transition-colors shadow-sm cursor-pointer"
          >
            <span className="text-[#71717A] hidden sm:inline">Target:</span>
            <span className="font-medium truncate max-w-[170px] text-[#F8FAFC]">{targetRole.title.split('//')[0]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#71717A]" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-80 bg-[#111111] border border-white/15 rounded-xl shadow-2xl p-1.5 z-50">
              <div className="px-3 py-1.5 text-[10px] font-mono font-semibold text-[#71717A] uppercase tracking-wider border-b border-white/10">
                Select Company Benchmark
              </div>
              {targetRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    onSelectTargetRole(role);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    role.id === targetRole.id
                      ? 'bg-[#222222] text-[#F8FAFC]'
                      : 'hover:bg-[#1A1A1A] text-neutral-300'
                  }`}
                >
                  <div>
                    <div className="font-medium text-[#F8FAFC]">{role.title}</div>
                    <div className="text-[10px] font-mono text-[#38BDF8]">{role.compensation}</div>
                  </div>
                  {role.id === targetRole.id && <Check className="w-4 h-4 text-[#38BDF8]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sync Platforms Button */}
        <button
          onClick={onRefreshSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-[#141414] hover:bg-[#1E1E1E] border border-white/10 text-neutral-300 hover:text-[#F8FAFC] transition-colors cursor-pointer"
          title="Simulate refreshing coding metrics from all 5 hubs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#38BDF8] ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline font-mono text-[11px]">{isSyncing ? 'Syncing...' : 'Sync Hubs'}</span>
        </button>

        {/* Light Mode / Dark Mode Toggle Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-[#141414] hover:bg-[#1E1E1E] border border-white/10 text-neutral-300 hover:text-[#F8FAFC] transition-colors shadow-sm cursor-pointer group"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label={`Toggle to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-[#38BDF8] transition-transform group-hover:rotate-45" />
              <span className="hidden sm:inline font-mono text-[11px]">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[#0284C7] transition-transform group-hover:-rotate-12" />
              <span className="hidden sm:inline font-mono text-[11px]">Dark Mode</span>
            </>
          )}
        </button>

        {/* Sign In / Active Session Button */}
        <button
          onClick={onOpenLoginModal}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
            currentUser
              ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 hover:bg-sky-500/25'
              : 'bg-[#141414] hover:bg-[#1E1E1E] border-white/10 text-neutral-300 hover:text-white'
          }`}
          title={currentUser ? `Logged in as ${currentUser.fullName} (${currentUser.role})` : 'Sign in to your SkillLoop account'}
        >
          {currentUser ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-medium text-white max-w-[120px] truncate">{currentUser.fullName}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {currentUser.role}
              </span>
            </>
          ) : (
            <>
              <UserIcon className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Sign In</span>
            </>
          )}
        </button>

        {/* Share Codolio Card Button */}
        <button
          onClick={onOpenCardModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#2cbb5d] hover:bg-[#22a450] text-[#050505] transition-colors shadow-sm shadow-[#2cbb5d]/20 cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share Card</span>
        </button>
      </div>
    </header>
  );
};
