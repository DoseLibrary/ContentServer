
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../../app/store";

export const contentServerApiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5173/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      } else {
        console.error('No token available');
      }
    }
  }),
  reducerPath: 'mainServerApi',
  tagTypes: ['ContentServers'],
  endpoints: build => ({
    getContentServers: build.query({
      query: () => '/content-servers',
      providesTags: (result, error, id) => [{ type: 'ContentServers', id }]
    })
  }),
});
