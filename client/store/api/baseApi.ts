import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '@/services/supabaseClient';

const getBaseUrl = () => {
    // In development with Vite proxy, use relative path '/api'
    // In production, might need full URL if not served from same origin
    return import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
};

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: getBaseUrl(),
        prepareHeaders: async (headers) => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
                headers.set('Authorization', `Bearer ${session.access_token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Studio', 'Branch', 'User'], // Define tags for cache invalidation
    endpoints: () => ({}),
});
