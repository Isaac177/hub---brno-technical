import { useQuery } from '@tanstack/react-query';
import { apiService } from '../utils/apiService';

export const useGetCoursesBySchool = (schoolId, language) => {
  return useQuery({
    queryKey: ['courses-by-school', schoolId, language],
    queryFn: async () => {
      try {
        const response = await apiService.course.get(`/courses/school/${schoolId}`, {
          headers: { 'Accept-Language': language || 'en' }
        });

        if (!response) {
          console.error('No response from API');
          throw new Error('No response from API');
        }

        return response;
      } catch (error) {
        console.error('Error fetching courses by school:', error);
        throw error;
      }
    },
    enabled: Boolean(schoolId),
    staleTime: 300000, // 5 minutes
    cacheTime: 3600000, // 1 hour
  });
};
