import React, { useState, useMemo } from 'react';
import { Job, JobStatus, Resume } from '../types';
import {
    Bell, Send, Clock, CheckCircle2, AlertCircle,
    ChevronRight, Sparkles, Loader2, Copy, History,
    ArrowRight, X, Calendar, User, Briefcase
} from 'lucide-react';
import { generateFollowUp } from '../services/geminiService';
import { useToast } from './Toast';

interface FollowUpAssistantProps {
    jobs: Job[];
    resume?: Resume;
    onUpdateJob: (jobId: string, updates: Partial<Job>) => void;
    onClose: () => void;
}

const FollowUpAssistant: React.FC<FollowUpAssistantProps> = ({ jobs, resume, onUpdateJob, onClose }) => {
    const { showToast } = useToast();
    const [isGenerating, setIsGenerating] = useState<string | null>(null);
    const [drafts, setDrafts] = useState<Record<string, string>>({});

    const staleJobs = useMemo(() => {
        const now = new Date();
        return jobs.filter(job => {
            if (job.status === JobStatus.REJECTED || job.status === JobStatus.ACCEPTED) return false;

            const dateStr = job.dateApplied || job.interviewDate;
            if (!dateStr) return false;

            const jobDate = new Date(dateStr);
            const diffDays = Math.floor((now.getTime() - jobDate.getTime()) / (1000 * 3600 * 24));

            // Criteria for stale: 
            // Applied > 7 days ago OR Interviewed > 2 days ago
            if (job.status === JobStatus.APPLIED && diffDays >= 7) return true;
            if (job.status === JobStatus.INTERVIEW && diffDays >= 2) return true;

            return false;
        }).sort((a, b) => {
            const dateA = new Date(a.dateApplied || a.interviewDate || '').getTime();
            const dateB = new Date(b.dateApplied || b.interviewDate || '').getTime();
            return dateA - dateB;
        });
    }, [jobs]);

    const handleGenerateDraft = async (job: Job) => {
        setIsGenerating(job.id);
        try {
            const draft = await generateFollowUp(job, resume);
            setDrafts(prev => ({ ...prev, [job.id]: draft }));
            showToast("Follow-up draft generated!", "success");
        } catch (error) {
            console.error("Draft generation failed:", error);
            showToast("Failed to generate draft. Please try again.", "error");
        } finally {
            setIsGenerating(null);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast("Copied to clipboard!", "success");
    };

    return (
        <div className="fixed inset-0 bg-brand-deep/20 dark:bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-end p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-[90vh] rounded-[40px] shadow-2xl border border-brand-mint dark:border-slate-800 flex flex-col relative overflow-hidden animate-in slide-in-from-right duration-500">

                {/* Header */}
                <div className="p-8 border-b border-brand-mint dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                        <h2 className="text-xl font-black text-brand-deep dark:text-white flex items-center gap-2 uppercase tracking-widest">
                            <Bell className="text-brand-primary" /> Smart Follow-up Assistant
                        </h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">Re-energize {staleJobs.length} stale applications</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-brand-rose dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {staleJobs.length > 0 ? (
                        staleJobs.map(job => (
                            <div key={job.id} className="bg-white dark:bg-slate-900 border border-brand-mint dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:border-brand-primary transition-all group">
                                {/* Job Summary Bar */}
                                <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-brand-mint dark:border-slate-700 shadow-sm">
                                            <Briefcase size={20} className="text-brand-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm">{job.role}</h4>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{job.company}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${job.status === JobStatus.INTERVIEW ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {job.status}
                                        </span>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center justify-end gap-1">
                                            <Clock size={10} /> {job.status === JobStatus.APPLIED ? 'Applied' : 'Interviewed'} {job.dateApplied || job.interviewDate}
                                        </p>
                                    </div>
                                </div>

                                {/* Interaction Area */}
                                <div className="p-6 space-y-4">
                                    {!drafts[job.id] ? (
                                        <div className="flex flex-col items-center py-6 space-y-4">
                                            <p className="text-xs text-slate-500 font-medium text-center max-w-xs">It's been a while since your last interaction. Let Ntim draft a strategic follow-up for you.</p>
                                            <button
                                                onClick={() => handleGenerateDraft(job)}
                                                disabled={isGenerating === job.id}
                                                className="bg-brand-primary text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-deep transition-all flex items-center gap-3 shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                                            >
                                                {isGenerating === job.id ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                                Generate Draft
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="animate-in fade-in zoom-in-95 duration-300 space-y-4">
                                            <div className="bg-brand-rose/20 dark:bg-slate-800/80 p-6 rounded-2xl border border-brand-mint dark:border-slate-700 relative group/draft">
                                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic pr-10">
                                                    "{drafts[job.id]}"
                                                </p>
                                                <button
                                                    onClick={() => handleCopy(drafts[job.id])}
                                                    className="absolute top-4 right-4 p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-slate-100 dark:border-slate-600 text-slate-400 hover:text-brand-primary transition-colors"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-center px-2">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                                    <CheckCircle2 size={12} /> AI Optimized for {job.status}
                                                </div>
                                                <button
                                                    onClick={() => handleGenerateDraft(job)}
                                                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-primary flex items-center gap-1 transition-colors"
                                                >
                                                    <History size={12} /> Re-draft
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-6">
                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 opacity-50">
                                <CheckCircle2 size={40} className="text-emerald-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest">All Caught Up!</h3>
                                <p className="text-slate-500 max-w-sm text-sm font-medium leading-relaxed">
                                    None of your applications are currently considered "stale". Check back in a few days or after your next round of interviews!
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-brand-mint dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shrink-0">
                        <Bolt size={20} className="animate-spin-slow" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-widest">
                        Follow-ups increase response rates by up to 30%. Ntim uses your target role context and job history to maximize impact.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Simple animation for the footer icon
const Bolt = ({ className, size }: { className?: string; size?: number }) => (
    <Sparkles className={className} size={size} />
);

export default FollowUpAssistant;
