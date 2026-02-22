import React, { useState } from 'react';
import { Job, PortfolioSettings, PortfolioProject, Project } from '../types';
import {
    Globe, Layout, CheckCircle2, Circle, Edit3, Image as ImageIcon, Plus, Trash2,
    ExternalLink, Sparkles, Monitor, User, Briefcase, Code, Lock, Unlocked
} from 'lucide-react';
import { useToast } from './Toast';

interface PortfolioEditorProps {
    jobs: Job[];
    portfolioSettings: PortfolioSettings;
    setPortfolioSettings: React.Dispatch<React.SetStateAction<PortfolioSettings>>;
}

const PortfolioEditor: React.FC<PortfolioEditorProps> = ({ jobs, portfolioSettings, setPortfolioSettings }) => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'basics' | 'jobs' | 'projects'>('basics');

    const acceptedJobs = jobs.filter(j => j.status === 'Accepted' || j.status === 'Offer');

    const updateSettings = (updates: Partial<PortfolioSettings>) => {
        setPortfolioSettings(prev => ({ ...prev, ...updates }));
    };

    const toggleFeaturedJob = (jobId: string) => {
        const isFeatured = portfolioSettings.featuredJobs.includes(jobId);
        if (isFeatured) {
            updateSettings({ featuredJobs: portfolioSettings.featuredJobs.filter(id => id !== jobId) });
        } else {
            updateSettings({ featuredJobs: [...portfolioSettings.featuredJobs, jobId] });
        }
    };

    const addProject = () => {
        const newProject: PortfolioProject = {
            id: Date.now().toString(),
            title: 'New Project',
            description: 'Project description goes here...',
            isFeatured: true
        };
        updateSettings({ projects: [newProject, ...portfolioSettings.projects] });
    };

    const removeProject = (id: string) => {
        updateSettings({ projects: portfolioSettings.projects.filter(p => p.id !== id) });
    };

    const updateProject = (id: string, updates: Partial<PortfolioProject>) => {
        updateSettings({
            projects: portfolioSettings.projects.map(p => p.id === id ? { ...p, ...updates } : p)
        });
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-brand-mint dark:border-slate-800 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-brand-deep dark:text-white flex items-center gap-3 uppercase tracking-widest">
                        <Globe className="text-brand-primary" /> Portfolio Builder
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Design your professional public profile.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => updateSettings({ isPublic: !portfolioSettings.isPublic })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${portfolioSettings.isPublic
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                    >
                        {portfolioSettings.isPublic ? <Unlocked size={16} /> : <Lock size={16} />}
                        {portfolioSettings.isPublic ? 'Public' : 'Private'}
                    </button>

                    <button className="bg-brand-primary text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-deep transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/20">
                        <ExternalLink size={16} /> Preview Site
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Nav */}
                <div className="w-64 border-r border-brand-mint dark:border-slate-800 p-6 space-y-2 bg-slate-50 dark:bg-slate-900/50">
                    <button
                        onClick={() => setActiveTab('basics')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'basics' ? 'bg-brand-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        <User size={18} /> Profile Details
                    </button>
                    <button
                        onClick={() => setActiveTab('jobs')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'jobs' ? 'bg-brand-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        <Briefcase size={18} /> Featured Jobs
                    </button>
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'projects' ? 'bg-brand-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        <Code size={18} /> Tech Projects
                    </button>

                    <div className="pt-6 mt-6 border-t border-brand-mint dark:border-slate-800">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest p-4">Theme Selection</h4>
                        <div className="grid grid-cols-1 gap-3 p-2">
                            {['minimal', 'modern', 'glass'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => updateSettings({ theme: t as any })}
                                    className={`px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${portfolioSettings.theme === t ? 'bg-brand-rose dark:bg-slate-800 border-brand-primary text-brand-primary' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Editor Content */}
                <div className="flex-1 overflow-y-auto p-10 bg-brand-rose/10 dark:bg-slate-950/20 custom-scrollbar">
                    <div className="max-w-3xl mx-auto space-y-10">

                        {activeTab === 'basics' && (
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-brand-mint dark:border-slate-800 shadow-sm space-y-6">
                                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl mb-6 border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <Sparkles className="text-brand-primary" size={20} />
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">AI Profile Optimization is active</span>
                                    </div>
                                    <button className="text-[10px] font-black bg-brand-primary text-white px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-lg shadow-brand-primary/20">Analyze Profile</button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Display Name</label>
                                        <input
                                            type="text"
                                            value={portfolioSettings.fullName}
                                            onChange={e => updateSettings({ fullName: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-brand-mint dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-brand-primary outline-none transition-all text-sm dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Tagline (One Liner)</label>
                                        <input
                                            type="text"
                                            value={portfolioSettings.tagline}
                                            onChange={e => updateSettings({ tagline: e.target.value })}
                                            placeholder="e.g. Senior Frontend Engineer specializing in accessible design"
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-brand-mint dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-brand-primary outline-none transition-all text-sm dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Short Bio</label>
                                        <textarea
                                            value={portfolioSettings.bio}
                                            onChange={e => updateSettings({ bio: e.target.value })}
                                            rows={4}
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-brand-mint dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-brand-primary outline-none transition-all text-sm dark:text-white resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'jobs' && (
                            <div className="space-y-4">
                                <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 mb-8">
                                    <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-2">
                                        <Briefcase size={18} /> Highlighting Your Success
                                    </h3>
                                    <p className="text-xs text-blue-700 dark:text-blue-400">Select the roles you want to showcase on your public portfolio. We recommend including "Accepted" and high-profile "Offer" roles.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {acceptedJobs.length > 0 ? acceptedJobs.map(job => (
                                        <button
                                            key={job.id}
                                            onClick={() => toggleFeaturedJob(job.id)}
                                            className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${portfolioSettings.featuredJobs.includes(job.id)
                                                    ? 'bg-brand-primary/5 dark:bg-blue-900/20 border-brand-primary shadow-md'
                                                    : 'bg-white dark:bg-slate-900 border-brand-mint dark:border-slate-800 hover:border-brand-primary'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl ${portfolioSettings.featuredJobs.includes(job.id) ? 'bg-brand-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                                    {portfolioSettings.featuredJobs.includes(job.id) ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                                </div>
                                                <div className="text-left">
                                                    <h4 className="font-bold text-slate-800 dark:text-white">{job.role}</h4>
                                                    <p className="text-xs text-slate-500">{job.company}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-black bg-brand-mint dark:bg-slate-800 text-brand-deep dark:text-blue-300 px-2 py-0.5 rounded uppercase tracking-widest">{job.status}</span>
                                        </button>
                                    )) : (
                                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                                            <p className="text-sm text-slate-500">You haven't accepted any jobs yet. Keep applying!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'projects' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Extra Curricular Projects</h3>
                                    <button
                                        onClick={addProject}
                                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-primary hover:text-brand-deep transition-colors"
                                    >
                                        <Plus size={16} /> Add project
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {portfolioSettings.projects.map(project => (
                                        <div key={project.id} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-brand-mint dark:border-slate-800 shadow-sm relative group overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => removeProject(project.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                                            </div>

                                            <div className="flex gap-6">
                                                <div className="w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 group/thumb cursor-pointer relative overflow-hidden">
                                                    {project.thumbnailUrl ? (
                                                        <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <>
                                                            <ImageIcon size={24} className="text-slate-300 group-hover/thumb:text-brand-primary transition-colors" />
                                                            <span className="text-[8px] font-bold text-slate-400 group-hover/thumb:text-brand-primary uppercase text-center px-2">Whisk Generate</span>
                                                        </>
                                                    )}
                                                    <div className="absolute inset-0 bg-brand-primary/80 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                                                        <Sparkles className="text-white" size={24} />
                                                    </div>
                                                </div>

                                                <div className="flex-1 space-y-4">
                                                    <input
                                                        type="text"
                                                        value={project.title}
                                                        onChange={e => updateProject(project.id, { title: e.target.value })}
                                                        className="w-full text-lg font-bold bg-transparent border-b border-transparent focus:border-brand-primary outline-none dark:text-white"
                                                        placeholder="Project Title"
                                                    />
                                                    <textarea
                                                        value={project.description}
                                                        onChange={e => updateProject(project.id, { description: e.target.value })}
                                                        rows={3}
                                                        className="w-full text-sm text-slate-600 dark:text-slate-400 bg-transparent border-b border-transparent focus:border-brand-primary outline-none resize-none"
                                                        placeholder="What did you build?"
                                                    />
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg w-fit border border-slate-100 dark:border-slate-700">
                                                        <ImageIcon size={14} className="text-brand-primary" />
                                                        <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Image ID: auto-gen</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortfolioEditor;
