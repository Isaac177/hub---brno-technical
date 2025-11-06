import { useQuery } from '@tanstack/react-query';
import { apiService } from '../utils/apiService';

export const useGetBatchUsers = (userIds) => {
  return useQuery({
    queryKey: ['batchUsers', userIds],
    queryFn: async () => {
      if (!userIds || userIds.length === 0) {
        return [];
      }

      try {
        const response = await apiService.user.post('/users/batch', {
          userIds
        });

        return response?.users || [];
      } catch (error) {
        console.error('Error fetching batch users:', error);
        throw error;
      }
    },
    enabled: Boolean(userIds && userIds.length > 0)
  });
};
