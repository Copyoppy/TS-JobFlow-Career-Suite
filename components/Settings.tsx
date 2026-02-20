
import React, { useRef, useState } from 'react';
import { Job, Resume, AppSettings } from '../types';
import { Download, Upload, Trash2, Database, AlertTriangle, CheckCircle2, ShieldCheck, BellRing, UserCircle, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { useToast } from './Toast';

interface SettingsProps {
  jobs: Job[];
  resume: Resume;
  onImport: (data: { jobs: Job[]; resume: Resume }) => void;
  onReset: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ jobs, resume, onImport, onReset, settings, onUpdateSettings }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { showToast } = useToast();

  // User profile
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passError, setPassError] = useState('');

  const storedUser = (() => {
    try {
      const u = localStorage.getItem('jobflow_user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  })();

  const userInitials = storedUser?.fullName
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const handleChangePassword = () => {
    if (!storedUser) return;
    if (currentPassword !== storedUser.password) {
      setPassError('Current password is incorrect');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters');
      return;
    }
    storedUser.password = newPassword;
    localStorage.setItem('jobflow_user', JSON.stringify(storedUser));
    showToast('Password changed successfully!');
    setShowChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setPassError('');
  };

  const handleExport = () => {
    const data = {
      jobs,
      resume,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jobflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.jobs && json.resume) {
          onImport({ jobs: json.jobs, resume: json.resume });
          setImportStatus('success');
          setTimeout(() => setImportStatus('idle'), 3000);
        } else {
          setImportStatus('error');
          alert('Invalid backup file format.');
        }
      } catch (error) {
        console.error('Import failed', error);
        setImportStatus('error');
        alert('Failed to parse the file.');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetConfirm = () => {
    if (window.confirm("Are you sure? This will delete all your applications and resume data and reset to the default demo data. This action cannot be undone.")) {
      onReset();
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in duration-500 pt-16 md:pt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-deep dark:text-white mb-2">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your application data and preferences.</p>
      </div>

      <div className="space-y-8">

        {/* User Profile */}
        {storedUser && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-brand-mint dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-brand-mint dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 mb-1">
                <UserCircle className="text-brand-primary" size={20} />
                <h2 className="font-bold text-slate-800 dark:text-white text-lg">Your Profile</h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account information.</p>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-brand-primary rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-brand-primary/20">
                  {userInitials}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">{storedUser.fullName}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{storedUser.email}</p>
                </div>
              </div>

              {/* Change Password */}
              {!showChangePassword ? (
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-brand-mint dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-xl hover:border-brand-primary transition-all"
                >
                  <Lock size={16} />
                  Change Password
                </button>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => { setCurrentPassword(e.target.value); setPassError(''); }}
                        placeholder="••••••••"
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">New Password</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setPassError(''); }}
                        placeholder="••••••••"
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                      />
                    </div>
                  </div>
                  {passError && <p className="text-red-500 text-xs">{passError}</p>}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleChangePassword}
                      className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-deep transition"
                    >
                      <Check size={14} />
                      Save
                    </button>
                    <button
                      onClick={() => { setShowChangePassword(false); setPassError(''); setCurrentPassword(''); setNewPassword(''); }}
                      className="px-4 py-2 text-slate-500 text-sm font-medium hover:text-slate-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setShowPass(!showPass)}
                      className="ml-auto text-slate-400 hover:text-slate-600 transition"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notification Preferences */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-brand-mint dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-brand-mint dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 mb-1">
              <BellRing className="text-brand-primary" size={20} />
              <h2 className="font-bold text-slate-800 dark:text-white text-lg">Notification Preferences</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Configure how and when you want to be reminded.</p>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-slate-800 dark:text-slate-200">Interview Reminder Timing</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">When should we send you a browser notification before an interview?</p>
              </div>
              <div className="w-full md:w-64">
                <select
                  value={settings.reminderTiming}
                  onChange={(e) => onUpdateSettings({ ...settings, reminderTiming: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-brand-mint dark:border-slate-700 rounded-xl outline-none text-slate-700 dark:text-white focus:ring-2 focus:ring-brand-primary"
                >
                  <option value={15}>15 minutes before</option>
                  <option value={30}>30 minutes before</option>
                  <option value={60}>1 hour before</option>
                  <option value={120}>2 hours before</option>
                  <option value={1440}>1 day before</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-brand-mint dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-brand-mint dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 mb-1">
              <Database className="text-brand-primary" size={20} />
              <h2 className="font-bold text-slate-800 dark:text-white text-lg">Data Management</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Your data is currently stored locally in your browser.</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Export */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-medium text-slate-800 dark:text-slate-200">Export Backup</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Download a JSON file containing all your jobs and resume data.</p>
              </div>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-deep transition shadow-md shadow-brand-primary/10 font-medium"
              >
                <Download size={18} />
                Download Data
              </button>
            </div>

            {/* Import */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-medium text-slate-800 dark:text-slate-200">Import Backup</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Restore your data from a previously exported JSON file.</p>
                {importStatus === 'success' && <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1"><CheckCircle2 size={12} /> Data imported successfully!</p>}
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-brand-mint dark:border-slate-700 text-brand-deep dark:text-slate-200 rounded-xl hover:bg-brand-rose dark:hover:bg-slate-800 transition font-medium"
                >
                  <Upload size={18} />
                  Upload File
                </button>
              </div>
            </div>

            {/* Reset */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-rose-600">Reset Application</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Clear all local data and restore default demo content.</p>
              </div>
              <button
                onClick={handleResetConfirm}
                className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition font-medium"
              >
                <Trash2 size={18} />
                Reset All Data
              </button>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-brand-mint dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-rose dark:bg-slate-800 rounded-xl flex items-center justify-center border border-brand-mint dark:border-slate-700">
              <ShieldCheck className="text-brand-primary" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">TS JobFlow</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Version 1.0.0 • Powered by Gemini 2.5</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
