import { useQuery } from '@tanstack/react-query';
import { apiService } from '../utils/apiService';

export const useGetUserById = (userId, language) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiService.user.get(`/user/${userId}`, {
      headers: { 'Accept-Language': language }
    }),
    enabled: Boolean(userId),
    staleTime: 300000, // 5 minutes
    cacheTime: 3600000, // 1 hour
    retry: 1,
  });
};
