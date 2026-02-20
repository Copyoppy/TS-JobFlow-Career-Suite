
import React, { useState, useRef } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ChevronRight, ArrowLeft, CheckCircle, AlertCircle, Camera } from 'lucide-react';

interface AuthScreenProps {
    onComplete: (userName: string) => void;
}

type AuthMode = 'login' | 'register' | 'reset';

interface StoredUser {
    fullName: string;
    email: string;
    password: string;
    profilePhoto?: string;
}

const Logo = () => (
    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="4" fill="white" />
            <path d="M7 6H13M10 6V18" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 12C14 12 15 11 17 11C19 11 19 13 18 14C17 15 15 15 15 16C15 17 17 17 18.5 17" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);

const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
    React.useEffect(() => {
        const timer = setTimeout(onClose, 3500);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold transition-all animate-bounce-in ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}>
            {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {message}
        </div>
    );
};

const AuthScreen: React.FC<AuthScreenProps> = ({ onComplete }) => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Form fields
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [profilePhoto, setProfilePhoto] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [resetStep, setResetStep] = useState<'email' | 'newpass'>('email');
    const photoInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            setToast({ message: 'Image must be under 2MB', type: 'error' });
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            setProfilePhoto(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (mode === 'register') {
            if (!fullName.trim()) newErrors.fullName = 'Full name is required';
            if (!email.trim()) newErrors.email = 'Email is required';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
            if (!password) newErrors.password = 'Password is required';
            else if (password.length < 6) newErrors.password = 'Must be at least 6 characters';
            if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        } else if (mode === 'login') {
            if (!email.trim()) newErrors.email = 'Email is required';
            if (!password) newErrors.password = 'Password is required';
        } else if (mode === 'reset') {
            if (resetStep === 'email') {
                if (!email.trim()) newErrors.email = 'Email is required';
            } else {
                if (!newPassword) newErrors.newPassword = 'New password is required';
                else if (newPassword.length < 6) newErrors.newPassword = 'Must be at least 6 characters';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const clearForm = () => {
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setNewPassword('');
        setProfilePhoto('');
        setErrors({});
        setShowPassword(false);
        setShowConfirmPassword(false);
        setResetStep('email');
    };

    const handleRegister = async () => {
        if (!validate()) return;
        setIsLoading(true);

        // Simulate network delay
        await new Promise(r => setTimeout(r, 800));

        const existingUser = localStorage.getItem('jobflow_user');
        if (existingUser) {
            const parsed: StoredUser = JSON.parse(existingUser);
            if (parsed.email === email.toLowerCase().trim()) {
                setErrors({ email: 'An account with this email already exists' });
                setIsLoading(false);
                return;
            }
        }

        const user: StoredUser = {
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            password: password,
            profilePhoto: profilePhoto || undefined
        };
        localStorage.setItem('jobflow_user', JSON.stringify(user));

        setToast({ message: 'Account created successfully!', type: 'success' });
        setIsLoading(false);

        setTimeout(() => {
            clearForm();
            setMode('login');
        }, 1000);
    };

    const handleLogin = async () => {
        if (!validate()) return;
        setIsLoading(true);

        await new Promise(r => setTimeout(r, 600));

        const existingUser = localStorage.getItem('jobflow_user');
        if (!existingUser) {
            setErrors({ email: 'No account found. Please register first.' });
            setIsLoading(false);
            return;
        }

        const parsed: StoredUser = JSON.parse(existingUser);
        if (parsed.email !== email.toLowerCase().trim()) {
            setErrors({ email: 'No account found with this email' });
            setIsLoading(false);
            return;
        }
        if (parsed.password !== password) {
            setErrors({ password: 'Incorrect password' });
            setIsLoading(false);
            return;
        }

        localStorage.setItem('jobflow_authenticated', 'true');
        setToast({ message: `Welcome back, ${parsed.fullName}!`, type: 'success' });
        setIsLoading(false);

        setTimeout(() => {
            onComplete(parsed.fullName);
        }, 800);
    };

    const handleReset = async () => {
        if (!validate()) return;
        setIsLoading(true);

        await new Promise(r => setTimeout(r, 600));

        if (resetStep === 'email') {
            const existingUser = localStorage.getItem('jobflow_user');
            if (!existingUser) {
                setErrors({ email: 'No account found with this email' });
                setIsLoading(false);
                return;
            }
            const parsed: StoredUser = JSON.parse(existingUser);
            if (parsed.email !== email.toLowerCase().trim()) {
                setErrors({ email: 'No account found with this email' });
                setIsLoading(false);
                return;
            }
            setResetStep('newpass');
            setIsLoading(false);
            setToast({ message: 'Email verified! Set your new password.', type: 'success' });
        } else {
            const existingUser = localStorage.getItem('jobflow_user');
            if (existingUser) {
                const parsed: StoredUser = JSON.parse(existingUser);
                parsed.password = newPassword;
                localStorage.setItem('jobflow_user', JSON.stringify(parsed));
            }
            setToast({ message: 'Password reset successfully!', type: 'success' });
            setIsLoading(false);
            setTimeout(() => {
                clearForm();
                setMode('login');
            }, 1000);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'register') handleRegister();
        else if (mode === 'login') handleLogin();
        else handleReset();
    };

    const switchMode = (newMode: AuthMode) => {
        clearForm();
        setMode(newMode);
    };

    const titles = {
        login: { heading: 'Welcome back.', sub: 'Sign in to continue your job search journey.' },
        register: { heading: 'Join the quest.', sub: 'Create your account to get started.' },
        reset: { heading: 'Reset password.', sub: resetStep === 'email' ? 'Enter your email to reset your password.' : 'Choose a new password for your account.' }
    };

    return (
        <div className="fixed inset-0 bg-slate-50 flex items-center justify-center z-[100] p-4 font-sans overflow-hidden">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="bg-white w-full max-w-md max-h-[95vh] sm:max-h-[90vh] rounded-3xl sm:rounded-[48px] shadow-2xl relative flex flex-col overflow-hidden border border-slate-100">

                {/* Top Logo */}
                <div className="p-5 sm:p-8 pb-0 z-20">
                    <Logo />
                </div>

                {/* Slanted Visual Elements */}
                <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="absolute top-[8%] -right-1/4 w-[150%] h-20 sm:h-24 bg-brand-primary opacity-90 transform -rotate-[12deg] skew-x-[-10deg] transition-all duration-700 ease-in-out" />
                    <div className="absolute top-[18%] -left-1/4 w-[150%] h-16 sm:h-20 bg-brand-secondary opacity-30 transform -rotate-[12deg] skew-x-[-10deg] transition-all duration-700 ease-in-out delay-100" />
                </div>

                {/* Content Area */}
                <div className="flex-1 min-h-0 flex flex-col relative z-10 overflow-y-auto">

                    {/* Header */}
                    <div className="px-5 sm:px-10 pt-8 sm:pt-12">
                        {mode === 'reset' && (
                            <button
                                onClick={() => switchMode('login')}
                                className="flex items-center gap-1 text-slate-400 hover:text-brand-primary text-sm font-medium mb-3 transition-colors"
                            >
                                <ArrowLeft size={16} />
                                Back to Sign In
                            </button>
                        )}
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
                            {titles[mode].heading}
                        </h2>
                        <p className="text-slate-400 text-sm sm:text-base mt-1">
                            {titles[mode].sub}
                        </p>
                    </div>

                    {/* Tab Switcher (login/register only) */}
                    {mode !== 'reset' && (
                        <div className="flex mx-5 sm:mx-10 mt-5 bg-slate-100 rounded-2xl p-1">
                            <button
                                onClick={() => switchMode('login')}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === 'login'
                                    ? 'bg-white text-brand-primary shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => switchMode('register')}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === 'register'
                                    ? 'bg-white text-brand-primary shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                Sign Up
                            </button>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-5 sm:px-10 pt-5 pb-6 sm:pb-8 flex flex-col gap-3">

                        {/* Profile Photo + Full Name (register only) */}
                        {mode === 'register' && (
                            <>
                                {/* Photo Upload */}
                                <div className="flex flex-col items-center mb-2">
                                    <input
                                        ref={photoInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => photoInputRef.current?.click()}
                                        className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 hover:border-brand-primary flex items-center justify-center overflow-hidden transition-all group relative"
                                    >
                                        {profilePhoto ? (
                                            <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera size={24} className="text-slate-400 group-hover:text-brand-primary transition-colors" />
                                        )}
                                        {profilePhoto && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <Camera size={18} className="text-white" />
                                            </div>
                                        )}
                                    </button>
                                    <span className="text-xs text-slate-400 mt-1.5">Upload photo</span>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Full Name</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Kingsford Johnson"
                                            className={`w-full pl-11 pr-4 py-3 rounded-xl border ${errors.fullName ? 'border-red-300 bg-red-50/50' : 'border-slate-200'} text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all`}
                                        />
                                    </div>
                                    {errors.fullName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.fullName}</p>}
                                </div>
                            </>
                        )}

                        {/* Email */}
                        {(mode !== 'reset' || resetStep === 'email') && (
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Email</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className={`w-full pl-11 pr-4 py-3 rounded-xl border ${errors.email ? 'border-red-300 bg-red-50/50' : 'border-slate-200'} text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all`}
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                            </div>
                        )}

                        {/* Password (login & register) */}
                        {mode !== 'reset' && (
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Password</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className={`w-full pl-11 pr-11 py-3 rounded-xl border ${errors.password ? 'border-red-300 bg-red-50/50' : 'border-slate-200'} text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
                            </div>
                        )}

                        {/* Confirm Password (register only) */}
                        {mode === 'register' && (
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Confirm Password</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className={`w-full pl-11 pr-11 py-3 rounded-xl border ${errors.confirmPassword ? 'border-red-300 bg-red-50/50' : 'border-slate-200'} text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</p>}
                            </div>
                        )}

                        {/* New Password (reset step 2) */}
                        {mode === 'reset' && resetStep === 'newpass' && (
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">New Password</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className={`w-full pl-11 pr-11 py-3 rounded-xl border ${errors.newPassword ? 'border-red-300 bg-red-50/50' : 'border-slate-200'} text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.newPassword && <p className="text-red-500 text-xs mt-1 ml-1">{errors.newPassword}</p>}
                            </div>
                        )}

                        {/* Forgot Password Link (login only) */}
                        {mode === 'login' && (
                            <div className="flex justify-end -mt-1">
                                <button
                                    type="button"
                                    onClick={() => switchMode('reset')}
                                    className="text-xs text-brand-primary hover:text-blue-700 font-semibold transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="mt-2 w-full flex items-center justify-center gap-2 bg-brand-primary text-white py-3.5 rounded-2xl font-bold text-base hover:shadow-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {mode === 'login' && 'Sign In'}
                                    {mode === 'register' && 'Create Account'}
                                    {mode === 'reset' && (resetStep === 'email' ? 'Verify Email' : 'Reset Password')}
                                    <ChevronRight size={20} />
                                </>
                            )}
                        </button>

                        {/* Bottom Links */}
                        {mode === 'login' && (
                            <p className="text-center text-sm text-slate-400 mt-2">
                                Don't have an account?{' '}
                                <button type="button" onClick={() => switchMode('register')} className="text-brand-primary font-bold hover:underline">
                                    Sign Up
                                </button>
                            </p>
                        )}
                        {mode === 'register' && (
                            <p className="text-center text-sm text-slate-400 mt-2">
                                Already have an account?{' '}
                                <button type="button" onClick={() => switchMode('login')} className="text-brand-primary font-bold hover:underline">
                                    Sign In
                                </button>
                            </p>
                        )}
                    </form>
                </div>

                {/* Dots / Progress indicator */}
                <div className="px-5 sm:px-10 pb-5 sm:pb-8 relative z-10 bg-white">
                    <div className="flex gap-2 justify-start">
                        {['login', 'register', 'reset'].map((m) => (
                            <div
                                key={m}
                                className={`h-1.5 transition-all duration-300 rounded-full ${m === mode ? 'w-8 bg-brand-primary' : 'w-2 bg-slate-200'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes bounce-in {
          0% { transform: translateX(-50%) translateY(-20px); opacity: 0; }
          50% { transform: translateX(-50%) translateY(4px); opacity: 1; }
          100% { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out;
        }
      `}</style>
        </div>
    );
};

export default AuthScreen;
