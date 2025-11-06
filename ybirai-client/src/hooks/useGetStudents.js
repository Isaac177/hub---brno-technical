import { useQuery } from '@tanstack/react-query';
import { apiService } from '../utils/apiService';

export const useGetStudents = (authToken, language = 'en') => {
  return useQuery({
    queryKey: ['students', authToken, language],
    queryFn: async () => {
      const result = await apiService.user.get('/student', {
        headers: { 
          'Accept-Language': language, 
          'Authorization': `Bearer ${authToken}` 
        }
      });
      return result;
    },
    enabled: Boolean(authToken),
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache
    retry: 1,
  });
};