
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => { } });

export const useToast = () => useContext(ToastContext);

const ICONS = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
};

const COLORS = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    info: 'bg-brand-primary',
};

const ToastItem: React.FC<{ toast: ToastItem; onRemove: (id: number) => void }> = ({ toast, onRemove }) => {
    const Icon = ICONS[toast.type];

    React.useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), 3500);
        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    return (
        <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold text-white ${COLORS[toast.type]} animate-slide-in`}>
            <Icon size={18} className="flex-shrink-0" />
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => onRemove(toast.id)} className="text-white/60 hover:text-white transition-colors flex-shrink-0">
                <X size={14} />
            </button>
        </div>
    );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-2 pointer-events-auto max-w-sm w-full px-4">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>
            <style>{`
        @keyframes slide-in-toast {
          0% { transform: translateY(-16px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in-toast 0.3s ease-out; }
      `}</style>
        </ToastContext.Provider>
    );
};

export default ToastProvider;
