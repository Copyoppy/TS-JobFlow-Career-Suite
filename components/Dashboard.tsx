
import React, { useState, useMemo } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Job, JobStatus, ViewState } from '../types';
import { TrendingUp, Clock, CheckCircle, XCircle, Award, PlusCircle, Sparkles, MessageSquare, Briefcase, FileText } from 'lucide-react';

interface DashboardProps {
  jobs: Job[];
  onViewChange: (view: ViewState) => void;
  userName?: string;
  onCardClick?: (status: JobStatus) => void;
  onOpenFollowUp?: () => void;
}

const StatCard = ({ title, value, icon: Icon, color, bg, darkBg, onClick }: any) => (
  <div
    onClick={onClick}
    className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border border-brand-mint dark:border-slate-800 shadow-sm shadow-brand-primary/5 flex items-start justify-between group hover:border-brand-secondary transition-all ${onClick ? 'cursor-pointer hover:scale-[1.03] hover:shadow-md active:scale-[0.98]' : ''}`}
  >
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</h3>
    </div>
    <div className={`p-3 rounded-xl ${bg} ${darkBg || 'dark:bg-slate-800'}`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-brand-mint dark:border-slate-700 shadow-xl text-sm z-50">
        <p className="font-bold text-slate-800 dark:text-white mb-2 border-b border-brand-mint dark:border-slate-700 pb-2">
          {data.readableDate || label}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-500 dark:text-slate-400 font-medium">{entry.name}:</span>
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ jobs, onViewChange, userName, onCardClick, onOpenFollowUp }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');
  const [visibleSeries, setVisibleSeries] = useState({ apps: true, offers: true });

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = userName || 'there';

  // Calculate stats
  const totalApplied = jobs.filter(j =>
    j.origin === 'application' ||
    (!j.origin && j.status !== JobStatus.OFFER && j.status !== JobStatus.ACCEPTED)
  ).length;

  const interviewing = jobs.filter(j => j.status === JobStatus.INTERVIEW).length;
  const offers = jobs.filter(j => j.status === JobStatus.OFFER).length;
  const rejected = jobs.filter(j => j.status === JobStatus.REJECTED).length;
  const accepted = jobs.filter(j => j.status === JobStatus.ACCEPTED).length;

  // Accepted Jobs List
  const acceptedJobs = jobs.filter(j => j.status === JobStatus.ACCEPTED);

  // Generate dynamic activity data based on timeRange
  const activityData = useMemo(() => {
    const data = [];
    const today = new Date();
    let daysToLookBack = 7;

    if (timeRange === '30d') daysToLookBack = 30;
    if (timeRange === 'all') daysToLookBack = 90; // Approximation for 'all time'

    // Create a map of dates to counts for O(1) lookup
    const appsByDate: Record<string, number> = {};
    const offersByDate: Record<string, number> = {};

    jobs.forEach(job => {
      if (job.dateApplied) {
        // Only count as 'app' if it's an application (not an unsolicited offer)
        const isApp = job.origin === 'application' || (!job.origin && job.status !== JobStatus.OFFER);

        if (isApp) {
          appsByDate[job.dateApplied] = (appsByDate[job.dateApplied] || 0) + 1;
        }

        // Track offers/accepted
        if (job.status === JobStatus.OFFER || job.status === JobStatus.ACCEPTED) {
          offersByDate[job.dateApplied] = (offersByDate[job.dateApplied] || 0) + 1;
        }
      }
    });

    for (let i = daysToLookBack - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);

      const dateString = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

      let displayDay = d.toLocaleDateString('en-US', { weekday: 'short' });
      if (timeRange !== '7d') {
        displayDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      const readableDate = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      data.push({
        name: displayDay,
        apps: appsByDate[dateString] || 0,
        offers: offersByDate[dateString] || 0,
        fullDate: dateString,
        readableDate: readableDate
      });
    }
    return data;
  }, [jobs, timeRange]);

  const statusData = [
    { name: 'Applied', count: jobs.filter(j => j.status === JobStatus.APPLIED).length },
    { name: 'Interview', count: interviewing },
    { name: 'Offer', count: offers },
    { name: 'Accepted', count: accepted },
    { name: 'Rejected', count: rejected },
  ];

  const maxStatusCount = Math.max(...statusData.map(d => d.count), 1);

  const toggleSeries = (key: 'apps' | 'offers') => {
    setVisibleSeries(prev => {
      // Don't allow unchecking the last visible item (UX preference to avoid empty chart)
      // but if user wants to toggle, we can let them. Let's just update normally.
      return { ...prev, [key]: !prev[key] };
    });
  };

  // Empty state for new users
  if (jobs.length === 0) {
    return (
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto pt-16 md:pt-8 flex items-center justify-center min-h-[70vh]">
        <div className="text-center max-w-md space-y-6">
          <div className="w-24 h-24 mx-auto bg-brand-rose dark:bg-slate-800 rounded-full flex items-center justify-center">
            <span className="text-5xl">🚀</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand-deep dark:text-white mb-2">Start Your Job Search Journey</h1>
            <p className="text-slate-500 dark:text-slate-400">Track applications, manage offers, and let AI supercharge your career moves.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => onViewChange(ViewState.JOBS)} className="bg-brand-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-deep transition shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2">
              <PlusCircle size={18} /> Add Your First Job
            </button>
            <button onClick={() => onViewChange(ViewState.RESUME)} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl font-medium border border-brand-mint dark:border-slate-700 hover:bg-brand-rose dark:hover:bg-slate-700 transition flex items-center justify-center gap-2">
              <FileText size={18} /> Build Resume
            </button>
            <button onClick={() => onViewChange(ViewState.NTIM)} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl font-medium border border-brand-mint dark:border-slate-700 hover:bg-brand-rose dark:hover:bg-slate-700 transition flex items-center justify-center gap-2">
              <MessageSquare size={18} /> Chat with Ntim
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto pt-16 md:pt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-deep dark:text-white">{getGreeting()}, {displayName}! 👋</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {interviewing > 0 && offers > 0
              ? `You have ${interviewing} interview${interviewing > 1 ? 's' : ''} and ${offers} offer${offers > 1 ? 's' : ''} in progress.`
              : interviewing > 0
                ? `You have ${interviewing} interview${interviewing > 1 ? 's' : ''} lined up. Keep it going!`
                : offers > 0
                  ? `${offers} offer${offers > 1 ? 's' : ''} waiting for your review!`
                  : `Track your progress and stay on top of your job search.`
            }
          </p>
        </div>
        <button
          onClick={() => onViewChange(ViewState.JOBS)}
          className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-deep transition shadow-lg shadow-brand-primary/20 flex items-center gap-2 flex-shrink-0"
        >
          <PlusCircle size={16} />
          <span>Add New Job</span>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => onViewChange(ViewState.JOBS)}
          className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-brand-mint dark:border-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-brand-primary hover:text-brand-primary transition-all group"
        >
          <Briefcase size={16} className="text-slate-400 group-hover:text-brand-primary transition-colors" />
          <span className="hidden sm:inline">My Jobs</span>
          <span className="sm:hidden">Jobs</span>
        </button>
        <button
          onClick={() => onViewChange(ViewState.NTIM)}
          className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-brand-mint dark:border-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-brand-primary hover:text-brand-primary transition-all group"
        >
          <MessageSquare size={16} className="text-slate-400 group-hover:text-brand-primary transition-colors" />
          <span className="hidden sm:inline">Chat with Ntim</span>
          <span className="sm:hidden">Ntim</span>
        </button>
        <button
          onClick={() => onViewChange(ViewState.RESUME)}
          className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-brand-mint dark:border-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-brand-primary hover:text-brand-primary transition-all group"
        >
          <FileText size={16} className="text-slate-400 group-hover:text-brand-primary transition-colors" />
          <span className="hidden sm:inline">Resume</span>
          <span className="sm:hidden">Resume</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Applied" value={totalApplied} icon={TrendingUp} color="text-brand-primary" bg="bg-brand-mint/50" darkBg="dark:bg-blue-900/30" onClick={() => onCardClick?.(JobStatus.APPLIED)} />
        <StatCard title="Interviewing" value={interviewing} icon={Clock} color="text-amber-500" bg="bg-amber-50" darkBg="dark:bg-amber-900/30" onClick={() => onCardClick?.(JobStatus.INTERVIEW)} />
        <StatCard title="Offers Received" value={offers} icon={CheckCircle} color="text-blue-500" bg="bg-blue-50" darkBg="dark:bg-indigo-900/30" onClick={() => onCardClick?.(JobStatus.OFFER)} />
        <StatCard title="Rejected" value={rejected} icon={XCircle} color="text-rose-500" bg="bg-rose-50" darkBg="dark:bg-rose-900/30" onClick={() => onCardClick?.(JobStatus.REJECTED)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-9 flex flex-col gap-8">
          {/* Application Activity Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-brand-mint dark:border-slate-800 shadow-sm shadow-brand-primary/5 flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h3 className="text-lg font-bold text-brand-deep dark:text-white">Application Activity</h3>

              <div className="flex flex-wrap items-center gap-4">
                {/* Series Toggles */}
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => toggleSeries('apps')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${visibleSeries.apps ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-700 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                  >
                    <div className={`w-2 h-2 rounded-full transition-colors ${visibleSeries.apps ? 'bg-[#2DAA9E]' : 'bg-slate-300 dark:bg-slate-500'}`} />
                    Applications
                  </button>
                  <button
                    onClick={() => toggleSeries('offers')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${visibleSeries.offers ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-700 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                  >
                    <div className={`w-2 h-2 rounded-full transition-colors ${visibleSeries.offers ? 'bg-[#3b82f6]' : 'bg-slate-300 dark:bg-slate-500'}`} />
                    Offers
                  </button>
                </div>

                {/* Time Range Toggles */}
                <div className="flex bg-brand-rose dark:bg-slate-800 p-1 rounded-lg">
                  {(['7d', '30d', 'all'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeRange === range
                        ? 'bg-white dark:bg-slate-600 text-brand-deep dark:text-white shadow-sm'
                        : 'text-slate-400 hover:text-brand-deep dark:hover:text-white'
                        }`}
                    >
                      {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full">
              <ResponsiveContainer width="100%" aspect={2.5}>
                <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2DAA9E" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#2DAA9E" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOffers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3D2C3" opacity={0.3} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} minTickGap={20} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />

                  {/* Render Offers (Layered Underneath) */}
                  {visibleSeries.offers && (
                    <Area
                      type="monotone"
                      dataKey="offers"
                      name="Offers Received"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorOffers)"
                      animationDuration={1000}
                    />
                  )}

                  {/* Render Applications (Layered On Top) */}
                  {visibleSeries.apps && (
                    <Area
                      type="monotone"
                      dataKey="apps"
                      name="Applications"
                      stroke="#2DAA9E"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorApps)"
                      animationDuration={1000}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Accepted Applications Widget */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-brand-mint dark:border-slate-800 shadow-sm shadow-brand-primary/5 flex flex-col h-60">
            <h3 className="text-lg font-bold text-brand-deep dark:text-white mb-4 flex items-center gap-2">
              <Award className="text-brand-primary" size={20} />
              Accepted Jobs
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {acceptedJobs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500">
                  <p className="text-sm">No accepted applications yet.</p>
                </div>
              ) : (
                acceptedJobs.map(job => (
                  <div key={job.id} className="p-4 bg-brand-rose dark:bg-slate-800 rounded-xl border border-brand-mint dark:border-slate-700 flex justify-between items-center hover:bg-white dark:hover:bg-slate-700 transition-colors">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-white text-base">{job.role}</div>
                      <div className="text-brand-deep dark:text-slate-300 font-medium text-sm">{job.company}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">{job.salary || 'Salary N/A'}</div>
                      <span className="text-xs text-brand-primary bg-white dark:bg-slate-900 border border-brand-mint dark:border-slate-600 px-2 py-1 rounded-full">{job.dateApplied}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Ask Ntim Widget */}
          <div className="bg-gradient-to-br from-brand-primary to-brand-deep p-6 rounded-2xl text-white shadow-lg shadow-brand-primary/20 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Sparkles className="text-brand-mint" size={20} />
                </div>
                <h3 className="font-bold text-lg">Ask Ntim</h3>
              </div>
              <p className="text-brand-mint/90 text-sm mb-4 leading-relaxed">
                Need advice on your resume, interview prep, or just a pep talk?
              </p>
              <button
                onClick={() => onViewChange(ViewState.NTIM)}
                className="bg-white text-brand-deep px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-rose transition shadow-sm w-full flex items-center justify-center gap-2"
              >
                <MessageSquare size={16} />
                Start Chatting
              </button>
              <button
                onClick={onOpenFollowUp}
                className="mt-3 bg-white text-brand-deep px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-rose transition shadow-sm w-full flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                Follow-up Assistant
              </button>
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-secondary/20 to-transparent rounded-full blur-xl"></div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-brand-mint dark:border-slate-800 shadow-sm shadow-brand-primary/5">
            <h3 className="text-lg font-bold text-brand-deep dark:text-white mb-6">Status Breakdown</h3>
            <div className="flex flex-col gap-6">
              {statusData.map((item) => (
                <div key={item.name} className="grid grid-cols-[80px_1fr_24px] items-center gap-3 group">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400 text-left truncate" title={item.name}>
                    {item.name}
                  </span>
                  <div className="h-3 bg-brand-rose dark:bg-slate-800 rounded-r-lg rounded-bl-sm overflow-hidden relative">
                    <div
                      className="h-full bg-brand-primary rounded-r-lg transition-all duration-500 group-hover:bg-brand-secondary"
                      style={{ width: `${(item.count / maxStatusCount) * 100}%`, minWidth: item.count > 0 ? '4px' : '0' }}
                    />
                  </div>
                  <span className="text-xs text-brand-deep dark:text-slate-300 text-right font-medium">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
