import React, { useState, useMemo } from 'react';
import { NetworkingContact, ViewState } from '../types';
import {
    Users, Plus, Search, Filter, MoreHorizontal, Calendar,
    Linkedin, MessageSquare, Star, ArrowUpRight, Clock, Trash2,
    Edit3, Sparkles, Send, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useToast } from './Toast';

interface NetworkingTrackerProps {
    contacts: NetworkingContact[];
    setContacts: React.Dispatch<React.SetStateAction<NetworkingContact[]>>;
}

const NetworkingTracker: React.FC<NetworkingTrackerProps> = ({ contacts, setContacts }) => {
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('All');
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeContactId, setActiveContactId] = useState<string | null>(null);

    const filteredContacts = useMemo(() => {
        return contacts.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.company.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filterType === 'All' || c.relationship === filterType;
            return matchesSearch && matchesFilter;
        });
    }, [contacts, searchQuery, filterType]);

    const togglePriority = (id: string) => {
        setContacts(prev => prev.map(c => c.id === id ? { ...c, isPriority: !c.isPriority } : c));
    };

    const deleteContact = (id: string) => {
        if (window.confirm("Are you sure you want to remove this contact?")) {
            setContacts(prev => prev.filter(c => c.id !== id));
            showToast("Contact removed.", "info");
        }
    };

    const activeContact = useMemo(() => contacts.find(c => c.id === activeContactId), [contacts, activeContactId]);

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-brand-mint dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex justify-between items-center max-w-6xl mx-auto w-full">
                    <div>
                        <h1 className="text-2xl font-black text-brand-deep dark:text-white flex items-center gap-3 uppercase tracking-widest">
                            <Users className="text-brand-primary" /> Networking & Referral Tracker
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Manage your professional network and track follow-ups.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-brand-primary text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-deep transition-all flex items-center gap-2 shadow-xl shadow-brand-primary/20"
                    >
                        <Plus size={20} /> Add Contact
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Contact List Pane */}
                <div className="w-1/3 border-r border-brand-mint dark:border-slate-800 flex flex-col bg-slate-50/30 dark:bg-slate-950/20">
                    <div className="p-6 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-3 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search name or company..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-brand-mint dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {['All', 'Mentor', 'Peer', 'Recruiter', 'Internal Referral'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilterType(f)}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${filterType === f ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white dark:bg-slate-800 border-brand-mint dark:border-slate-700 text-slate-500'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {filteredContacts.map(contact => (
                            <button
                                key={contact.id}
                                onClick={() => setActiveContactId(contact.id)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all group ${activeContactId === contact.id
                                        ? 'bg-brand-primary/10 border-brand-primary shadow-md'
                                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-brand-primary/30 shadow-sm'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${contact.isPriority ? 'bg-amber-400 animate-pulse' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                        <h4 className="font-bold text-slate-800 dark:text-white truncate">{contact.name}</h4>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400">{contact.lastContactDate}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">{contact.company}</span>
                                    <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded uppercase">{contact.relationship}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Detailed Pane */}
                <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 custom-scrollbar">
                    {activeContact ? (
                        <div className="p-12 space-y-10 max-w-3xl">
                            {/* Profile Header */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-brand-rose dark:bg-slate-800 rounded-3xl flex items-center justify-center text-3xl text-brand-primary font-black border-2 border-brand-mint dark:border-slate-700">
                                        {activeContact.name[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white">{activeContact.name}</h2>
                                        <p className="text-brand-primary font-bold">{activeContact.role} @ {activeContact.company}</p>
                                        <div className="flex items-center gap-4 mt-3">
                                            <a href={activeContact.linkedinUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors"><Linkedin size={20} /></a>
                                            <button onClick={() => togglePriority(activeContact.id)} className={`${activeContact.isPriority ? 'text-amber-400' : 'text-slate-300'} hover:text-amber-500 transition-colors`}><Star size={20} fill={activeContact.isPriority ? 'currentColor' : 'none'} /></button>
                                            <button onClick={() => deleteContact(activeContact.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={20} /></button>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest ${activeContact.referralStatus === 'Provided' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                        Referral: {activeContact.referralStatus}
                                    </span>
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl">
                                    <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">
                                        <Clock size={14} /> Last Contact
                                    </div>
                                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{activeContact.lastContactDate}</p>
                                </div>
                                <div className="bg-brand-rose/10 dark:bg-slate-800/50 border border-brand-mint dark:border-slate-700 p-6 rounded-3xl group relative overflow-hidden">
                                    <div className="flex items-center gap-3 text-brand-primary text-[10px] font-black uppercase tracking-widest mb-2">
                                        <Calendar size={14} /> Next Follow-up
                                    </div>
                                    <p className="text-lg font-bold text-brand-deep dark:text-white">{activeContact.nextFollowUpDate || 'Set Reminder'}</p>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Discussion Notes</h3>
                                    <button className="text-xs text-brand-primary font-bold flex items-center gap-1 hover:underline"><Edit3 size={14} /> Edit</button>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                    "{activeContact.notes || 'No notes yet. Add some context about your relationship or last talk.'}"
                                </div>
                            </div>

                            {/* AI Outreach Assistant */}
                            <div className="bg-brand-deep dark:bg-blue-900 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                    <Send size={80} />
                                </div>
                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <Sparkles className="text-brand-mint" />
                                        <h3 className="text-xl font-black uppercase tracking-widest">Ntim's Outreach Assistant</h3>
                                    </div>
                                    <p className="text-sm text-blue-100 leading-relaxed bg-white/10 p-6 rounded-3xl border border-white/10 italic">
                                        "Hi {activeContact.name.split(' ')[0]}, it's been a few weeks since we chatted about {activeContact.role} roles @ {activeContact.company}. I'd love to circle back and see how things are progressing on your end. Are you free for a quick 10-minute sync this Friday?"
                                    </p>
                                    <div className="flex gap-4">
                                        <button className="bg-brand-mint text-brand-deep px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-black/20">
                                            Copy Message
                                        </button>
                                        <button className="bg-white/10 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/20">
                                            Regenerate
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-20 text-center">
                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8 border border-slate-200 dark:border-slate-700 opacity-50">
                                <Users size={40} className="text-slate-400" />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest mb-4">Select a Connection</h2>
                            <p className="text-slate-500 max-w-sm text-sm font-medium leading-relaxed">
                                Click on a contact from the list to view your interaction history, referrals, and AI-suggested follow-ups.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NetworkingTracker;
