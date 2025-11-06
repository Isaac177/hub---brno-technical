import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../utils/apiService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quizId, courseId, data }) => {
      try {
        const response = await apiService.course.put(`/courses/${courseId}`, data, {
          headers: { 'Accept-Language': 'en' }
        });
        return response;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to update quiz';
        toast.error(errorMessage);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Quiz updated successfully');
      queryClient.invalidateQueries(['quizzes']);
    }
  });
};

export default useUpdateQuiz;
