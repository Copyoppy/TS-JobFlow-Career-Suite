import React from 'react';
import { Job, JobStatus } from '../types';
import { X, Loader2, Sparkles } from 'lucide-react';
import SalaryPicker from './SalaryPicker';

interface AddJobModalProps {
    isOffersMode: boolean;
    newJob: Partial<Job>;
    setNewJob: React.Dispatch<React.SetStateAction<Partial<Job>>>;
    isGenerating: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
}

const AddJobModal: React.FC<AddJobModalProps> = ({
    isOffersMode,
    newJob,
    setNewJob,
    isGenerating,
    onSubmit,
    onClose,
}) => {
    return (
        <div className="fixed inset-0 bg-brand-deep/20 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-brand-mint dark:border-slate-700">
                <div className="p-6 border-b border-brand-mint dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">{isOffersMode ? 'Log New Offer' : 'Add New Application'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-brand-primary transition"><X size={24} /></button>
                </div>
                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    <input required type="text" placeholder="Company" className="w-full p-2.5 border border-brand-mint dark:border-slate-700 rounded-lg text-sm outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white" value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })} />
                    <input required type="text" placeholder="Role Title" className="w-full p-2.5 border border-brand-mint dark:border-slate-700 rounded-lg text-sm outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white" value={newJob.role} onChange={e => setNewJob({ ...newJob, role: e.target.value })} />
                    <input type="text" placeholder="Location" className="w-full p-2.5 border border-brand-mint dark:border-slate-700 rounded-lg text-sm outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} />
                    <SalaryPicker value={newJob.salary} onChange={salary => setNewJob({ ...newJob, salary })} />
                    <input type="url" placeholder="Application URL (optional)" className="w-full p-2.5 border border-brand-mint dark:border-slate-700 rounded-lg text-sm outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white" value={newJob.applicationUrl || ''} onChange={e => setNewJob({ ...newJob, applicationUrl: e.target.value })} />
                    <textarea className="w-full p-2.5 border border-brand-mint dark:border-slate-700 rounded-lg text-sm h-24 resize-none outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white" placeholder="Job Description..." value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} />
                    <button type="submit" disabled={isGenerating} className="w-full bg-brand-primary text-white py-3 rounded-xl font-medium hover:bg-brand-deep transition flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20">
                        {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} className="text-white" />} {isGenerating ? 'Generating...' : 'Create Job'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddJobModal;
