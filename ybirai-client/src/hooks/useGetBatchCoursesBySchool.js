import { useQuery } from '@tanstack/react-query';
import { apiService } from '../utils/apiService';

export const useGetBatchCoursesBySchool = (schoolIds, enabled = true) => {

  return useQuery({
    queryKey: ['batchCoursesBySchool', schoolIds],
    queryFn: async () => {

      const result = await apiService.course.post('/courses/school/batch', { schoolIds }, {
        headers: { 'Content-Type': 'application/json', 'Accept-Language': 'en' }
      });

      
      let courses = [];

      if (result && typeof result === 'object') {
        if (Array.isArray(result.courses)) {
          courses = result.courses;
        } else if (Array.isArray(result)) {
          courses = result;
        }
      }

      return courses;
    },
    enabled: enabled && Array.isArray(schoolIds) && schoolIds.length > 0,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    retry: 1,
    onError: (error) => {
      console.error('[useGetBatchCoursesBySchool] Error:', JSON.stringify(error, null, 2));
    }
  });
};
