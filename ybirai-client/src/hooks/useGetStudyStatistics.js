import { useQuery } from '@tanstack/react-query';
import { apiService } from '../utils/apiService';

export const useGetStudyStatistics = () => {
  return useQuery({
    queryKey: ['studyStatistics'],
    queryFn: async () => {
      try {
        const response = await apiService.course.get('/courses/unified-statistics');
        return response;
      } catch (error) {
        console.error('Error fetching study statistics:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3
  });
};