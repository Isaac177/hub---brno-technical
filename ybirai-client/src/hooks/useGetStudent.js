import { useQuery } from '@tanstack/react-query';
import { apiService } from '../utils/apiService';

export const useGetStudent = (studentId, language, authToken) => {
  return useQuery({
    queryKey: ['student', studentId, language],
    queryFn: () => apiService.user.get(`/student/${studentId}`, {
      headers: { 'Accept-Language': language, 'Authorization': `Bearer ${authToken}` }
    }),
    enabled: Boolean(studentId && authToken),
    retry: 1,
  });
};
