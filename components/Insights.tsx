import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie, AreaChart, Area, ComposedChart, Line
} from 'recharts';
import { Job, JobStatus } from '../types';
import { TrendingUp, Target, Award, Zap, BarChart3, PieChart as PieIcon, LineChart, Activity, Briefcase, CheckCircle2, Sparkles } from 'lucide-react';

interface InsightsProps {
    jobs: Job[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-brand-mint dark:border-slate-700 shadow-xl">
                <p className="font-bold text-slate-800 dark:text-white mb-2">{label}</p>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: payload[0].payload.color || payload[0].color }} />
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{payload[0].name}:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{payload[0].value}</span>
                </div>
            </div>
        );
    }
    return null;
};

const Insights: React.FC<InsightsProps> = ({ jobs }) => {
    // Funnel Data calculation
    const funnelData = useMemo(() => {
        const applied = jobs.length;
        const interviewed = jobs.filter(j =>
            j.status === JobStatus.INTERVIEW ||
            j.status === JobStatus.OFFER ||
            j.status === JobStatus.ACCEPTED
        ).length;
        const offered = jobs.filter(j =>
            j.status === JobStatus.OFFER ||
            j.status === JobStatus.ACCEPTED
        ).length;
        const accepted = jobs.filter(j => j.status === JobStatus.ACCEPTED).length;

        return [
            { name: 'Applied', value: applied, color: '#2DAA9E' },
            { name: 'Interviewed', value: interviewed, color: '#F59E0B' },
            { name: 'Offered', value: offered, color: '#3B82F6' },
            { name: 'Accepted', value: accepted, color: '#10B981' },
        ];
    }, [jobs]);

    const stats = useMemo(() => {
        const total = jobs.length || 1;
        const interviewed = funnelData[1].value;
        const offered = funnelData[2].value;
        const hired = funnelData[3].value;

        return [
            {
                label: 'Interview Rate',
                value: `${((interviewed / total) * 100).toFixed(1)}%`,
                sub: 'Apps to Interviews',
                icon: Target,
                color: 'text-amber-500',
                bg: 'bg-amber-50 dark:bg-amber-900/20'
            },
            {
                label: 'Offer Rate',
                value: `${((offered / Math.max(interviewed, 1)) * 100).toFixed(1)}%`,
                sub: 'Interviews to Offers',
                icon: Award,
                color: 'text-blue-500',
                bg: 'bg-blue-50 dark:bg-blue-900/20'
            },
            {
                label: 'Overall Success',
                value: `${((hired / total) * 100).toFixed(1)}%`,
                sub: 'Apps to Hired',
                icon: CheckCircle2,
                color: 'text-emerald-500',
                bg: 'bg-emerald-50 dark:bg-emerald-900/20'
            }
        ];
    }, [jobs, funnelData]);

    // Activity over time (Grouped by month)
    const activityTrend = useMemo(() => {
        const months: Record<string, number> = {};
        const today = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = d.toLocaleString('default', { month: 'short' });
            months[key] = 0;
        }

        jobs.forEach(j => {
            const date = new Date(j.dateApplied);
            const key = date.toLocaleString('default', { month: 'short' });
            if (months[key] !== undefined) months[key]++;
        });

        return Object.entries(months).map(([name, count]) => ({ name, count }));
    }, [jobs]);

    return (
        <div className="p-8 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold text-brand-deep dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-brand-primary rounded-2xl shadow-lg shadow-brand-primary/20 text-white">
                        <BarChart3 size={28} />
                    </div>
                    Search Insights
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Analyze your application performance and identify areas for improvement.</p>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-brand-mint dark:border-slate-800 shadow-xl shadow-brand-primary/5 group hover:border-brand-primary transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg}`}>
                                <stat.icon className={`${stat.color}`} size={24} />
                            </div>
                            <span className="text-2xl font-black text-slate-800 dark:text-white group-hover:scale-110 transition-transform">{stat.value}</span>
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white">{stat.label}</h3>
                        <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pipeline Funnel */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-brand-mint dark:border-slate-800 shadow-2xl shadow-brand-primary/5">
                    <div className="flex items-center gap-3 mb-8">
                        <Activity className="text-brand-primary" size={20} />
                        <h2 className="text-xl font-bold text-brand-deep dark:text-white">Application Pipeline</h2>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={funnelData} layout="vertical" margin={{ left: 20, right: 30, top: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={100}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#2DAA9E', fillOpacity: 0.05 }} />
                                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={40}>
                                    {funnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-2">
                        {funnelData.map((item, i) => (
                            <div key={i} className="text-center">
                                <div className="text-lg font-black text-slate-800 dark:text-white">{item.value}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Application Velocity */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-brand-mint dark:border-slate-800 shadow-2xl shadow-brand-primary/5">
                    <div className="flex items-center gap-3 mb-8">
                        <LineChart className="text-brand-primary" size={20} />
                        <h2 className="text-xl font-bold text-brand-deep dark:text-white">Application Velocity</h2>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2DAA9E" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#2DAA9E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    name="Applications"
                                    stroke="#2DAA9E"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorTrend)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Applications per month (last 6 months)</p>
                    </div>
                </div>
            </div>

            {/* Detailed Insights Section */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-gradient-to-br from-brand-primary to-brand-deep p-8 rounded-[2rem] text-white shadow-xl shadow-brand-primary/20 flex flex-col md:flex-row items-center gap-8 overflow-hidden relative group">
                    <div className="relative z-10 flex-1">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="text-brand-mint" size={24} />
                            <h3 className="text-xl font-bold">AI Search Strategy</h3>
                        </div>
                        <p className="text-brand-mint/90 leading-relaxed mb-6 font-medium">
                            Based on your <strong>{stats[0].value}</strong> interview rate, we recommend focusing on companies where your <strong>React</strong> and <strong>TypeScript</strong> skills overlap with their core business logic to maximize your offer conversion.
                        </p>
                        <div className="flex gap-4">
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-2xl">
                                <div className="text-xs font-bold text-brand-mint uppercase tracking-wider mb-1">Top Goal</div>
                                <div className="font-bold">Tailor Summaries</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-2xl">
                                <div className="text-xs font-bold text-brand-mint uppercase tracking-wider mb-1">Focus Area</div>
                                <div className="font-bold">FinTech Sector</div>
                            </div>
                        </div>
                    </div>
                    <div className="relative z-10 w-40 h-40 bg-white/10 rounded-full flex items-center justify-center p-4 border-4 border-white/20 group-hover:scale-110 transition-transform duration-700">
                        <div className="text-center">
                            <div className="text-4xl font-black">A+</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest mt-1">Profile Health</div>
                        </div>
                    </div>
                    {/* Background Orbs */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-1000"></div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-brand-mint dark:border-slate-800 p-8 shadow-2xl shadow-brand-primary/5 flex flex-col justify-center text-center">
                    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="text-emerald-500" size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">{jobs.length}</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Total Applications</p>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-slate-500">This Week</span>
                            <span className="font-black text-brand-primary">+3</span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="w-[60%] h-full bg-brand-primary"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Insights;
