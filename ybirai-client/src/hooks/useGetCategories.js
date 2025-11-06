import { apiService } from "../utils/apiService.js";
import { useQuery } from "@tanstack/react-query";


export const useGetCategories = (language, authToken = null) => {
    return useQuery({
        queryKey: ['categories', language],
        queryFn: () => apiService.course.get('/categories', {
            headers: { 'Accept-Language': language, ...(authToken && { 'Authorization': `Bearer ${authToken}` }) }
        }),
        staleTime: 5 * 60 * 1000,
        cacheTime: 60 * 60 * 1000,
    });
}

