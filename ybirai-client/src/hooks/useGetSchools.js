import { useQuery } from "@tanstack/react-query";
import { apiService } from "../utils/apiService.js";

export const useGetSchools = (language = 'en', authToken = null) => {
    return useQuery({
        queryKey: ['schools', language],
        queryFn: async () => {
            try {
                const response = await apiService.user.get('/school', {
                    headers: {
                        'Accept-Language': language,
                        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
                    }
                });

                return response.data || response;
            } catch (error) {
                console.error('[useGetSchools] Error:', error);
                throw error;
            }
        },
        enabled: true,
        staleTime: 5 * 60 * 1000,
        cacheTime: 60 * 60 * 1000,
        retry: 2,
        onError: (error) => {
            console.error('[useGetSchools] Query failed:', error);
        },
        onSuccess: (data) => {
            console.log('[useGetSchools] Query succeeded:', data);
        }
    });
}
