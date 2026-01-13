import { api } from './baseApi';
import { Branch, Room } from '@/types/types';

export const branchApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getBranches: builder.query<Branch[], void>({
            query: () => '/branches',
            providesTags: ['Branch'],
        }),
        getRooms: builder.query<Room[], void>({
            query: () => '/rooms',
            providesTags: ['Branch'], // Rooms are related to branches
        }),
        // Add mutations as needed later
    }),
});

export const { useGetBranchesQuery, useGetRoomsQuery } = branchApi;
