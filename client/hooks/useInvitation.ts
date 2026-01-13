import { useState, useEffect } from 'react';
import { InvitationService } from '../services/api';
import { logger } from '../services/logger';

export interface InvitedStudio {
    name: string;
    id: string;
    serial_number?: string;
}

export interface InvitationState {
    token: string | null;
    role: string | null;
    studio: InvitedStudio | null;
    loading: boolean;
    error: string | null;
}

export const useInvitation = () => {
    const [state, setState] = useState<InvitationState>({
        token: null,
        role: null,
        studio: null,
        loading: false, // Start false, becomes true if token exists
        error: null,
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
            validateToken(token);
        }
    }, []);

    const validateToken = async (token: string) => {
        setState(prev => ({ ...prev, loading: true, token }));

        try {
            const res = await InvitationService.validate(token);
            if (res.valid) {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    role: res.role,
                    studio: res.studio || null,
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: 'ההזמנה אינה תקינה או שפג תוקפה',
                }));
            }
        } catch (err: any) {
            logger.error('Error validating token', err);
            setState(prev => ({
                ...prev,
                loading: false,
                error: 'אירעה שגיאה בבדיקת ההזמנה',
            }));
        }
    };

    return state;
};
