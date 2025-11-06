import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiService } from '../utils/apiService.js';
import { useAuth } from '../contexts/AuthContext';

export const useEnrollInCourse = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ courseId, language = 'ru' }) => {
      const enrollmentData = {
        userEmail: user.email,
        courseId,
        language,
        paymentDetails: {
          amount: 0,
          currency: 'KZT',
          paymentMethod: 'FREE',
          lastFourDigits: '0000'
        }
      };

      const response = await apiService.student.post('/enrollments', enrollmentData, {
        headers: {
          'Accept-Language': language
        }
      });

      return response.data || response;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['courses']);
      queryClient.invalidateQueries(['course', variables.courseId]);
      queryClient.invalidateQueries(['enrollments', user.email]);

      queryClient.setQueryData(['enrollment', data.enrollment.id], data.enrollment);
    }
  });
};

export const useCheckEnrollmentStatus = (courseId) => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user || !courseId) {
        throw new Error('User and courseId are required');
      }

      const response = await apiService.student.get(
        `/enrollments/status?userEmail=${encodeURIComponent(user.email)}&courseId=${encodeURIComponent(courseId)}`
      );

      return response.data || response;
    },
    onError: (error) => {
      console.error('Enrollment status check failed:', error);
    }
  });
};

export const useGetEnrollmentRequests = (schoolIds) => {
  return useQuery({
    queryKey: ['enrollmentRequests', schoolIds],
    queryFn: async () => {
      if (!schoolIds || schoolIds.length === 0) {
        return [];
      }

      try {

        const response = await apiService.student.get('/enrollments', {
          params: {
            schoolIds: schoolIds.join(','),
            status: 'ON_HOLD'
          }
        });

        return response?.enrollments || [];
      } catch (error) {
        console.error('Error fetching enrollment requests:', {
          error,
          schoolIds,
          message: error.message,
          response: error.response?.data
        });
        throw error;
      }
    },
    enabled: Boolean(schoolIds && schoolIds.length > 0)
  });
};

export const useGetEnrollmentByBatchCourseId = (courseIds, options = {}) => {

  return useQuery({
    queryKey: ['enrollments', 'batch', courseIds],
    queryFn: async () => {
      try {
        if (!courseIds?.length) {
          return { success: true, enrollments: [] };
        }

        const response = await apiService.student.post('/enrollments/batch', { courseIds });

        if (!response) {
          console.warn('[useGetEnrollmentByBatchCourseId] Empty response');
          return { success: false, enrollments: [], error: 'No response received' };
        }

        const data = response.data || response;
        return data;
      } catch (error) {
        console.error('[useGetEnrollmentByBatchCourseId] Error:',
          JSON.stringify(error, null, 2)
        );
        return { success: false, enrollments: [], error: error.message };
      }
    },
    enabled: Boolean(courseIds?.length && options.enabled !== false),
    ...options
  });
};

export const useGetEnrollmentsByBatchCourseIds = (courseIds) => {
  return useQuery({
    queryKey: ['enrollmentsByBatchCourseIds', courseIds],
    queryFn: async () => {
      if (!courseIds || courseIds.length === 0) {
        return { enrollments: [] };
      }

      try {
        const response = await apiService.student.post('/enrollments/batch', {
          courseIds,
        });

        return response.data || response;

      } catch (error) {
        console.error('[useGetEnrollmentsByBatchCourseIds] Error fetching enrollments:', error);
        throw error;
      }
    },
    enabled: Boolean(courseIds?.length)
  });
};

export const useGetEnrollmentsByCourseId = (courseId) => {
  return useQuery({
    queryKey: ['enrollmentsByCourseId', courseId],
    queryFn: async () => {
      if (!courseId) {
        console.log('[useGetEnrollmentsByCourseId] No course ID provided');
        return { enrollments: [] };
      }

      try {
        const response = await apiService.student.get(`/enrollments/course/${courseId}`);

        if (!response) {
          console.log('[useGetEnrollmentsByCourseId] Empty response received');
          return { enrollments: [] };
        }

        const data = response.data || response;

        if (data.success && Array.isArray(data.enrollments)) {
          return {
            enrollments: data.enrollments
          };
        }

        if (Array.isArray(data)) {
          return {
            enrollments: data
          };
        }

        return {
          enrollments: []
        };
      } catch (error) {
        console.error('[useGetEnrollmentsByCourseId] Error fetching enrollments:', error);
        throw error;
      }
    },
    enabled: Boolean(courseId)
  });
};

export const useGetSchoolStudents = (schoolId, options = {}) => {
  return useQuery({
    queryKey: ['schoolStudents', schoolId, options.page, options.limit, options.status],
    queryFn: async () => {
      if (!schoolId) {
        console.log('[useGetSchoolStudents] No school ID provided');
        return { data: [], meta: {} };
      }

      try {
        const params = new URLSearchParams();
        if (options.page) params.append('page', options.page);
        if (options.limit) params.append('limit', options.limit);
        if (options.status) params.append('status', options.status);

        const queryString = params.toString();
        const url = `/school/${schoolId}/students${queryString ? `?${queryString}` : ''}`;
        
        console.log('[useGetSchoolStudents] Fetching from:', url);
        
        const response = await apiService.student.get(url);

        if (!response) {
          console.log('[useGetSchoolStudents] Empty response received');
          return { data: [], meta: {} };
        }

        const data = response.data || response;
        
        console.log('[useGetSchoolStudents] Received data:', JSON.stringify(data, null, 2));

        if (data.success) {
          return {
            data: data.data || [],
            meta: data.meta || {}
          };
        }

        return {
          data: [],
          meta: {}
        };
      } catch (error) {
        console.error('[useGetSchoolStudents] Error fetching school students:', error);
        throw error;
      }
    },
    enabled: Boolean(schoolId && options.enabled !== false),
    ...options
  });
};
