import { useQuery } from "@tanstack/react-query";
import { apiService } from "../utils/apiService.js";

export const useGetPosts = (language, authToken = null) => {
  return useQuery({
    queryKey: ['posts', language],
    //queryFn: () => apiCall('/posts', 'GET', null, language, authToken),

    queryFn: async () => await apiService.student.get('/post', {
      headers: { 'Accept-Language': language, ...(authToken && { 'Authorization': `Bearer ${authToken}` }) }
    }),

    staleTime: 5 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
  });
};
