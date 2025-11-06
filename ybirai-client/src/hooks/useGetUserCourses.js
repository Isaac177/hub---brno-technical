import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useGetSchools } from './useGetSchools';
import { useGetBatchCoursesBySchool } from './useGetBatchCoursesBySchool';

export const useGetUserCourses = () => {
  const { user } = useAuth();
  
  // Get all schools
  const { 
    data: schools, 
    isLoading: isLoadingSchools, 
    isError: isSchoolError,
    error: schoolError 
  } = useGetSchools();

  // Filter schools by user email and get their IDs
  const userSchools = schools?.filter(school => school.email === user?.email) || [];
  const schoolIds = userSchools.map(school => school.id);

  // Get courses for these schools
  const {
    data: courses,
    isLoading: isLoadingCourses,
    isError: isCourseError,
    error: courseError
  } = useGetBatchCoursesBySchool(schoolIds);

  return {
    courses,
    isLoading: isLoadingSchools || isLoadingCourses,
    isError: isSchoolError || isCourseError,
    error: schoolError || courseError
  };
};
