import { useQuery } from '@tanstack/react-query';
import { apiService } from '../utils/apiService';
import { useAuth } from "../contexts/AuthContext";

export const useGetEnrolledCourses = () => {
  const { user } = useAuth();
  const userEmail = user?.email;

  return useQuery({
    queryKey: ['enrolledCourses', userEmail],
    queryFn: async () => {
      if (!userEmail) {
        console.log('No user email found');
        return { courses: [], enrollments: [] };
      }

      try {
        const response = await apiService.student.get(
          `/enrollments/by-email?userEmail=${encodeURIComponent(userEmail)}`,
          {
            headers: { 'Accept-Language': 'en' }
          }
        );

        const enrollments = response.data || [];

        if (!enrollments.length) {
          return { courses: [], enrollments: [] };
        }

        const courseIds = enrollments.map(enrollment => enrollment.courseId);

        if (!courseIds.length) {
          return { courses: [], enrollments: enrollments };
        }

        const coursesResponse = await apiService.course.post('/courses/batch', { courseIds }, {
          headers: { 'Content-Type': 'application/json', 'Accept-Language': 'en' }
        });

        const courses = coursesResponse.courses || [];

        return {
          courses,
          enrollments
        };
      } catch (error) {
        console.error('[useGetEnrolledCourses] Error fetching enrolled courses:', error);
        throw error;
      }
    },
    enabled: Boolean(userEmail)
  });
};