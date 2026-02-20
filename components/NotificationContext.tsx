
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Job, JobStatus, AppNotification, NotificationType, ViewState, AppSettings } from '../types';

interface NotificationContextType {
    notifications: AppNotification[];
    unreadCount: number;
    addNotification: (type: NotificationType, title: string, message: string, jobId?: string, actionView?: ViewState) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    addNotification: () => { },
    markAsRead: () => { },
    markAllAsRead: () => { },
    clearAll: () => { },
});

export const useNotifications = () => useContext(NotificationContext);

const STORAGE_KEY = 'jobflow_notifications';
const SEEN_KEY = 'jobflow_notif_seen'; // tracks which auto-generated alerts have been shown

export const NotificationProvider: React.FC<{
    children: React.ReactNode;
    jobs: Job[];
    settings: AppSettings;
}> = ({ children, jobs, settings }) => {
    const [notifications, setNotifications] = useState<AppNotification[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    const seenRef = useRef<Set<string>>(() => {
        try {
            const saved = localStorage.getItem(SEEN_KEY);
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch { return new Set(); }
    });

    // Persist notifications
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    }, [notifications]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const addNotification = useCallback((
        type: NotificationType,
        title: string,
        message: string,
        jobId?: string,
        actionView?: ViewState
    ) => {
        const notif: AppNotification = {
            id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
            type,
            title,
            message,
            timestamp: Date.now(),
            read: false,
            jobId,
            actionView,
        };
        setNotifications(prev => [notif, ...prev].slice(0, 50)); // cap at 50
    }, []);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    // --- Auto-scan jobs for notifications ---
    useEffect(() => {
        const scan = () => {
            const now = Date.now();
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStr = today.toISOString().slice(0, 10);

            // Initialize seen set from ref
            let seen: Set<string>;
            if (seenRef.current instanceof Set) {
                seen = seenRef.current;
            } else {
                // seenRef.current is the initializer function on first call
                seen = (seenRef.current as any)();
                seenRef.current = seen;
            }

            jobs.forEach(job => {
                // 1. Interview reminders (within next 24 hours)
                if (job.status === JobStatus.INTERVIEW && job.interviewDate) {
                    const interviewTime = new Date(job.interviewDate).getTime();
                    const diff = interviewTime - now;
                    const hoursAway = diff / (1000 * 60 * 60);

                    // Within 24h but not passed
                    if (hoursAway > 0 && hoursAway <= 24) {
                        const key = `interview_${job.id}_${job.interviewDate}`;
                        if (!seen.has(key)) {
                            seen.add(key);
                            const timeLabel = hoursAway < 1
                                ? `${Math.round(hoursAway * 60)} minutes`
                                : `${Math.round(hoursAway)} hour${Math.round(hoursAway) !== 1 ? 's' : ''}`;
                            addNotification(
                                'interview_reminder',
                                `Interview at ${job.company}`,
                                `Your interview for ${job.role} is in ${timeLabel}.`,
                                job.id,
                                ViewState.JOBS
                            );

                            // Also fire browser notification if permitted
                            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                                new Notification(`Interview Reminder: ${job.company}`, {
                                    body: `Your interview for ${job.role} is in ${timeLabel}.`,
                                    icon: '/favicon.ico'
                                });
                            }
                        }
                    }
                }

                // 2. Follow-up due today
                if (job.followUpDate && job.status === JobStatus.APPLIED) {
                    const followDate = new Date(job.followUpDate);
                    followDate.setHours(0, 0, 0, 0);
                    const diffDays = Math.floor((followDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                    if (diffDays === 0) {
                        const key = `followup_due_${job.id}_${todayStr}`;
                        if (!seen.has(key)) {
                            seen.add(key);
                            addNotification(
                                'followup_due',
                                `Follow-up due: ${job.company}`,
                                `Today's the day to follow up on your ${job.role} application.`,
                                job.id,
                                ViewState.JOBS
                            );
                        }
                    } else if (diffDays < 0) {
                        const key = `followup_overdue_${job.id}_${todayStr}`;
                        if (!seen.has(key)) {
                            seen.add(key);
                            addNotification(
                                'followup_overdue',
                                `Overdue follow-up: ${job.company}`,
                                `Your follow-up for ${job.role} is ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} overdue.`,
                                job.id,
                                ViewState.JOBS
                            );
                        }
                    }
                }
            });

            // Persist seen keys
            localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
        };

        // Run immediately on mount
        scan();

        // Then every 60 seconds
        const interval = setInterval(scan, 60000);
        return () => clearInterval(interval);
    }, [jobs, settings, addNotification]);

    // Request browser notification permission on mount
    useEffect(() => {
        if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationProvider;
