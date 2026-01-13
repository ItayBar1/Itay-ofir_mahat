import { api } from './baseApi';
import { Studio } from '@/types/types';

export const studioApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getMyStudio: builder.query<Studio, void>({
            query: () => '/studios/my-studio',
            providesTags: ['Studio'],
        }),
        createStudio: builder.mutation<Studio, Partial<Studio>>({
            query: (body) => ({
                url: '/studios',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Studio'],
        }),
        updateStudio: builder.mutation<Studio, Partial<Studio>>({
            query: (body) => ({
                url: '/studios/my-studio',
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Studio'],
        }),
    }),
});

export const {
    useGetMyStudioQuery,
    useCreateStudioMutation,
    useUpdateStudioMutation
} = studioApi;
