// useGetReviews.js
import { useQuery } from "@tanstack/react-query";
import {apiService} from "../utils/apiService.js";

export const useGetReviews = (language) => {
  return useQuery({
    queryKey: ['reviews', language],
    queryFn: () => apiService.user.get('/reviews', {
      headers: { 'Accept-Language': language }
    }),
    staleTime: 5 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
  });
}
