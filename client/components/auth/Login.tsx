import React, { useState } from 'react';
import { supabase } from '@/services/supabaseClient';
import { Mail, Lock, Loader2, AlertTriangle, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface LoginProps {
    onRegisterClick: () => void;
    onForgotClick: () => void;
}

export const Login: React.FC<LoginProps> = ({ onRegisterClick, onForgotClick }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'שגיאה בכניסה למערכת');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-center mb-8 bg-slate-100 p-1 rounded-lg">
                <button
                    className="flex-1 py-2 text-sm font-medium rounded-md transition-all bg-white text-indigo-600 shadow-sm"
                >
                    התחברות
                </button>
                <button
                    onClick={onRegisterClick}
                    className="flex-1 py-2 text-sm font-medium rounded-md transition-all text-slate-500 hover:text-slate-700"
                >
                    הרשמה
                </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                    <label htmlFor="email-input" className="text-sm font-medium text-slate-700">דואר אלקטרוני</label>
                    <div className="relative">
                        <Mail className="absolute right-3 top-3 text-slate-400" size={18} />
                        <input
                            id="email-input"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            placeholder="name@example.com"
                            dir="ltr"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <label htmlFor="password-input" className="text-sm font-medium text-slate-700">סיסמה</label>
                        <button
                            type="button"
                            onClick={onForgotClick}
                            className="text-xs text-indigo-600 hover:text-indigo-800"
                        >
                            שכחת סיסמה?
                        </button>
                    </div>
                    <div className="relative">
                        <Lock className="absolute right-3 top-3 text-slate-400" size={18} />
                        <input
                            id="password-input"
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            dir="rtl"
                            minLength={6}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                            aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-start gap-2">
                        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <>
                            כניסה למערכת
                            <ArrowRight size={18} className="rotate-180" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};
