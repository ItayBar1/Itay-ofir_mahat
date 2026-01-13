import React, { useState } from 'react';
import { supabase } from '@/services/supabaseClient';
import { Mail, Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { logger } from '@/services/logger';

interface ForgotPasswordProps {
    onBackToLogin: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [email, setEmail] = useState('');

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setMessage('אם קיים משתמש עם כתובת המייל הזו, נשלח קישור לאיפוס סיסמה.');
        } catch (err: any) {
            logger.error('Reset password error:', err);
            // Always show generic success message
            setMessage('אם קיים משתמש עם כתובת המייל הזו, נשלח קישור לאיפוס סיסמה.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">איפוס סיסמה</h2>
                <p className="text-sm text-slate-600">הזן את הדוא"ל שלך ונשלח לך קישור לאיפוס</p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
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

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-start gap-2">
                        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {message && (
                    <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100">
                        {message}
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
                        'שחזר סיסמה'
                    )}
                </button>

                <button
                    type="button"
                    onClick={onBackToLogin}
                    className="w-full text-slate-500 text-sm py-2 hover:text-slate-700 flex items-center justify-center gap-1"
                >
                    <ArrowLeft size={14} />
                    חזרה להתחברות
                </button>
            </form>
        </div>
    );
};
