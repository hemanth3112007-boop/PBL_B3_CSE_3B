import React, { useState } from 'react';
import { X, Lock, User, Shield, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { AuthService } from '../services/modules';
import { UserSummary } from '../types/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSummary | null;
  onLoginSuccess: (user: UserSummary) => void;
  onLogout: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const loginRes = await AuthService.login({ username, password });
      if (loginRes?.token) {
        const profile = await AuthService.getProfile();
        onLoginSuccess(profile);
      } else {
        setErrorMessage('Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#111111] border border-white/15 rounded-2xl shadow-2xl p-6 relative text-neutral-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-white">Active Session</h3>
                <p className="text-xs text-neutral-400">Authenticated with Spring Boot backend</p>
              </div>
            </div>

            <div className="bg-[#181818] border border-white/10 rounded-xl p-4 space-y-2 mb-6 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-neutral-400 text-xs">Full Name</span>
                <span className="font-medium text-white">{currentUser.fullName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-neutral-400 text-xs">Username</span>
                <span className="font-mono text-xs text-sky-400">@{currentUser.username}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-neutral-400 text-xs">Email</span>
                <span className="text-neutral-300 text-xs">{currentUser.email}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-neutral-400 text-xs">Assigned Role</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {currentUser.role}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of Session</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-white">Sign In to SkillLoop</h3>
                <p className="text-xs text-neutral-400">Access enterprise credentials and gap telemetry</p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin or dhanush"
                    className="w-full bg-[#181818] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full bg-[#181818] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500/60"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl font-medium bg-sky-500 hover:bg-sky-400 text-black transition-colors disabled:opacity-50 text-sm shadow-md shadow-sky-500/20"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-white/10">
              <p className="text-[11px] text-neutral-400 mb-2 font-mono uppercase tracking-wider">
                1-Click Demo Profiles:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('hemanth', 'hemanth123')}
                  className="p-2 rounded-lg bg-[#181818] hover:bg-[#222222] border border-white/5 text-left text-neutral-300 hover:text-white transition-colors"
                >
                  <div className="font-semibold text-sky-400">Hemanth V</div>
                  <div className="text-[10px] text-neutral-500">Lead Analyst (Admin)</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin', 'admin123')}
                  className="p-2 rounded-lg bg-[#181818] hover:bg-[#222222] border border-white/5 text-left text-neutral-300 hover:text-white transition-colors"
                >
                  <div className="font-semibold text-emerald-400">Administrator</div>
                  <div className="text-[10px] text-neutral-500">System Admin</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('dhanush', 'trainee123')}
                  className="p-2 rounded-lg bg-[#181818] hover:bg-[#222222] border border-white/5 text-left text-neutral-300 hover:text-white transition-colors"
                >
                  <div className="font-semibold text-amber-400">Dhanush CS</div>
                  <div className="text-[10px] text-neutral-500">Trainee / Student</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('tcs_recruiter', 'employer123')}
                  className="p-2 rounded-lg bg-[#181818] hover:bg-[#222222] border border-white/5 text-left text-neutral-300 hover:text-white transition-colors"
                >
                  <div className="font-semibold text-purple-400">TCS Talent</div>
                  <div className="text-[10px] text-neutral-500">Employer / Recruiter</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

