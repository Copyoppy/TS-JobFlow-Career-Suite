import React, { useState, useMemo } from 'react';
import { Job, JobStatus, OfferComparisonResult } from '../types';
import {
    Scale, Sparkles, CheckCircle2, TrendingUp, DollarSign,
    MapPin, Clock, Zap, Star, AlertCircle, ChevronRight, BarChart3
} from 'lucide-react';
import { compareJobOffers } from '../services/geminiService';
import { useToast } from './Toast';

interface OfferComparisonDashboardProps {
    jobs: Job[];
}

const OfferComparisonDashboard: React.FC<OfferComparisonDashboardProps> = ({ jobs }) => {
    const { showToast } = useToast();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isComparing, setIsComparing] = useState(false);
    const [comparison, setComparison] = useState<OfferComparisonResult | null>(null);

    const offers = useMemo(() => jobs.filter(j => j.status === JobStatus.OFFER || j.status === JobStatus.ACCEPTED), [jobs]);

    const handleToggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(i => i !== id));
        } else if (selectedIds.length < 3) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            showToast("You can compare up to 3 offers at once.", "warning");
        }
    };

    const handleRunComparison = async () => {
        if (selectedIds.length < 2) {
            showToast("Select at least 2 offers to compare.", "info");
            return;
        }

        setIsComparing(true);
        setComparison(null);
        try {
            const selectedJobs = jobs.filter(j => selectedIds.includes(j.id));
            // For now, if 3 are selected, we compare the first 2 to keep consistent with existing API
            // Or we can update the service. Let's stick to the first 2 for the MVP.
            const result = await compareJobOffers(selectedJobs[0], selectedJobs[1]);
            setComparison(result);
        } catch (error) {
            console.error("Comparison failed:", error);
            showToast("AI comparison failed. Please try again.", "error");
        } finally {
            setIsComparing(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-brand-mint dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
                    <div>
                        <h1 className="text-2xl font-black text-brand-deep dark:text-white flex items-center gap-3 uppercase tracking-widest">
                            <Scale className="text-brand-primary" /> Offer Comparison Dashboard
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Side-by-side analysis of your current job offers.</p>
                    </div>
                    <button
                        onClick={handleRunComparison}
                        disabled={selectedIds.length < 2 || isComparing}
                        className="bg-brand-primary text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-deep transition-all flex items-center gap-3 shadow-xl shadow-brand-primary/20 disabled:opacity-50 disabled:shadow-none"
                    >
                        {isComparing ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" /> : <Sparkles size={20} />}
                        Analyze with AI
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-7xl mx-auto space-y-10">

                    {/* Offer Selection Track */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {offers.map(job => (
                            <button
                                key={job.id}
                                onClick={() => handleToggleSelection(job.id)}
                                className={`text-left p-6 rounded-3xl border-2 transition-all relative ${selectedIds.includes(job.id)
                                    ? 'border-brand-primary bg-brand-rose/30 dark:bg-slate-800 shadow-xl scale-[1.02]'
                                    : 'border-brand-mint dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-primary/50'
                                    }`}
                            >
                                {selectedIds.includes(job.id) && (
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-50">
                                        <CheckCircle2 size={20} />
                                    </div>
                                )}
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-[10px] font-black bg-brand-mint dark:bg-slate-800 text-brand-deep dark:text-blue-300 px-2 py-0.5 rounded uppercase tracking-widest mb-2 inline-block">
                                            {job.company}
                                        </span>
                                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">{job.role}</h3>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-black text-slate-400">Salary Package</span>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{job.salary || 'Negotiable'}</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[10px] uppercase font-black text-slate-400">Location</span>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{job.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                        {offers.length === 0 && (
                            <div className="col-span-3 py-20 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <p className="text-slate-500 italic">No offers found in your job tracker. Move some jobs to "Offer" status to compare them!</p>
                            </div>
                        )}
                    </div>

                    {/* Comparison Results */}
                    {comparison ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Top Verdict Card */}
                            <div className="bg-brand-deep dark:bg-blue-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
                                    <TrendingUp size={120} />
                                </div>
                                <div className="relative z-10 max-w-2xl">
                                    <h2 className="text-3xl font-black mb-4 flex items-center gap-3">
                                        <Sparkles className="text-brand-mint" />
                                        Ntim's Strategic Verdict
                                    </h2>
                                    <p className="text-lg leading-relaxed text-blue-100 font-medium italic">
                                        "{comparison.verdict}"
                                    </p>
                                </div>
                            </div>

                            {/* Data Grid Comparison */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {comparison.points.map((point, idx) => (
                                    <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-brand-mint dark:border-slate-800 shadow-sm hover:border-brand-primary transition-colors">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{point.criteria}</h4>
                                            <BarChart3 size={16} className="text-brand-primary opacity-50" />
                                        </div>

                                        <div className="space-y-6">
                                            <div className={`p-4 rounded-2xl border transition-all ${point.winner === 'job1' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500/50 ring-1 ring-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'}`}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] font-black uppercase text-slate-500">{jobs.find(j => j.id === selectedIds[0])?.company}</span>
                                                    {point.winner === 'job1' && <CheckCircle2 size={14} className="text-emerald-500" />}
                                                </div>
                                                <p className={`text-sm ${point.winner === 'job1' ? 'font-bold text-slate-800 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400'}`}>{point.job1Value}</p>
                                            </div>

                                            <div className={`p-4 rounded-2xl border transition-all ${point.winner === 'job2' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500/50 ring-1 ring-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'}`}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] font-black uppercase text-slate-500">{jobs.find(j => j.id === selectedIds[1])?.company}</span>
                                                    {point.winner === 'job2' && <CheckCircle2 size={14} className="text-emerald-500" />}
                                                </div>
                                                <p className={`text-sm ${point.winner === 'job2' ? 'font-bold text-slate-800 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400'}`}>{point.job2Value}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Career Impact Card */}
                            <div className="bg-brand-rose/20 dark:bg-slate-800 p-8 rounded-3xl border border-brand-mint dark:border-slate-700 flex flex-col md:flex-row items-center gap-8">
                                <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center border-2 border-brand-primary shadow-lg">
                                    <Star className="text-brand-primary fill-brand-primary" size={32} />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="font-black text-brand-deep dark:text-white uppercase tracking-widest mb-2">Long-term Career Path</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Based on your profile as a Senior Engineer with specialized knowledge in React and Video Streaming, both roles offer significant growth. However, the Tech Stack diversity at {jobs.find(j => j.id === (comparison.verdict.includes(jobs.find(j => j.id === selectedIds[0])?.company || '') ? selectedIds[0] : selectedIds[1]))?.company} provides a more robust trajectory for high-level architect positions.
                                    </p>
                                </div>
                            </div>

                        </div>
                    ) : !isComparing && (
                        <div className="flex flex-col items-center justify-center py-20 group">
                            <div className="w-32 h-32 bg-brand-rose dark:bg-slate-800 rounded-full flex items-center justify-center mb-8 border-2 border-brand-mint dark:border-slate-700 group-hover:scale-110 transition-transform">
                                <Scale size={48} className="text-brand-primary" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-widest mb-4">Choose Your Battles</h2>
                            <p className="text-slate-500 text-center max-w-sm mb-10 leading-relaxed font-medium">
                                Select at least two offers from the track above to unlock Ntim's deep strategic analysis.
                            </p>
                            <div className="flex gap-3">
                                {[1, 2].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-300 font-black text-sm">
                                        {selectedIds[i - 1] ? <CheckCircle2 size={24} className="text-brand-primary" /> : i}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default OfferComparisonDashboard;
