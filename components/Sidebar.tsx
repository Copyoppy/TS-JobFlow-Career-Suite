import React, { useState } from 'react';
import { LayoutDashboard, Briefcase, FileText, UserCircle2, Settings, LogOut, CheckCircle, X } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  hasUnreadMessages?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

// Custom Icon for Ntim (Friendly Male/Neutral Avatar)
const NtimIcon = ({ className, size = 20 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Short Hair / Head top */}
    <path d="M4 8.5c0-3 2.5-5.5 8-5.5s8 2.5 8 5.5" />
    <path d="M4 8.5v2a4 4 0 0 0 4 4" /> {/* Sideburn L */}
    <path d="M20 8.5v2a4 4 0 0 1-4 4" /> {/* Sideburn R */}

    {/* Chin */}
    <path d="M8 14.5c0 3 1.5 4.5 4 4.5s4-1.5 4-4.5" />

    {/* Ears */}
    <path d="M3 10v2" />
    <path d="M21 10v2" />

    {/* Shoulders */}
    <path d="M4 22a8 8 0 0 1 16 0" />
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, hasUnreadMessages = false, isOpen, onClose }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };
  const mainNavItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewState.JOBS, label: 'My Applications', icon: Briefcase },
    { id: ViewState.OFFERS, label: 'Offers Received', icon: CheckCircle },
    { id: ViewState.RESUME, label: 'Resume Builder', icon: FileText },
    { id: ViewState.AVATAR, label: 'AI Avatar', icon: UserCircle2 },
  ];

  const handleNavClick = (id: ViewState) => {
    onChangeView(id);
    onClose(); // Close sidebar on mobile when item selected
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-brand-deep/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      <div className={`
        fixed md:sticky top-0 h-screen w-64 bg-brand-primary border-r border-white/10 flex flex-col flex-shrink-0 no-print shadow-xl shadow-black/20 z-50 transition-transform duration-300 transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <style>
          {`
          @keyframes border-flow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .ntim-notify {
            position: relative;
            z-index: 0;
            overflow: hidden;
          }
          .ntim-notify::before {
            content: '';
            position: absolute;
            top: -3px; left: -3px; right: -3px; bottom: -3px;
            background: linear-gradient(45deg, #fff, #60a5fa, #2563eb, #60a5fa, #fff);
            background-size: 300% 300%;
            z-index: -1;
            animation: border-flow 2s ease infinite;
            border-radius: 14px;
          }
          .ntim-notify-blink {
            animation: blink-shadow 2s infinite;
          }
          @keyframes blink-shadow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
          `}
        </style>

        {/* Close Button Mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white md:hidden"
        >
          <X size={24} />
        </button>

        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
            {/* Simple TS Logo Representation */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="4" fill="white" />
              <path d="M7 6H13M10 6V18" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 12C14 12 15 11 17 11C19 11 19 13 18 14C17 15 15 15 15 16C15 17 17 17 18.5 17" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-white leading-tight tracking-tight">TS JobFlow</span>
            <span className="text-[10px] text-blue-100 uppercase tracking-wider font-semibold">Career Suite</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium ${isActive
                    ? 'bg-white text-brand-primary shadow-lg shadow-black/10'
                    : 'text-blue-50 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <Icon size={20} className={isActive ? 'text-brand-primary' : 'text-blue-200 group-hover:text-white'} />
                {item.label}
              </button>
            );
          })}

          {/* Separator for Ntim */}
          <div className="my-4 border-t border-white/10 mx-2"></div>

          <div className={hasUnreadMessages ? 'ntim-notify rounded-xl' : ''}>
            <button
              onClick={() => handleNavClick(ViewState.NTIM)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium ${currentView === ViewState.NTIM
                  ? 'bg-white text-brand-deep shadow-lg shadow-black/5'
                  : hasUnreadMessages
                    ? 'bg-white text-brand-deep shadow-lg ntim-notify-blink' // Active looking style for unread
                    : 'text-blue-50 hover:bg-white/10 hover:text-white'
                }`}
            >
              <NtimIcon size={20} className={currentView === ViewState.NTIM || hasUnreadMessages ? 'text-brand-deep' : 'text-blue-200 group-hover:text-white'} />
              <span className="flex-1 text-left">Ntim Assistant</span>
              {hasUnreadMessages && (
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse ring-2 ring-white"></span>
              )}
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10 mt-auto bg-brand-deep/10">
          <button
            onClick={() => handleNavClick(ViewState.SETTINGS)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${currentView === ViewState.SETTINGS
                ? 'bg-white text-brand-primary'
                : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
          >
            <Settings size={18} />
            Settings
          </button>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-blue-100 hover:bg-red-500/20 hover:text-red-200 transition-colors font-medium text-sm"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setShowLogoutConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Confirm Logout</h3>
            </div>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              This will clear all your saved data including applications, resume, and settings. You'll be taken back to the onboarding screen. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;