import React, { useState, useMemo, useEffect } from 'react';
import { 
  PRIMARY_PROFILE, 
  TARGET_ROLES, 
  INITIAL_BRIDGE_TOPICS, 
  DeveloperProfile, 
  TargetRole,
  SheetTopic 
} from './data/mockProfiles';
import { evaluateProfileGap } from './engine/gapAnalyzer';
import { Sidebar, PageId } from './components/Sidebar';
import { WideFooter } from './components/WideFooter';
import { SkylineHomePage } from './pages/SkylineHomePage';
import { PortfolioPage } from './pages/PortfolioPage';
import { SkillGapPage } from './pages/SkillGapPage';
import { SheetTrackerPage } from './pages/SheetTrackerPage';
import { JdMatcherPage } from './pages/JdMatcherPage';
import { RecruiterCardModal } from './components/RecruiterCardModal';
import { LoginModal } from './components/LoginModal';
import { TopHeader } from './components/TopHeader';
import { AuthService } from './services/modules';
import { UserSummary } from './types/api';
import { CheckCircle2, Zap } from 'lucide-react';

export default function App() {
  // Theme state: dark (default) or light
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('deltaspec-theme') as 'dark' | 'light' | null;
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  // Synchronize HTML root class and data-theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    }
    localStorage.setItem('deltaspec-theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      showToast(`${next === 'light' ? 'Light' : 'Dark'} mode activated`);
      return next;
    });
  };

  // Default landing view is 01 // Tech Park Campus (3D Masterplan)
  const [activePage, setActivePage] = useState<PageId>('skyline');
  const [profile, setProfile] = useState<DeveloperProfile>(PRIMARY_PROFILE);
  const [targetRole, setTargetRole] = useState<TargetRole>(TARGET_ROLES[0]);
  const [sheetTopics, setSheetTopics] = useState<SheetTopic[]>(INITIAL_BRIDGE_TOPICS);

  // Set of completed task IDs across the sheet tracker
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    INITIAL_BRIDGE_TOPICS.forEach((topic) => {
      topic.tasks.forEach((task) => {
        if (task.completed) initial.add(task.id);
      });
    });
    return initial;
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Restore authenticated session from Spring Boot backend on mount
  useEffect(() => {
    let isCancelled = false;
    async function checkAuth() {
      try {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
        if (token) {
          const profileData = await AuthService.getProfile();
          if (!isCancelled && profileData?.username) {
            setCurrentUser(profileData);
          }
        }
      } catch {
        // Not authenticated or token expired
      }
    }
    checkAuth();
    return () => {
      isCancelled = true;
    };
  }, []);

  const handleLoginSuccess = (user: UserSummary) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    showToast(`Signed in as ${user.fullName} (${user.role})`);
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    showToast('Signed out of session');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Gap analysis calculation dynamically updated when tasks are checked or role is switched
  const gapAnalysis = useMemo(() => {
    return evaluateProfileGap(profile, targetRole, completedTaskIds, sheetTopics);
  }, [profile, targetRole, completedTaskIds, sheetTopics]);

  // Handle task toggling
  const handleToggleTask = (taskId: string) => {
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
        showToast('Milestone task reopened');
      } else {
        next.add(taskId);
        showToast('Task solved! Employability match score boosted');
      }
      return next;
    });
  };

  // Handle simulated platform sync
  const handleRefreshSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('All 5 coding platforms synced & verified');
    }, 1000);
  };

  const handleSelectRoleById = (roleId: string) => {
    const found = TARGET_ROLES.find(r => r.id === roleId);
    if (found) {
      setTargetRole(found);
      showToast(`Target benchmark switched to ${found.title}`);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-row font-sans selection:bg-[#38BDF8]/30 transition-colors duration-300 ${
        theme === 'light' ? 'bg-[#F8FAFC] text-[#0F172A]' : 'bg-black text-[#F8FAFC]'
      }`}
    >
      {/* 1. Persistent Left Navigation Sidebar Router */}
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => setActivePage(page)}
        readinessPercentage={gapAnalysis.readinessPercentage}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative">
        {activePage !== 'skyline' && (
          <TopHeader
            activePage={activePage}
            targetRole={targetRole}
            targetRoles={TARGET_ROLES}
            onSelectTargetRole={(role) => {
              setTargetRole(role);
              showToast(`Target benchmark switched to ${role.title}`);
            }}
            onOpenCardModal={() => setIsCardModalOpen(true)}
            onRefreshSync={handleRefreshSync}
            isSyncing={isSyncing}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            currentUser={currentUser}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}

        {/* Dynamic Multi-Page Router Views */}
        <main
          className={`flex-1 overflow-y-auto flex flex-col transition-colors duration-300 ${
            theme === 'light' ? 'bg-[#F8FAFC]' : 'bg-black'
          }`}
        >
          <div className="flex-1">
            {activePage === 'skyline' && (
              <SkylineHomePage
                theme={theme}
                onToggleTheme={handleToggleTheme}
                onEnterWorkspace={(roleId) => {
                  if (roleId) handleSelectRoleById(roleId);
                  setActivePage('portfolio');
                }}
                onSelectRole={handleSelectRoleById}
                readinessPercentage={gapAnalysis.readinessPercentage}
                profile={profile}
                targetRole={targetRole}
              />
            )}

            {activePage === 'portfolio' && (
              <PortfolioPage
                profile={profile}
                targetRole={targetRole}
                readinessPercentage={gapAnalysis.readinessPercentage}
                onOpenCardModal={() => setIsCardModalOpen(true)}
                onNavigateToGapEngine={() => setActivePage('gap-engine')}
              />
            )}

            {activePage === 'gap-engine' && (
              <SkillGapPage
                profile={profile}
                targetRole={targetRole}
                targetRoles={TARGET_ROLES}
                onSelectRole={(role) => {
                  setTargetRole(role);
                  showToast(`Target benchmark switched to ${role.title}`);
                }}
                gapAnalysis={gapAnalysis}
                onNavigateToSheet={() => setActivePage('sheet-tracker')}
              />
            )}

            {activePage === 'sheet-tracker' && (
              <SheetTrackerPage
                topics={sheetTopics}
                completedTaskIds={completedTaskIds}
                onToggleTask={handleToggleTask}
                targetRole={targetRole}
                readinessPercentage={gapAnalysis.readinessPercentage}
              />
            )}

            {activePage === 'jd-matcher' && (
              <JdMatcherPage
                profile={profile}
                targetRole={targetRole}
                readinessPercentage={gapAnalysis.readinessPercentage}
                onOpenCardModal={() => setIsCardModalOpen(true)}
              />
            )}
          </div>

          {/* Really Wide Modrinth-Style Footer on Other Pages */}
          {activePage !== 'skyline' && (
            <WideFooter
              targetRole={targetRole}
              targetRoles={TARGET_ROLES}
              onSelectTargetRole={(role) => {
                setTargetRole(role);
                showToast(`Target benchmark switched to ${role.title}`);
              }}
              onOpenCardModal={() => setIsCardModalOpen(true)}
              onRefreshSync={handleRefreshSync}
              isSyncing={isSyncing}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              activePage={activePage}
              onNavigate={(page) => setActivePage(page)}
            />
          )}
        </main>
      </div>

      {/* Shareable Codolio Recruiter Card Modal */}
      <RecruiterCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        profile={profile}
        targetRole={targetRole}
        readinessPercentage={gapAnalysis.readinessPercentage}
      />

      {/* Spring Boot Authentication Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />

      {/* Real-time Toast Notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-none">
          <div className="bg-[#0F172A] border border-[#38BDF8]/40 shadow-2xl px-4 py-2.5 rounded-xl flex items-center gap-2.5 text-xs font-mono text-[#F8FAFC]">
            <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
