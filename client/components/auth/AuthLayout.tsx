import React, { ReactNode } from 'react';
import { User } from 'lucide-react';

interface AuthLayoutProps {
    children: ReactNode;
    invitedRole?: string | null;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, invitedRole }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans" dir="rtl">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">

                {/* Header */}
                <div className="bg-indigo-600 p-8 text-center relative">
                    <h1 className="text-3xl font-bold text-white mb-2">Classly</h1>
                    <p className="text-indigo-100">פלטפורמה לניהול סטודיו וחוגים</p>
                    {invitedRole && (
                        <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                            <User size={12} />
                            {invitedRole === 'ADMIN' ? 'הזמנת מנהל' : 'הזמנת מדריך'}
                        </div>
                    )}
                </div>

                <div className="p-8">
                    {children}
                </div>

                <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                    <p className="text-xs text-slate-400">
                        בכניסה למערכת אתה מסכים לתנאי השימוש ומדיניות הפרטיות
                    </p>
                </div>
            </div>
        </div>
    );
};
