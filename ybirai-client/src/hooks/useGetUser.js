import { useQuery } from '@tanstack/react-query';
import { apiService } from '../utils/apiService';
import { useAuth } from '../contexts/AuthContext';

export const useGetUser = () => {
  const { session } = useAuth();
  const token = session?.tokens?.accessToken?.toString();

  return useQuery({
    queryKey: ['user'],
    queryFn: () => apiService.user.get('/user', {
      headers: { 'Accept-Language': 'en', 'Authorization': `Bearer ${token}` }
    }),
    enabled: Boolean(token),
    staleTime: 300000,
    cacheTime: 3600000,
    retry: 1,
  });
};
