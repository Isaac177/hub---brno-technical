import { useQuery } from '@tanstack/react-query';
import { apiService } from '../utils/apiService';

export const useGetSchoolById = (schoolId, language) => {
  return useQuery({
    queryKey: ['school', schoolId],
    queryFn: async () => {
      const result = await apiService.user.get(`/school/${schoolId}`, {
        headers: { 'Accept-Language': language }
      });
      return result;
    },
    enabled: Boolean(schoolId),
    staleTime: 300000,
    cacheTime: 3600000,
    retry: 1,
  });
};
