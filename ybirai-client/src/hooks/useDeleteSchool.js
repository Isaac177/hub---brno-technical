import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiService } from '../utils/apiService';

export const useDeleteSchool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schoolId) => {
      const userEmail = localStorage.getItem('userEmail');

      return apiService.user.delete(`/school/${schoolId}`, {
        headers: {
          'Accept-Language': 'en',
          ...(userEmail && { 'user-email': userEmail })
        }
      });
    },
    onSuccess: (data, schoolId) => {
      const language = localStorage.getItem('language') || 'en';

      queryClient.invalidateQueries(['schools', language]);

      queryClient.invalidateQueries(['school', schoolId]);

      toast.success('School deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete school');
    },
  });
};
