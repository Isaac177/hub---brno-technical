import { useQuery } from "@tanstack/react-query";
import {apiService} from "../utils/apiService.js";

export const useGetPostsID = (language, authToken = null) => {
  return useQuery({
    queryKey: ['posts', language],
    queryFn: () => apiService.user.get('/posts/{id}', {
      headers: { 'Accept-Language': language, ...(authToken && {'Authorization': `Bearer ${authToken}`}) }
    }),
    staleTime: 5 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
  });
};
