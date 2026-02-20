import React, { useState, useEffect, useCallback } from 'react';

const CURRENCIES = [
    { code: 'USD', symbol: '$', label: 'US Dollar' },
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'GBP', symbol: '£', label: 'British Pound' },
    { code: 'GHS', symbol: 'GH₵', label: 'Ghana Cedis' },
    { code: 'NGN', symbol: '₦', label: 'Nigerian Naira' },
    { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
    { code: 'CHF', symbol: 'CHF', label: 'Swiss Franc' },
    { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
];

interface SalaryPickerProps {
    value?: string;
    onChange: (salary: string) => void;
}

const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
};

const parseInputToNumber = (raw: string): number => {
    const cleaned = raw.replace(/[^0-9]/g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
};

const SalaryPicker: React.FC<SalaryPickerProps> = ({ value, onChange }) => {
    const [currency, setCurrency] = useState('USD');
    const [minRaw, setMinRaw] = useState('');
    const [maxRaw, setMaxRaw] = useState('');
    const [negotiable, setNegotiable] = useState(false);

    // Build formatted salary string from local state
    const buildSalaryString = useCallback((cur: string, min: string, max: string, neg: boolean): string => {
        const sym = CURRENCIES.find(c => c.code === cur)?.symbol || '$';
        const minNum = parseInputToNumber(min);
        const maxNum = parseInputToNumber(max);

        let result = '';
        if (minNum > 0 && maxNum > 0 && maxNum > minNum) {
            result = `${sym}${formatNumber(minNum)} – ${sym}${formatNumber(maxNum)}`;
        } else if (minNum > 0) {
            result = `${sym}${formatNumber(minNum)}`;
        } else if (maxNum > 0) {
            result = `Up to ${sym}${formatNumber(maxNum)}`;
        }

        if (neg) {
            result = result ? `${result} (Negotiable)` : 'Negotiable';
        }

        return result;
    }, []);

    // Emit changes upstream
    useEffect(() => {
        const formatted = buildSalaryString(currency, minRaw, maxRaw, negotiable);
        onChange(formatted);
    }, [currency, minRaw, maxRaw, negotiable, buildSalaryString, onChange]);

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        setMinRaw(raw);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        setMaxRaw(raw);
    };

    const sym = CURRENCIES.find(c => c.code === currency)?.symbol || '$';

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                {/* Currency Selector */}
                <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="p-2.5 border border-brand-mint dark:border-slate-700 rounded-lg text-sm outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium w-[90px] flex-shrink-0"
                >
                    {CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                    ))}
                </select>

                {/* Min Input */}
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm pointer-events-none">{sym}</span>
                    <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Min"
                        value={minRaw ? formatNumber(parseInt(minRaw, 10)) : ''}
                        onChange={handleMinChange}
                        className="w-full pl-8 pr-3 p-2.5 border border-brand-mint dark:border-slate-700 rounded-lg text-sm outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                    />
                </div>

                <span className="text-slate-400 dark:text-slate-500 text-sm font-medium flex-shrink-0">—</span>

                {/* Max Input */}
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm pointer-events-none">{sym}</span>
                    <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Max"
                        value={maxRaw ? formatNumber(parseInt(maxRaw, 10)) : ''}
                        onChange={handleMaxChange}
                        className="w-full pl-8 pr-3 p-2.5 border border-brand-mint dark:border-slate-700 rounded-lg text-sm outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                    />
                </div>
            </div>

            {/* Negotiable Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none group">
                <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${negotiable
                            ? 'bg-brand-primary border-brand-primary'
                            : 'border-slate-300 dark:border-slate-600 group-hover:border-brand-primary/50'
                        }`}
                    onClick={() => setNegotiable(!negotiable)}
                >
                    {negotiable && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>
                <input
                    type="checkbox"
                    checked={negotiable}
                    onChange={(e) => setNegotiable(e.target.checked)}
                    className="hidden"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Negotiable</span>
            </label>
        </div>
    );
};

export default SalaryPicker;
