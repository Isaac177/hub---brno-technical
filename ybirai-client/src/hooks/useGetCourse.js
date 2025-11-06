import { useQuery } from '@tanstack/react-query';
import { apiService } from '../utils/apiService';

export const useGetCourse = (courseId, language = 'en') => {
  return useQuery({
    queryKey: ['course', courseId, language],
    queryFn: async () => {
      if (!courseId) {
        return null;
      }

      try {
        return await apiService.course.get(`/courses/${courseId}`, {
          headers: { 'Accept-Language': language }
        });
      } catch (error) {
        console.error('Error fetching course:', error);
        throw error;
      }
    },
    enabled: Boolean(courseId)
  });
};
