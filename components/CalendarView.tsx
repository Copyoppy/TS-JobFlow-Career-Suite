import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, MapPin, ExternalLink, Briefcase } from 'lucide-react';
import { Job, ViewState } from '../types';

interface CalendarViewProps {
    jobs: Job[];
    onNavigateToJob: (job: Job) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ jobs, onNavigateToJob }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    // Map jobs to dates (interviews and follow-ups)
    const eventsByDate: Record<string, { type: 'interview' | 'followup', job: Job }[]> = {};

    jobs.forEach(job => {
        if (job.interviewDate) {
            const date = job.interviewDate.split('T')[0];
            if (!eventsByDate[date]) eventsByDate[date] = [];
            eventsByDate[date].push({ type: 'interview', job });
        }
        if (job.followUpDate) {
            const date = job.followUpDate;
            if (!eventsByDate[date]) eventsByDate[date] = [];
            eventsByDate[date].push({ type: 'followup', job });
        }
    });

    const days = [];
    // Fill prefix
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-32 border-b border-r border-slate-100 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-900/5"></div>);
    }

    // Fill days
    for (let d = 1; d <= totalDays; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayEvents = eventsByDate[dateStr] || [];
        const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

        days.push(
            <div key={d} className={`h-32 border-b border-r border-slate-100 dark:border-slate-800 p-2 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20 ${isToday ? 'bg-brand-rose/30 dark:bg-brand-primary/10' : ''}`}>
                <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-bold w-7 h-7 flex items-center justify-center rounded-xl ${isToday ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30' : 'text-slate-400 dark:text-slate-500'}`}>{d}</span>
                    {dayEvents.length > 0 && <span className="w-2 h-2 rounded-full bg-brand-primary"></span>}
                </div>
                <div className="space-y-1.5 overflow-y-auto max-h-[85px] custom-scrollbar pr-1">
                    {dayEvents.map((event, idx) => (
                        <button
                            key={`${event.job.id}-${event.type}-${idx}`}
                            onClick={() => onNavigateToJob(event.job)}
                            className={`w-full text-left p-1.5 rounded-lg border-l-2 transition-all hover:scale-[1.02] shadow-sm ${event.type === 'interview'
                                    ? 'bg-brand-primary/10 dark:bg-brand-primary/20 border-brand-primary'
                                    : 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500'
                                }`}
                        >
                            <div className={`text-[10px] font-bold truncate ${event.type === 'interview' ? 'text-brand-deep dark:text-brand-primary' : 'text-amber-700 dark:text-amber-400'}`}>
                                {event.type === 'interview' ? '🎤 Interview' : '📅 Follow-up'}
                            </div>
                            <div className="text-[10px] font-semibold text-slate-700 dark:text-slate-200 truncate">{event.job.role}</div>
                            <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">{event.job.company}</div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Pad remaining days to complete the grid (up to 42 cells)
    const remainingCells = 42 - days.length;
    for (let i = 0; i < remainingCells; i++) {
        days.push(<div key={`empty-end-${i}`} className="h-32 border-b border-r border-slate-100 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-900/5"></div>);
    }

    return (
        <div className="p-8 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-brand-deep dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-brand-primary rounded-2xl shadow-lg shadow-brand-primary/20">
                            <CalIcon className="text-white" size={28} />
                        </div>
                        Interview Calendar
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Visualizing your path to success, one day at a time.</p>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-brand-mint dark:border-slate-800 shadow-sm">
                    <button onClick={prevMonth} className="p-2.5 hover:bg-brand-rose dark:hover:bg-slate-800 rounded-xl transition-all text-slate-600 dark:text-slate-300 active:scale-95"><ChevronLeft size={20} /></button>
                    <div className="px-4 py-2 font-bold text-slate-800 dark:text-white min-w-[140px] text-center text-lg">{monthName} <span className="text-brand-primary">{year}</span></div>
                    <button onClick={nextMonth} className="p-2.5 hover:bg-brand-rose dark:hover:bg-slate-800 rounded-xl transition-all text-slate-600 dark:text-slate-300 active:scale-95"><ChevronRight size={20} /></button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-brand-mint dark:border-slate-800 shadow-2xl shadow-brand-primary/5 overflow-hidden">
                <div className="grid grid-cols-7 border-b border-brand-mint dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                        <div key={day} className="py-5 text-center text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 border-l border-brand-mint dark:border-slate-800">
                    {days}
                </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-8 bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-brand-mint/50 dark:border-slate-800/50">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-brand-primary shadow-sm shadow-brand-primary/30"></div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Interviews</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/30"></div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Follow-ups</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-brand-rose border border-slate-200 dark:bg-brand-primary/10 dark:border-brand-primary/30"></div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Current Day</span>
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
