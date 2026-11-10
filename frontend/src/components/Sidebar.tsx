import React from 'react';
import { 
  Building2,
  User, 
  Target, 
  CheckSquare, 
  FileText,
  Sun,
  Moon
} from 'lucide-react';

export type PageId = 'skyline' | 'portfolio' | 'gap-engine' | 'sheet-tracker' | 'jd-matcher';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  readinessPercentage: number;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  readinessPercentage,
  theme = 'dark',
  onToggleTheme,
}) => {
  const navItems = [
    {
      id: 'skyline' as PageId,
      number: '01',
      label: 'Tech Park Campus',
      subtitle: '3D Master-Planned Hubs',
      icon: Building2,
      badge: '3D WebGL',
    },
    {
      id: 'portfolio' as PageId,
      number: '02',
      label: 'Developer Portfolio',
      subtitle: 'Codolio Profile & Heatmap',
      icon: User,
    },
    {
      id: 'gap-engine' as PageId,
      number: '03',
      label: 'Skill-Gap Engine',
      subtitle: 'Partner Company Bars',
      icon: Target,
    },
    {
      id: 'sheet-tracker' as PageId,
      number: '04',
      label: 'Bridge Sheet Tracker',
      subtitle: 'Curated Question Roadmap',
      icon: CheckSquare,
      badge: 'Actionable',
    },
    {
      id: 'jd-matcher' as PageId,
      number: '05',
      label: 'JD Matcher & Card',
      subtitle: 'Job Scan & Recruiter Card',
      icon: FileText,
    },
  ];

  return (
    <aside
      className={`w-64 border-r flex flex-col justify-between flex-shrink-0 min-h-screen sticky top-0 z-30 select-none shadow-2xl transition-colors duration-300 ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#080808] border-white/10'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div
          className={`p-4 border-b ${
            theme === 'light' ? 'bg-slate-50/80 border-slate-200' : 'bg-black/80 border-white/10'
          }`}
        >
          <span className="font-bold text-base text-[#F8FAFC] tracking-tight">DeltaSpec</span>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full text-left p-2.5 rounded-xl transition-all duration-150 flex items-center justify-between group ${
                  isActive
                    ? 'bg-[#141414] text-[#F8FAFC] border border-[#38BDF8]/40 shadow-sm'
                    : 'text-neutral-300 hover:bg-[#111111] hover:text-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-[#38BDF8] text-[#070B16]'
                        : 'bg-[#111111] text-[#71717A] group-hover:text-[#38BDF8]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold">{item.label}</span>
                    </div>
                    <p className="text-[10px] text-[#71717A]">{item.subtitle}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Quick Summary */}
      <div
        className={`p-4 border-t space-y-3 ${
          theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-black border-white/10'
        }`}
      >
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-full px-2.5 py-2 rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 border transition-all shadow-sm bg-[#121212] hover:bg-[#1A1A1A] border-white/10 text-[#F8FAFC] cursor-pointer"
          >
            {theme === 'light' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span className="font-semibold text-[11px] whitespace-nowrap">Mode: Daylight</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span className="font-semibold text-[11px] whitespace-nowrap">Mode: Nocturnal</span>
              </>
            )}
          </button>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-[#71717A] font-semibold">
            Hiring Readiness
          </span>
          <span className="text-xs font-mono font-bold text-[#38BDF8]">
            {readinessPercentage}% Match
          </span>
        </div>

        {/* Mini progress bar */}
        <div className="w-full h-1.5 rounded-full bg-[#141414] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#0284C7] to-[#38BDF8] rounded-full transition-all duration-300"
            style={{ width: `${readinessPercentage}%` }}
          />
        </div>
      </div>
    </aside>
  );
};
