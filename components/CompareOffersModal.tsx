import React from 'react';
import { Job, JobStatus, OfferComparisonResult } from '../types';
import { X, Loader2, Sparkles, Scale, CheckCircle2 } from 'lucide-react';

interface CompareOffersModalProps {
    jobs: Job[];
    displayedJobs: Job[];
    compareSelection: [string, string];
    setCompareSelection: React.Dispatch<React.SetStateAction<[string, string]>>;
    comparisonResult: OfferComparisonResult | null;
    setComparisonResult: React.Dispatch<React.SetStateAction<OfferComparisonResult | null>>;
    loadingFeature: string | null;
    onCompare: () => void;
    onClose: () => void;
}

const getVerdictStyles = (verdict: string) => {
    const lower = verdict.toLowerCase();
    if (lower.includes('strongly recommend') || lower.includes('clear winner')) {
        return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200';
    }
    if (lower.includes('lean towards') || lower.includes('slight edge')) {
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
    }
    return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200';
};

const CompareOffersModal: React.FC<CompareOffersModalProps> = ({
    jobs,
    displayedJobs,
    compareSelection,
    setCompareSelection,
    comparisonResult,
    setComparisonResult,
    loadingFeature,
    onCompare,
    onClose,
}) => {
    return (
        <div className="fixed inset-0 bg-brand-deep/20 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-brand-mint dark:border-slate-800 flex flex-col">
                <div className="p-6 border-b border-brand-mint dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><Scale size={20} className="text-brand-primary" /> Offer Comparison Matrix</h2>
                    <button onClick={() => { onClose(); setComparisonResult(null); }} className="text-slate-400 hover:text-brand-primary transition"><X size={24} /></button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    {/* Selection Controls */}
                    {!comparisonResult ? (
                        <div className="flex flex-col items-center justify-center h-full py-10 space-y-6">
                            <p className="text-slate-600 dark:text-slate-400">Select two offers to analyze side-by-side.</p>
                            <div className="flex items-center gap-4 w-full max-w-2xl">
                                <select
                                    value={compareSelection[0]}
                                    onChange={(e) => setCompareSelection([e.target.value, compareSelection[1]])}
                                    className="flex-1 p-3 border border-brand-mint dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none"
                                >
                                    <option value="">Select Offer A</option>
                                    {displayedJobs.map(j => <option key={j.id} value={j.id}>{j.company} - {j.role}</option>)}
                                </select>
                                <span className="font-bold text-slate-400">VS</span>
                                <select
                                    value={compareSelection[1]}
                                    onChange={(e) => setCompareSelection([compareSelection[0], e.target.value])}
                                    className="flex-1 p-3 border border-brand-mint dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none"
                                >
                                    <option value="">Select Offer B</option>
                                    {displayedJobs.map(j => <option key={j.id} value={j.id}>{j.company} - {j.role}</option>)}
                                </select>
                            </div>
                            <button
                                onClick={onCompare}
                                disabled={!compareSelection[0] || !compareSelection[1] || loadingFeature === 'compare'}
                                className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-deep disabled:opacity-50 transition shadow-lg shadow-brand-primary/20 flex items-center gap-2"
                            >
                                {loadingFeature === 'compare' ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                                Run Comparison
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Header Row */}
                            <div className="grid grid-cols-3 gap-4 border-b-2 border-slate-100 dark:border-slate-800 pb-4">
                                <div className="font-bold text-slate-400 text-sm uppercase tracking-wider self-end">Criteria</div>
                                <div className="text-center">
                                    <div className="font-bold text-lg text-brand-deep dark:text-white">{jobs.find(j => j.id === compareSelection[0])?.company}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{jobs.find(j => j.id === compareSelection[0])?.role}</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-lg text-brand-deep dark:text-white">{jobs.find(j => j.id === compareSelection[1])?.company}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{jobs.find(j => j.id === compareSelection[1])?.role}</div>
                                </div>
                            </div>

                            {/* Points */}
                            <div className="space-y-2">
                                {comparisonResult.points.map((point, idx) => (
                                    <div key={idx} className="grid grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-brand-mint dark:hover:border-slate-600 transition-colors">
                                        <div className="font-medium text-slate-700 dark:text-slate-300 flex items-center">{point.criteria}</div>
                                        <div className={`text-sm p-3 rounded-lg border ${point.winner === 'job1' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                                            {point.job1Value}
                                            {point.winner === 'job1' && <CheckCircle2 size={14} className="inline ml-2 text-emerald-500" />}
                                        </div>
                                        <div className={`text-sm p-3 rounded-lg border ${point.winner === 'job2' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                                            {point.job2Value}
                                            {point.winner === 'job2' && <CheckCircle2 size={14} className="inline ml-2 text-emerald-500" />}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Verdict */}
                            <div className="bg-brand-deep dark:bg-blue-900 text-white p-6 rounded-xl shadow-lg mt-6">
                                <h3 className="font-bold text-brand-mint mb-2 flex items-center gap-2"><Sparkles size={18} /> AI Verdict</h3>
                                <p className="leading-relaxed opacity-90">{comparisonResult.verdict}</p>
                            </div>

                            <button
                                onClick={() => setComparisonResult(null)}
                                className="text-sm text-slate-500 hover:text-brand-primary underline block mx-auto mt-4"
                            >
                                Start New Comparison
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompareOffersModal;
