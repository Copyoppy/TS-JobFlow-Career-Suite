import React, { useState } from 'react';
import { Job, JobStatus, ViewState } from '../types';
import {
    FileSearch, Upload, Clipboard, CheckCircle2, AlertCircle,
    ArrowRight, Sparkles, Loader2, Save, X, Briefcase, MapPin, DollarSign, Mail, Plus
} from 'lucide-react';
import { extractJobDetails } from '../services/geminiService';
import { useToast } from './Toast';

interface ApplicationScannerProps {
    onAddJob: (job: Job) => void;
    onViewChange: (view: ViewState) => void;
}

const ApplicationScanner: React.FC<ApplicationScannerProps> = ({ onAddJob, onViewChange }) => {
    const { showToast } = useToast();
    const [activeMode, setActiveMode] = useState<'paste' | 'upload'>('paste');
    const [inputText, setInputText] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [previewData, setPreviewData] = useState<Partial<Job> | null>(null);

    const handleExtract = async () => {
        if (!inputText.trim() && !selectedFile) {
            showToast("Please paste text or upload a document first.", "info");
            return;
        }

        setIsExtracting(true);
        setPreviewData(null);
        try {
            const details = await extractJobDetails(inputText, selectedFile || undefined);
            setPreviewData(details);
            showToast("Details extracted successfully!", "success");
        } catch (error) {
            console.error("Extraction failed:", error);
            showToast("Failed to extract details. Try again.", "error");
        } finally {
            setIsExtracting(false);
        }
    };

    const handleSyncToTracker = () => {
        if (!previewData) return;

        const newJob: Job = {
            id: Date.now().toString(),
            company: previewData.company || 'Unknown Company',
            role: previewData.role || 'New Position',
            location: previewData.location || 'Remote',
            salary: previewData.salary || '',
            status: JobStatus.APPLIED,
            dateApplied: new Date().toISOString().split('T')[0],
            description: previewData.description || inputText,
            email: previewData.email || '',
            origin: 'application'
        };

        onAddJob(newJob);
        showToast(`Synced ${newJob.role} at ${newJob.company} to your tracker!`, "success");
        onViewChange(ViewState.JOBS);
    };

    const handleClear = () => {
        setInputText('');
        setSelectedFile(null);
        setPreviewData(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                showToast("File size must be less than 5MB.", "error");
                return;
            }
            setSelectedFile(file);
            showToast(`Selected ${file.name}`, "success");
        }
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-brand-mint dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="max-w-4xl mx-auto w-full">
                    <h1 className="text-2xl font-black text-brand-deep dark:text-white flex items-center gap-3 uppercase tracking-widest">
                        <FileSearch className="text-brand-primary" /> Application Scan & Sync
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Ntim will extract details from your confirmation emails or job postings.</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-brand-rose/5 dark:bg-slate-950/20">
                <div className="max-w-4xl mx-auto space-y-10">

                    {/* Main Input Card */}
                    {!previewData ? (
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-brand-mint dark:border-slate-800 shadow-sm space-y-8 animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
                                <button
                                    onClick={() => setActiveMode('paste')}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeMode === 'paste' ? 'bg-white dark:bg-slate-700 text-brand-primary shadow-sm' : 'text-slate-500'}`}
                                >
                                    <Clipboard size={16} /> Paste Text
                                </button>
                                <button
                                    onClick={() => setActiveMode('upload')}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeMode === 'upload' ? 'bg-white dark:bg-slate-700 text-brand-primary shadow-sm' : 'text-slate-500'}`}
                                >
                                    <Upload size={16} /> Upload Doc
                                </button>
                            </div>

                            {activeMode === 'paste' ? (
                                <div className="space-y-4">
                                    <textarea
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Paste the content of a job confirmation email or a job description here..."
                                        className="w-full h-80 p-6 bg-slate-50 dark:bg-slate-800 border border-brand-mint dark:border-slate-700 rounded-3xl focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-sm dark:text-white resize-none"
                                    />
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supports email receipts, direct job posts, and more.</p>
                                        <div className="flex gap-3">
                                            <button onClick={handleClear} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 transition-colors">Clear</button>
                                            <button
                                                onClick={handleExtract}
                                                disabled={isExtracting || !inputText.trim()}
                                                className="bg-brand-primary text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-deep shadow-xl shadow-brand-primary/20 transition-all flex items-center gap-3 disabled:opacity-50"
                                            >
                                                {isExtracting ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                                Magic Extract
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50 dark:bg-slate-800/50 group">
                                    <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700 group-hover:scale-110 transition-transform">
                                        {selectedFile ? <CheckCircle2 size={24} className="text-emerald-500" /> : <Upload size={24} className="text-brand-primary" />}
                                    </div>
                                    <h3 className="font-bold text-slate-800 dark:text-white mb-1 uppercase tracking-widest text-sm">
                                        {selectedFile ? selectedFile.name : 'Upload Application Document'}
                                    </h3>
                                    <p className="text-xs text-slate-500 mb-6">{selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'PDF, PNG, or JPG (Max 5MB)'}</p>
                                    <div className="flex gap-4">
                                        <label className="bg-white dark:bg-slate-900 border border-brand-mint dark:border-slate-700 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-brand-rose/20 transition-all">
                                            {selectedFile ? 'Change File' : 'Browse Files'}
                                            <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />
                                        </label>
                                        {selectedFile && (
                                            <button
                                                onClick={handleExtract}
                                                disabled={isExtracting}
                                                className="bg-brand-primary text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-deep shadow-xl shadow-brand-primary/20 transition-all flex items-center gap-3 disabled:opacity-50"
                                            >
                                                {isExtracting ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                                Extract from Doc
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-bottom-6 duration-500 space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-brand-primary" /> Extracted Preview
                                </h2>
                                <button onClick={handleClear} className="text-xs text-slate-500 flex items-center gap-1 hover:text-rose-500"><X size={14} /> Start Over</button>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-brand-mint dark:border-slate-800 shadow-xl overflow-hidden">
                                <div className="p-10 space-y-8">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Detected Company</span>
                                            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{previewData.company || 'Missing Name'}</h3>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detected Role</span>
                                            <p className="text-xl font-bold text-brand-secondary">{previewData.role || 'Missing Role'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><MapPin size={10} /> Location</div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{previewData.location || 'Remote/Unknown'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><DollarSign size={10} /> Salary</div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{previewData.salary || 'Not Mentioned'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Mail size={10} /> Contact</div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{previewData.email || 'None Found'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Briefcase size={10} /> Status</div>
                                            <span className="text-[10px] font-black bg-brand-rose dark:bg-blue-900/30 text-brand-primary px-2 py-0.5 rounded uppercase tracking-widest">Applied</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Smart Summary</span>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-brand-rose/20 dark:bg-slate-800/50 p-6 rounded-2xl border border-brand-mint dark:border-slate-700 italic">
                                            {previewData.description ? previewData.description.substring(0, 300) + '...' : 'Details extracted from your input.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/80 p-6 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
                                    <div className="flex-1 flex items-center gap-3 text-xs text-amber-600 font-bold px-4">
                                        <AlertCircle size={16} /> Double check details before syncing
                                    </div>
                                    <button
                                        onClick={handleSyncToTracker}
                                        className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-3"
                                    >
                                        <Save size={18} /> Sync to Tracker
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tips Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex gap-4">
                            <div className="w-10 h-10 bg-white dark:bg-blue-900/50 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-blue-100 dark:border-blue-800">
                                <Plus size={20} className="text-brand-primary" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xs font-black uppercase tracking-widest text-blue-800 dark:text-blue-300">Why use Scan & Sync?</h4>
                                <p className="text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed">Save hours of manual data entry. Paste your confirmation emails and Ntim will automatically organize your job board.</p>
                            </div>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex gap-4">
                            <div className="w-10 h-10 bg-white dark:bg-emerald-900/50 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-emerald-100 dark:border-emerald-800">
                                <Sparkles size={20} className="text-emerald-500" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xs font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-300">Ntim Strategy</h4>
                                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">I can even detect if the job posting has any hidden requirements or unique benefits just from the text!</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ApplicationScanner;
