import { useQuery } from '@tanstack/react-query';
import { apiService } from '../utils/apiService';

export const useGetBatchCourses = (courseIds, enabled = true) => {
  return useQuery({
    queryKey: ['batchCourses', courseIds],
    queryFn: async () => {
      return await apiService.course.post('/courses/batch', { courseIds }, {
        headers: { 'Content-Type': 'application/json', 'Accept-Language': 'en' }
      });
    },
    enabled: enabled && Array.isArray(courseIds) && courseIds.length > 0,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });
};