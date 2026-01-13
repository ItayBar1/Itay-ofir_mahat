import { api } from './baseApi';
import { User } from '@/types/types';

export const userApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getInstructors: builder.query<User[], void>({
            query: () => '/instructors',
            providesTags: ['User'],
        }),
    }),
});

export const { useGetInstructorsQuery } = userApi;
