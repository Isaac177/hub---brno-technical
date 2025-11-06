import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../utils/apiService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();
  const { getAccessToken } = useAuth();

  return useMutation({
    mutationFn: async (quiz) => {
      try {
        const token = await getAccessToken();
        await apiService.course.delete(`/courses/${quiz.courseId}/quizzes/${quiz.id}`, {
          headers: { 'Accept-Language': 'en', 'Authorization': `Bearer ${token}` }
        });
        return true;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to delete quiz';
        toast.error(errorMessage);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Quiz deleted successfully');
      queryClient.invalidateQueries(['quizzes']);
    }
  });
};
