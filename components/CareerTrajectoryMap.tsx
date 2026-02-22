import React, { useState } from 'react';
import { AppSettings, Job } from '../types';
import {
    Milestone, ChevronRight, Star, TrendingUp, Target,
    Map as MapIcon, Award, Zap, BookOpen, BarChart2,
    Lock, Sparkles, Building2, DollarSign, CheckCircle2
} from 'lucide-react';

interface CareerNode {
    id: string;
    title: string;
    level: string;
    salary: string;
    skills: string[];
    description: string;
    isUnlocked: boolean;
    status: 'completed' | 'current' | 'future';
}

const NODES: CareerNode[] = [
    {
        id: '1',
        title: 'Software Engineer II',
        level: 'L4',
        salary: '$120k - $160k',
        skills: ['React', 'TypeScript', 'Node.js'],
        description: 'Focus on independent feature delivery and code quality.',
        isUnlocked: true,
        status: 'completed'
    },
    {
        id: '2',
        title: 'Senior Software Engineer',
        level: 'L5',
        salary: '$180k - $240k',
        skills: ['System Design', 'Mentorship', 'Performance Optimization'],
        description: 'Leading complex projects and establishing technical direction.',
        isUnlocked: true,
        status: 'current'
    },
    {
        id: '3',
        title: 'Staff Engineer',
        level: 'L6',
        salary: '$280k - $400k',
        skills: ['Architecture Strategy', 'Cross-team Leadership', 'Product Vision'],
        description: 'Addressing multi-team technical challenges and architectural strategy.',
        isUnlocked: false,
        status: 'future'
    },
    {
        id: '4',
        title: 'Principal Engineer',
        level: 'L7+',
        salary: '$450k+',
        skills: ['Organizational Design', 'Technical Culture', 'Industry Influence'],
        description: 'Transforming technical culture and setting industry-wide standards.',
        isUnlocked: false,
        status: 'future'
    }
];

const CareerTrajectoryMap: React.FC<{ jobs: Job[] }> = ({ jobs }) => {
    const [activeNode, setActiveNode] = useState<CareerNode>(NODES[1]);

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-brand-mint dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="max-w-6xl mx-auto w-full flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-brand-deep dark:text-white flex items-center gap-3 uppercase tracking-widest">
                            <MapIcon className="text-brand-primary" /> Career Trajectory Map
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Visualize your path to mastery and market influence.</p>
                    </div>
                    <div className="bg-brand-rose dark:bg-slate-800 px-4 py-2 rounded-2xl border border-brand-mint dark:border-slate-700 flex items-center gap-3 shadow-sm">
                        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                            <Target size={18} className="text-brand-primary" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 block">Targeting</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Engineering Manager / Staff</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/20">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">

                    {/* Visual Map Pane */}
                    <div className="flex-1 relative space-y-20 py-10">
                        {/* The Path Line */}
                        <div className="absolute left-[39px] top-10 bottom-10 w-1 bg-gradient-to-b from-brand-primary via-brand-primary to-slate-200 dark:to-slate-800 rounded-full" />

                        {NODES.map((node, idx) => (
                            <div
                                key={node.id}
                                className={`relative pl-24 group cursor-pointer transition-all ${activeNode.id === node.id ? 'scale-105' : 'hover:translate-x-2'}`}
                                onClick={() => setActiveNode(node)}
                            >
                                {/* Connector Dot */}
                                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all shadow-xl z-10 ${node.status === 'completed' ? 'bg-brand-primary border-brand-rose text-white' :
                                    node.status === 'current' ? 'bg-white dark:bg-slate-900 border-brand-primary text-brand-primary animate-pulse' :
                                        'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                                    }`}>
                                    {node.status === 'completed' ? <CheckCircle2 size={32} /> :
                                        node.status === 'current' ? <Award size={32} /> :
                                            <Lock size={24} />}
                                </div>

                                <div className={`p-8 rounded-[32px] border-2 transition-all ${activeNode.id === node.id
                                    ? 'bg-white dark:bg-slate-900 border-brand-primary shadow-2xl scale-100'
                                    : 'bg-white/60 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 shadow-sm opacity-70'
                                    }`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">{node.level}</span>
                                        <TrendingUp size={16} className={node.status === 'future' ? 'text-slate-300' : 'text-emerald-500'} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest">{node.title}</h3>
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">{node.salary}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Details Pane */}
                    <div className="lg:w-96 space-y-8 animate-in slide-in-from-right-10 duration-500">
                        {/* Active Node Card */}
                        <div className="bg-brand-deep dark:bg-blue-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                                <Star size={100} fill="currentColor" />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <div className="p-4 bg-white/10 rounded-3xl border border-white/10 w-fit">
                                    {activeNode.status === 'completed' ? <CheckCircle2 className="text-brand-mint" /> :
                                        activeNode.status === 'current' ? <Award className="text-brand-mint" /> : <Lock />}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-widest">{activeNode.title}</h3>
                                    <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mt-1">Strategic Focus</p>
                                </div>
                                <p className="text-sm leading-relaxed text-blue-100 italic">
                                    "{activeNode.description}"
                                </p>
                            </div>
                        </div>

                        {/* Skills & Resources */}
                        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-brand-mint dark:border-slate-800 shadow-sm space-y-8">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Zap size={12} className="text-brand-primary" /> Key Skills to Master
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {activeNode.skills.map(skill => (
                                        <span key={skill} className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-8 border-t border-slate-100 dark:border-slate-800">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <BookOpen size={12} className="text-brand-primary" /> Ntim's Curated Learning
                                </h4>
                                <div className="space-y-3">
                                    {[
                                        { icon: <Building2 size={14} />, label: 'Architecture at Scale', cost: 'Free' },
                                        { icon: <Award size={14} />, label: 'Leadership Foundations', cost: '$99' }
                                    ].map((res, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-brand-primary transition-all cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="text-brand-primary">{res.icon}</div>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{res.label}</span>
                                            </div>
                                            <ChevronRight size={14} className="text-slate-300" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Market Insight */}
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-[40px] border border-emerald-100 dark:border-emerald-800 flex items-start gap-6">
                            <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                                <BarChart2 className="text-emerald-500" size={24} />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Market Value Index</span>
                                <p className="text-xs text-emerald-800 dark:text-emerald-400 leading-relaxed font-medium">Roles like <strong>{activeNode.title}</strong> have seen a <strong>12% increase</strong> in remote-first offers this quarter. Your React expertise is a multiplier here.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerTrajectoryMap;
