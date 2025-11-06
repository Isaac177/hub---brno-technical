import { useQuery } from '@tanstack/react-query';
import { apiService } from '../utils/apiService';

export const useGetAllQuizzes = (courseId) => {

  return useQuery({
    queryKey: ['allQuizzes', courseId],
    queryFn: async () => {
      try {
        const response = await apiService.course.get(`/courses/${courseId}/quizzes`, {
          headers: { 'Accept-Language': 'en' }
        });
        return response || [];
      } catch (error) {
        console.error('Error fetching all quizzes:', error);
        throw error;
      }
    },
    enabled: !!courseId,
    staleTime: 0,
    cacheTime: 0,
  });
};

export default useGetAllQuizzes;
