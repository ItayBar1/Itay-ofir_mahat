import React, { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';
import { Mail, Lock, User, Phone, Loader2, ArrowRight, Building, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { UserService, InvitationService } from '@/services/api';
import { logger } from '@/services/logger';

interface RegisterProps {
    onLoginClick: () => void;
    inviteToken?: string | null;
    initialInvitedRole?: string | null;
    initialInvitedStudio?: { name: string, id: string; serial_number?: string } | null;
}

export const Register: React.FC<RegisterProps> = ({
    onLoginClick,
    inviteToken,
    initialInvitedRole,
    initialInvitedStudio
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [studioSerial, setStudioSerial] = useState('');

    // Effect to pre-fill studio serial if invited
    useEffect(() => {
        if (initialInvitedStudio?.serial_number) {
            setStudioSerial(initialInvitedStudio.serial_number);
        }
    }, [initialInvitedStudio]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            // SECURITY FIX: Prepare registration server-side to validate studio_id
            try {
                const serialNumber = inviteToken ? undefined : studioSerial;
                const token = inviteToken || undefined;

                await UserService.prepareRegistration(email, serialNumber, token);
            } catch (prepError: any) {
                if (prepError.response && prepError.response.status === 404) {
                    throw new Error('לא נמצא סטודיו עם המספר הסידורי שהוזן.');
                }
                throw new Error(prepError.response?.data?.error || 'שגיאה באימות הסטודיו.');
            }

            // 1. Sign up as STUDENT (Secure Default)
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        phone_number: phone,
                        role: 'STUDENT',
                    },
                },
            });

            if (signUpError) throw signUpError;

            // 2. If there's an invite token, claim it to upgrade role
            if (inviteToken && authData.user) {
                try {
                    if (authData.session) {
                        await InvitationService.accept(inviteToken);
                        // REFRESH SESSION to get the new role (Admin/Instructor)
                        const { error: refreshError } = await supabase.auth.refreshSession();
                        if (refreshError) {
                            logger.error('Session refresh failed:', refreshError);
                        }
                        setMessage('ההרשמה הסתיימה בהצלחה! חשבונך שודרג בהתאם להזמנה.');
                    } else {
                        setMessage('ההרשמה בוצעה. נא לאמת את המייל. ההזמנה תופעל לאחר הכניסה הראשונה.');
                    }

                } catch (acceptError) {
                    logger.error('Failed to accept invite', acceptError);
                    setError('ההרשמה בוצעה אך הייתה שגיאה בקבלת ההזמנה. אנא פנה למנהל המערכת.');
                }
            } else {
                setMessage('נשלח מייל לאימות החשבון. יש לאשר את הכתובת לפני הכניסה.');
            }
        } catch (err: any) {
            setError(err.message || 'אירעה שגיאה בתהליך ההרשמה');
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        if (initialInvitedRole === 'ADMIN') return 'הרשמת מנהל סטודיו';
        if (initialInvitedRole === 'INSTRUCTOR') return 'הרשמת מדריך';
        return 'הרשמת תלמיד / הורה';
    };

    return (
        <div className="space-y-6">
            {!inviteToken && (
                <div className="flex justify-center mb-8 bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={onLoginClick}
                        className="flex-1 py-2 text-sm font-medium rounded-md transition-all text-slate-500 hover:text-slate-700"
                    >
                        התחברות
                    </button>
                    <button
                        className="flex-1 py-2 text-sm font-medium rounded-md transition-all bg-white text-indigo-600 shadow-sm"
                    >
                        הרשמה
                    </button>
                </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
                {/* Context Message for Invites */}
                {inviteToken && (
                    <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg mb-4 text-center">
                        <p className="text-sm text-indigo-800 font-medium">
                            {initialInvitedRole === 'INSTRUCTOR' ? 'הוזמנת להצטרף כצוות הוראה' : 'הוזמנת לנהל את הסטודיו'}
                        </p>
                        {initialInvitedStudio && <p className="text-xs text-indigo-600 mt-1">עבור: {initialInvitedStudio.name}</p>}
                    </div>
                )}

                <div className="space-y-1">
                    <label htmlFor="fullname-input" className="text-sm font-medium text-slate-700">שם מלא</label>
                    <div className="relative">
                        <User className="absolute right-3 top-3 text-slate-400" size={18} />
                        <input
                            id="fullname-input"
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            placeholder="ישראל ישראלי"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label htmlFor="phone-input" className="text-sm font-medium text-slate-700">טלפון</label>
                    <div className="relative">
                        <Phone className="absolute right-3 top-3 text-slate-400" size={18} />
                        <input
                            id="phone-input"
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            placeholder="050-0000000"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label htmlFor="studio-input" className="text-sm font-medium text-slate-700">מספר סטודיו</label>
                    <div className="relative">
                        <Building className="absolute right-3 top-3 text-slate-400" size={18} />
                        <input
                            id="studio-input"
                            type="text"
                            required
                            value={studioSerial}
                            onChange={(e) => setStudioSerial(e.target.value)}
                            readOnly={!!inviteToken} // Readonly if invited
                            className={`w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${inviteToken ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                            placeholder="הזן מספר סטודיו"
                        />
                    </div>
                    {!inviteToken && <p className="text-xs text-slate-400">יש לקבל את המספר הזה מבעל הסטודיו</p>}
                </div>

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
                    <label htmlFor="password-input" className="text-sm font-medium text-slate-700">סיסמה</label>
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
                        <>
                            {getTitle()}
                            <ArrowRight size={18} className="rotate-180" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};
