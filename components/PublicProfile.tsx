import React from 'react';
import { Job, PortfolioSettings, JobStatus } from '../types';
import {
    Globe, Briefcase, Code, MapPin, Calendar, ExternalLink,
    Linkedin, Github, Mail, Award, CheckCircle2, Star
} from 'lucide-react';

interface PublicProfileProps {
    settings: PortfolioSettings;
    jobs: Job[];
}

const PublicProfile: React.FC<PublicProfileProps> = ({ settings, jobs }) => {
    const featuredJobs = jobs.filter(j => settings.featuredJobs.includes(j.id));

    const themeClasses = {
        minimal: "bg-white text-slate-900 font-sans",
        modern: "bg-slate-50 text-slate-800 font-sans",
        glass: "bg-gradient-to-br from-indigo-50 to-rose-50 text-slate-900 font-sans"
    }[settings.theme];

    return (
        <div className={`min-h-screen py-20 px-6 md:px-0 ${themeClasses}`}>
            <div className="max-w-4xl mx-auto space-y-24">

                {/* Hero Section */}
                <section className="text-center space-y-6">
                    <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl">
                        <Star className="text-brand-primary fill-brand-primary" size={40} />
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                        {settings.fullName || 'Anonymous Professional'}
                    </h1>
                    <p className="text-xl text-brand-primary font-bold uppercase tracking-widest">
                        {settings.tagline || 'Career Professional'}
                    </p>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        {settings.bio || 'Building the future, one project at a time.'}
                    </p>

                    <div className="flex justify-center gap-6 pt-8">
                        <Mail className="text-slate-400 hover:text-brand-primary cursor-pointer transition-colors" />
                        <Linkedin className="text-slate-400 hover:text-brand-primary cursor-pointer transition-colors" />
                        <Github className="text-slate-400 hover:text-brand-primary cursor-pointer transition-colors" />
                    </div>
                </section>

                {/* Experience Section */}
                <section className="space-y-12">
                    <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                        <Briefcase size={28} className="text-brand-primary" /> Professional History
                    </h2>

                    <div className="space-y-12">
                        {featuredJobs.map(job => (
                            <div key={job.id} className="relative pl-12 border-l-2 border-brand-mint/30 py-2 group">
                                <div className="absolute left-[-9px] top-4 w-4 h-4 bg-brand-primary rounded-full border-4 border-white dark:border-slate-900 shadow-sm" />
                                <div className="space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors">{job.role}</h3>
                                            <p className="text-brand-secondary font-bold">{job.company}</p>
                                        </div>
                                        <span className="text-xs font-black bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-tighter">
                                            {job.dateApplied.split('-')[0]}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-2xl italic">
                                        {job.description ? job.description.substring(0, 200) + '...' : 'Transforming industries through innovation and collaboration.'}
                                    </p>
                                    <div className="flex items-center gap-4 pt-2">
                                        <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1"><MapPin size={10} /> {job.location}</span>
                                        <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1"><ExternalLink size={10} /> Case Study Available</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Projects Section */}
                <section className="space-y-12">
                    <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                        <Code size={28} className="text-brand-primary" /> Key Contributions
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {settings.projects.map(project => (
                            <div key={project.id} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-brand-mint/50 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                                <div className="h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                    {project.thumbnailUrl ? (
                                        <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-slate-300 flex flex-col items-center gap-2">
                                            <Award size={48} />
                                            <span className="text-[10px] uppercase font-black">Featured Project</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-8 space-y-4">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{project.title}</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {project.description}
                                    </p>
                                    <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-primary hover:text-brand-deep transition-colors">
                                        View Project <ExternalLink size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer className="text-center pt-20 pb-10 border-t border-brand-mint/30">
                    <div className="flex items-center justify-center gap-2 text-slate-400 text-sm mb-4 font-medium">
                        <CheckCircle2 size={16} className="text-emerald-500" /> Verified by JobFlow Career Suite
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.3em]">
                        © {new Date().getFullYear()} {settings.fullName}
                    </p>
                </footer>

            </div>
        </div>
    );
};

export default PublicProfile;
