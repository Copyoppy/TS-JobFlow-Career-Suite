
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, CalendarClock, AlertCircle, Trophy, Info, Clock } from 'lucide-react';
import { useNotifications } from './NotificationContext';
import { AppNotification, ViewState } from '../types';

interface NotificationBellProps {
    onNavigate?: (view: ViewState) => void;
}

const getIcon = (type: AppNotification['type']) => {
    switch (type) {
        case 'interview_reminder': return <CalendarClock size={16} className="text-purple-500" />;
        case 'followup_due': return <Clock size={16} className="text-amber-500" />;
        case 'followup_overdue': return <AlertCircle size={16} className="text-rose-500" />;
        case 'status_change': return <Trophy size={16} className="text-brand-primary" />;
        case 'info': return <Info size={16} className="text-blue-500" />;
    }
};

const getTimeAgo = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
};

const NotificationBell: React.FC<NotificationBellProps> = ({ onNavigate }) => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Close panel on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    const handleNotificationClick = (notif: AppNotification) => {
        markAsRead(notif.id);
        if (notif.actionView && onNavigate) {
            onNavigate(notif.actionView);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 hover:text-brand-primary"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse ring-2 ring-white dark:ring-slate-950">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-brand-mint dark:border-slate-800 rounded-2xl shadow-2xl z-[200] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="p-4 border-b border-brand-mint dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm">Notifications</h3>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-brand-primary hover:text-brand-deep font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-brand-mint/30 transition"
                                    title="Mark all as read"
                                >
                                    <CheckCheck size={14} />
                                    Read all
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={() => { clearAll(); setIsOpen(false); }}
                                    className="text-xs text-slate-400 hover:text-rose-500 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition"
                                    title="Clear all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="text-3xl mb-2">🎉</div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">You're all caught up!</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">No new notifications</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <button
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`w-full text-left p-4 flex items-start gap-3 border-b border-slate-50 dark:border-slate-800/50 hover:bg-brand-rose/50 dark:hover:bg-slate-800/50 transition-colors ${!notif.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                                        }`}
                                >
                                    <div className="mt-0.5 flex-shrink-0">
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-sm leading-tight ${!notif.read ? 'font-bold text-slate-800 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-300'}`}>
                                                {notif.title}
                                            </p>
                                            {!notif.read && (
                                                <div className="w-2 h-2 bg-brand-primary rounded-full flex-shrink-0 mt-1.5" />
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{getTimeAgo(notif.timestamp)}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
