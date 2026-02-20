import React from 'react';

// --- ATSGauge ---

export const ATSGauge = ({ score }: { score: number }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = (score: number) => {
        if (score >= 80) return '#10b981'; // Emerald 500
        if (score >= 65) return '#3b82f6'; // Blue 500
        if (score >= 40) return '#f59e0b'; // Amber 500
        return '#ef4444'; // Red 500
    };

    const getLabel = (score: number) => {
        if (score >= 80) return 'Excellent Match';
        if (score >= 65) return 'Strong Match';
        if (score >= 40) return 'Fair Match';
        return 'Weak Match';
    };

    return (
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
            <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-slate-100 dark:text-slate-800"
                    />
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        stroke={getColor(score)}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        fill="none"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-800 dark:text-white">{score}%</span>
                </div>
            </div>
            <span className="mt-3 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-current" style={{ color: getColor(score), backgroundColor: `${getColor(score)}10` }}>
                {getLabel(score)}
            </span>
        </div>
    );
};

// --- parseBold ---

export const parseBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-slate-900 dark:text-slate-100">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

// --- FormattedDisplay ---

export const FormattedDisplay = ({ text }: { text: string | undefined }) => {
    if (!text) return <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">No content generated yet. Click generate to start.</div>;

    const lines = text.split('\n');
    return (
        <div className="space-y-1">
            {lines.map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={i} className="h-3" />;

                if ((trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 80) || trimmed.startsWith('##')) {
                    const content = trimmed.replace(/\*\*/g, '').replace(/^#+\s/, '');
                    return <h3 key={i} className="text-brand-deep dark:text-blue-300 font-bold text-sm mt-4 mb-2">{content}</h3>;
                }

                if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                    return (
                        <div key={i} className="flex items-start gap-2 pl-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 flex-shrink-0" />
                            <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{parseBold(trimmed.replace(/^[\*\-\•]\s/, ''))}</span>
                        </div>
                    );
                }

                if (/^\d+\./.test(trimmed)) {
                    const number = trimmed.match(/^\d+\./)?.[0];
                    const content = trimmed.replace(/^\d+\.\s/, '');
                    return (
                        <div key={i} className="flex items-start gap-2 pl-2 mb-2">
                            <span className="font-bold text-brand-primary text-sm min-w-[20px] mt-0.5">{number}</span>
                            <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{parseBold(content)}</span>
                        </div>
                    );
                }

                return <p key={i} className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-1">{parseBold(line)}</p>;
            })}
        </div>
    );
};
