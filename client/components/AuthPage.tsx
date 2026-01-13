import React, { useState, useEffect } from 'react';
import { AuthLayout } from './auth/AuthLayout';
import { Login } from './auth/Login';
import { Register } from './auth/Register';
import { ForgotPassword } from './auth/ForgotPassword';
import { useInvitation } from '../hooks/useInvitation';
import { Loader2 } from 'lucide-react';

type AuthView = 'login' | 'register' | 'forgot';

export const AuthPage: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');

  // Custom hook handles all invitation logic
  const { token, role, studio, loading: invitationLoading } = useInvitation();

  // Auto-switch to register view if invited
  useEffect(() => {
    if (token) {
      setView('register');
    }
  }, [token]);

  const renderContent = () => {
    // Show loading state while validating invitation to prevent flickering
    if (invitationLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
          <p className="text-slate-500">מאמת פרטי הזמנה...</p>
        </div>
      );
    }

    switch (view) {
      case 'login':
        return (
          <Login
            onRegisterClick={() => setView('register')}
            onForgotClick={() => setView('forgot')}
          />
        );
      case 'register':
        return (
          <Register
            onLoginClick={() => setView('login')}
            inviteToken={token}
            initialInvitedRole={role}
            initialInvitedStudio={studio || undefined}
          />
        );
      case 'forgot':
        return (
          <ForgotPassword
            onBackToLogin={() => setView('login')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AuthLayout invitedRole={role}>
      {renderContent()}
    </AuthLayout>
  );
};