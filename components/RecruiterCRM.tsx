import React, { useState, useMemo } from 'react';
import {
    Users, Plus, Search, Mail, Linkedin, Phone, Calendar,
    MoreVertical, Edit2, Trash2, ExternalLink, Building2,
    Briefcase, MessageSquare, UserPlus, X, Check, Clock
} from 'lucide-react';
import { Recruiter, Job } from '../types';

interface RecruiterCRMProps {
    recruiters: Recruiter[];
    setRecruiters: React.Dispatch<React.SetStateAction<Recruiter[]>>;
    jobs: Job[];
    onNavigateToJob?: (job: Job) => void;
}

const RecruiterCRM: React.FC<RecruiterCRMProps> = ({ recruiters, setRecruiters, jobs, onNavigateToJob }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRecruiter, setEditingRecruiter] = useState<Recruiter | null>(null);
    const [newRecruiter, setNewRecruiter] = useState<Partial<Recruiter>>({});

    const filteredRecruiters = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return recruiters.filter(r =>
            r.name.toLowerCase().includes(q) ||
            (r.agency && r.agency.toLowerCase().includes(q)) ||
            (r.notes && r.notes.toLowerCase().includes(q))
        );
    }, [recruiters, searchQuery]);

    const handleAddRecruiter = () => {
        if (!newRecruiter.name) return;

        const recruiter: Recruiter = {
            id: editingRecruiter?.id || Date.now().toString(),
            name: newRecruiter.name,
            agency: newRecruiter.agency || '',
            email: newRecruiter.email || '',
            linkedin: newRecruiter.linkedin || '',
            phone: newRecruiter.phone || '',
            notes: newRecruiter.notes || '',
            lastContactDate: newRecruiter.lastContactDate || new Date().toISOString().split('T')[0]
        };

        if (editingRecruiter) {
            setRecruiters(prev => prev.map(r => r.id === editingRecruiter.id ? recruiter : r));
        } else {
            setRecruiters(prev => [...prev, recruiter]);
        }

        setShowAddModal(false);
        setEditingRecruiter(null);
        setNewRecruiter({});
    };

    const handleDeleteRecruiter = (id: string) => {
        if (window.confirm("Are you sure you want to remove this contact?")) {
            setRecruiters(prev => prev.filter(r => r.id !== id));
        }
    };

    const openEdit = (recruiter: Recruiter) => {
        setEditingRecruiter(recruiter);
        setNewRecruiter(recruiter);
        setShowAddModal(true);
    };

    const getLinkedJobs = (recruiterId: string) => {
        return jobs.filter(j => j.recruiterId === recruiterId);
    };

    return (
        <div className="p-8 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-brand-deep dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-brand-primary rounded-2xl shadow-lg shadow-brand-primary/20 text-white">
                            <Users size={28} />
                        </div>
                        Recruiter CRM
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Coordinate your network and track every interaction with hiring teams.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-brand-mint dark:border-slate-800 rounded-2xl text-sm w-full md:w-64 outline-none focus:ring-2 ring-brand-primary/20 transition-all font-medium"
                        />
                    </div>
                    <button
                        onClick={() => { setShowAddModal(true); setEditingRecruiter(null); setNewRecruiter({}); }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-2xl font-bold shadow-lg shadow-brand-primary/30 hover:scale-[1.02] active:scale-95 transition-all text-sm whitespace-nowrap"
                    >
                        <UserPlus size={18} />
                        Add Contact
                    </button>
                </div>
            </div>

            {filteredRecruiters.length === 0 ? (
                <div className="bg-white dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-brand-mint dark:border-slate-800 p-20 text-center">
                    <div className="w-20 h-20 bg-brand-rose dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="text-brand-primary" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No contacts yet</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mb-8 font-medium">Start building your network by adding recruiters and hiring managers you're in touch with.</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold shadow-lg shadow-brand-primary/20"
                    >
                        <Plus size={20} />
                        Create First Contact
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredRecruiters.map(recruiter => {
                        const linkedJobs = getLinkedJobs(recruiter.id);
                        return (
                            <div key={recruiter.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-brand-mint dark:border-slate-800 shadow-xl shadow-brand-primary/5 hover:border-brand-primary transition-all duration-300 relative group overflow-hidden">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-brand-rose dark:bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary text-xl font-black">
                                            {recruiter.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors">{recruiter.name}</h3>
                                            {recruiter.agency && (
                                                <div className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                    <Building2 size={12} />
                                                    {recruiter.agency}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(recruiter)} className="p-2 text-slate-400 hover:text-brand-primary bg-slate-50 dark:bg-slate-800 rounded-xl transition-colors"><Edit2 size={14} /></button>
                                        <button onClick={() => handleDeleteRecruiter(recruiter.id)} className="p-2 text-slate-400 hover:text-rose-500 bg-slate-50 dark:bg-slate-800 rounded-xl transition-colors"><Trash2 size={14} /></button>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    {recruiter.email && (
                                        <a
                                            href={`mailto:${recruiter.email}`}
                                            className="flex items-center gap-3 text-sm text-slate-500 hover:text-brand-primary transition-colors font-medium group/link"
                                        >
                                            <Mail size={14} className="text-brand-primary" />
                                            <span className="border-b border-transparent group-hover/link:border-brand-primary/30">{recruiter.email}</span>
                                            <ExternalLink size={10} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                        </a>
                                    )}
                                    {recruiter.linkedin && (
                                        <a
                                            href={recruiter.linkedin.startsWith('http') ? recruiter.linkedin : `https://${recruiter.linkedin}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 text-sm text-slate-500 hover:text-brand-primary transition-colors font-medium group/link"
                                        >
                                            <Linkedin size={14} className="text-brand-primary" />
                                            <span className="border-b border-transparent group-hover/link:border-brand-primary/30">LinkedIn Profile</span>
                                            <ExternalLink size={10} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                        </a>
                                    )}
                                    {recruiter.lastContactDate && (
                                        <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                                            <Clock size={14} className="text-brand-primary" />
                                            Last Contact: <span className="font-bold text-slate-700 dark:text-slate-300">{recruiter.lastContactDate}</span>
                                        </div>
                                    )}
                                </div>

                                {linkedJobs.length > 0 && (
                                    <div className="mb-6">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Linked Applications</div>
                                        <div className="flex flex-wrap gap-2">
                                            {linkedJobs.map(job => (
                                                <button
                                                    key={job.id}
                                                    onClick={() => onNavigateToJob?.(job)}
                                                    className="bg-brand-rose dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-brand-mint dark:border-slate-700 text-[11px] font-bold text-brand-deep dark:text-white flex items-center gap-2 hover:border-brand-primary hover:shadow-sm transition-all"
                                                >
                                                    <Briefcase size={12} className="text-brand-primary" />
                                                    {job.company}
                                                    <ExternalLink size={8} className="opacity-40" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {recruiter.notes && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-brand-mint/50 dark:border-slate-800 text-xs text-slate-500 italic leading-relaxed">
                                        <MessageSquare size={12} className="inline mr-2 text-brand-primary opacity-50" />
                                        "{recruiter.notes}"
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl max-w-lg w-full p-8 border border-brand-mint dark:border-slate-800 overflow-y-auto max-h-[90vh] custom-scrollbar">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{editingRecruiter ? 'Edit Contact' : 'New Contact'}</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"><X size={24} /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Name *</label>
                                <input
                                    type="text"
                                    value={newRecruiter.name || ''}
                                    onChange={(e) => setNewRecruiter(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g. Sarah Jenkins"
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-brand-primary dark:text-white rounded-2xl outline-none transition-all font-bold placeholder:font-normal"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Agency / Company</label>
                                    <input
                                        type="text"
                                        value={newRecruiter.agency || ''}
                                        onChange={(e) => setNewRecruiter(prev => ({ ...prev, agency: e.target.value }))}
                                        placeholder="e.g. TechTalent"
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-brand-primary dark:text-white rounded-2xl outline-none transition-all font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Email</label>
                                    <input
                                        type="email"
                                        value={newRecruiter.email || ''}
                                        onChange={(e) => setNewRecruiter(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="sarah@agency.com"
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-brand-primary dark:text-white rounded-2xl outline-none transition-all font-bold"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-2">LinkedIn URL</label>
                                    <input
                                        type="text"
                                        value={newRecruiter.linkedin || ''}
                                        onChange={(e) => setNewRecruiter(prev => ({ ...prev, linkedin: e.target.value }))}
                                        placeholder="linkedin.com/in/..."
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-brand-primary dark:text-white rounded-2xl outline-none transition-all font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Phone</label>
                                    <input
                                        type="text"
                                        value={newRecruiter.phone || ''}
                                        onChange={(e) => setNewRecruiter(prev => ({ ...prev, phone: e.target.value }))}
                                        placeholder="+1 555-..."
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-brand-primary dark:text-white rounded-2xl outline-none transition-all font-bold"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Notes</label>
                                <textarea
                                    value={newRecruiter.notes || ''}
                                    onChange={(e) => setNewRecruiter(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Great energy, focused on backend roles in Fintech..."
                                    rows={3}
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-brand-primary dark:text-white rounded-2xl outline-none transition-all font-medium resize-none"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 px-6 rounded-2xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                            <button
                                onClick={handleAddRecruiter}
                                className="flex-1 py-4 px-6 rounded-2xl bg-brand-primary text-white font-bold shadow-lg shadow-brand-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Check size={20} />
                                {editingRecruiter ? 'Save Changes' : 'Create Contact'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterCRM;
