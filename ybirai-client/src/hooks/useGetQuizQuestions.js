import { useQuery } from '@tanstack/react-query';
import { apiService } from '../utils/apiService';

const useGetQuizQuestions = (quizId) => {

  return useQuery({
    queryKey: ['quizQuestions', quizId],
    queryFn: async () => {
      try {
        console.log('Fetching quiz questions for quizId:', quizId);
        const data = await apiService.course.get(`/quiz-questions/quiz/${quizId}`, {
          headers: { 'Accept-Language': 'en' }
        });

        if (!data) {
          console.log('No data received, returning empty array');
          return [];
        }

        if (Array.isArray(data)) {
          console.log('Received array data:', data);
          return data;
        }

        if (data.questions && Array.isArray(data.questions)) {
          console.log('Received object with questions array:', data.questions);
          return data.questions;
        }

        console.log('Unexpected data format, returning empty array');
        return [];
      } catch (error) {
        console.error('Error fetching quiz questions:', error);
        throw error;
      }
    },
    enabled: !!quizId,
  });
};

export default useGetQuizQuestions;
