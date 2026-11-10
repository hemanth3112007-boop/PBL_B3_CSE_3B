import React, { useState } from 'react';
import { 
  Share2, 
  ChevronDown, 
  ChevronUp,
  Sun,
  Moon,
  ExternalLink
} from 'lucide-react';
import { TargetRole } from '../data/mockProfiles';
import { PageId } from './Sidebar';

export interface WideFooterProps {
  targetRole?: TargetRole;
  targetRoles?: TargetRole[];
  onSelectTargetRole?: (role: TargetRole) => void;
  onOpenCardModal?: () => void;
  onRefreshSync?: () => void;
  isSyncing?: boolean;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  isSharpenerActive?: boolean;
  onToggleSharpener?: () => void;
  activePage?: PageId;
  onNavigate?: (page: PageId) => void;
  className?: string;
  progressFillRef?: React.RefObject<HTMLDivElement | null>;
  onSeek?: (ratio: number) => void;
  showScrubBar?: boolean;
}

export const WideFooter: React.FC<WideFooterProps> = ({
  targetRole,
  targetRoles = [],
  onSelectTargetRole,
  onOpenCardModal,
  onRefreshSync,
  isSyncing = false,
  theme = 'dark',
  onToggleTheme,
  isSharpenerActive = true,
  onToggleSharpener,
  className = '',
  progressFillRef,
  onSeek,
  showScrubBar = false,
}) => {
  const [isDirectoryExpanded, setIsDirectoryExpanded] = useState(false);
  const [activeCategoryModal, setActiveCategoryModal] = useState<string | null>(null);

  const isLightMode = theme === 'light';

  const footerDirectory = {
    About: [
      { label: 'News', href: '#' },
      { label: 'Changelog', href: '#' },
      { label: 'System Status', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Rewards Program', href: '#' },
    ],
    Products: [
      { label: 'Campus 3D Twin', href: '#' },
      { label: 'Skill-Gap Engine', href: '#' },
      { label: 'Bridge Sheet Tracker', href: '#' },
      { label: 'JD Matcher & Card', href: '#' },
    ],
    Resources: [
      { label: 'Help Center', href: '#' },
      { label: 'Translate', href: '#' },
      { label: 'Report Issues', href: '#' },
      { label: 'API Documentation', href: '#' },
    ],
    Legal: [
      { label: 'Content Rules', href: '#' },
      { label: 'Terms of Use', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Security Notice', href: '#' },
      { label: 'Copyright Policy and DMCA', href: '#' },
    ],
  };

  return (
    <footer 
      className={`w-full select-none transition-all duration-300 relative ${className}`}
      style={{
        backgroundColor: isLightMode ? '#F8FAFC' : '#050505',
        borderTop: isLightMode ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: isLightMode
          ? '0 -4px 16px -4px rgba(15, 23, 42, 0.06)'
          : '0 -10px 25px -5px rgba(0, 0, 0, 0.45)',
      }}
    >
      {/* 1. Optional Top-Edge Interactive Camera Scrub Bar (for 3D Campus Flythrough) */}
      {showScrubBar && (
        <div
          className="w-full h-1 bg-[#111111] cursor-pointer group relative overflow-hidden transition-all hover:h-1.5"
          onClick={(e) => {
            if (!onSeek) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            onSeek(ratio);
          }}
          title="Click or drag along timeline to orbit camera flythrough"
        >
          <div
            ref={progressFillRef}
            className="h-full bg-gradient-to-r from-[#0284C7] via-[#38BDF8] to-[#60A5FA] transition-all"
            style={{ width: '0%' }}
          />
        </div>
      )}

      {/* 2. Expandable Multi-Column Link Drawer */}
      {isDirectoryExpanded && (
        <div className="px-6 py-6 border-b border-white/10 bg-[#0A0A0A] animate-in slide-in-from-bottom-3 duration-200">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
            {Object.entries(footerDirectory).map(([category, links]) => (
              <div key={category} className="space-y-2.5">
                <span className="font-bold text-[#F8FAFC] tracking-wider uppercase text-[11px] block">
                  {category}
                </span>
                <ul className="space-y-1.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        onClick={(e) => e.preventDefault()}
                        className="text-[#94A3B8] hover:text-[#38BDF8] transition-colors flex items-center gap-1 group text-[11px]"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-[10px] font-mono text-[#64748B] text-center uppercase tracking-wider">
            HIGH-ALTITUDE 3D CAMPUS TWIN &amp; SYSTEMS CODE BENCHMARKING ENGINE.
          </div>
        </div>
      )}

      {/* 3. Main Footer Bar (Height is exactly h-[3.75rem] / 60px) */}
      <div className="h-[3.75rem] px-5 flex items-center justify-between gap-4 text-xs font-sans">
        {/* Left Section: Brand Logo, Socials & Open Source Tag */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Logo Mark + Name */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#38BDF8] flex items-center justify-center shadow-md shadow-[#38BDF8]/25">
              <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-bold text-sm tracking-tight text-[#F8FAFC]">DeltaSpec</span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-2 pl-1 border-l border-white/10">
            {/* Discord */}
            <a
              href="https://discord.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#94A3B8] hover:text-[#38BDF8] transition-colors p-1"
              title="Discord"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a>

            {/* Bluesky */}
            <a
              href="https://bsky.app"
              target="_blank"
              rel="noreferrer"
              className="text-[#94A3B8] hover:text-[#38BDF8] transition-colors p-1"
              title="Bluesky"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.879.139 2.592 0 3.914 0 5.176c0 4.148 2.296 9.882 6.51 12.008 1.487.75 3.424.996 5.49.528 2.066.468 4.003.222 5.49-.528C21.704 15.058 24 9.324 24 5.176c0-1.262-.139-2.584-.902-3.297-.659-.613-1.664-.935-4.3 1.026C16.046 4.747 13.087 8.686 12 10.8z" />
              </svg>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#94A3B8] hover:text-[#38BDF8] transition-colors p-1"
              title="GitHub"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>

            {/* X */}
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#94A3B8] hover:text-[#38BDF8] transition-colors p-1"
              title="X / Twitter"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>

          {/* Open source label */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-[#64748B]">
            <span>DeltaSpec is</span>
            <span className="text-[#38BDF8] font-semibold">open source</span>
            <span>&copy; 2026</span>
          </div>
        </div>

        {/* Center Section: Category Links */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-[#94A3B8]">
          {['About', 'Products', 'Resources', 'Legal'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategoryModal(activeCategoryModal === cat ? null : cat)}
              className={`px-2.5 py-1 rounded-lg hover:text-[#F8FAFC] transition-colors cursor-pointer ${
                activeCategoryModal === cat ? 'bg-[#38BDF8]/20 text-[#38BDF8] font-semibold' : ''
              }`}
            >
              {cat}
            </button>
          ))}

          {/* Directory Expand/Collapse button */}
          <button
            type="button"
            onClick={() => setIsDirectoryExpanded(!isDirectoryExpanded)}
            className="ml-1 px-2 py-1 rounded-lg text-[10px] font-mono text-[#38BDF8] hover:bg-[#38BDF8]/15 transition-all flex items-center gap-1 cursor-pointer"
            title="Toggle directory drawer"
          >
            <span>Directory</span>
            {isDirectoryExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>

        {/* Right Section: Theme Toggle & Share Card */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Daylight / Nocturnal Mode Toggle */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs bg-[#121212] hover:bg-[#181818] border border-white/10 text-[#CBD5E1] hover:text-[#F8FAFC] transition-colors shadow-sm cursor-pointer group"
              title={`Switch to ${isLightMode ? 'Nocturnal (Dark)' : 'Daylight (Light)'} Mode`}
            >
              {isLightMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#38BDF8] transition-transform group-hover:rotate-45" />
                  <span className="hidden sm:inline font-mono text-[11px]">Daylight</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#38BDF8] transition-transform group-hover:-rotate-12" />
                  <span className="hidden sm:inline font-mono text-[11px]">Nocturnal</span>
                </>
              )}
            </button>
          )}

          {/* Share Card Button */}
          {onOpenCardModal && (
            <button
              type="button"
              onClick={onOpenCardModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#38BDF8] hover:bg-[#0284C7] text-black transition-colors shadow-md shadow-[#38BDF8]/20 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share Card</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Category Popover Modal if clicked */}
      {activeCategoryModal && (
        <div className="absolute bottom-full mb-2 left-1/3 transform -translate-x-1/2 bg-[#0A0A0A] border border-white/15 rounded-xl shadow-2xl p-4 w-64 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <span className="font-bold text-xs uppercase tracking-wider text-[#38BDF8]">
              {activeCategoryModal}
            </span>
            <button
              onClick={() => setActiveCategoryModal(null)}
              className="text-[#64748B] hover:text-white text-xs cursor-pointer"
            >
              &times;
            </button>
          </div>
          <ul className="space-y-1.5">
            {footerDirectory[activeCategoryModal as keyof typeof footerDirectory]?.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={(e) => e.preventDefault()}
                  className="text-xs text-[#CBD5E1] hover:text-[#38BDF8] flex items-center justify-between transition-colors py-0.5"
                >
                  <span>{link.label}</span>
                  <ExternalLink className="w-3 h-3 text-[#64748B]" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </footer>
  );
};
