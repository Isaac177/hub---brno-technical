import { useQuery } from "@tanstack/react-query";
import { apiService } from "../utils/apiService";

export const useGetCourses = (language, page = 0, size = 10, authToken = null) => {
    return useQuery({
        queryKey: ['courses', language, page, size],
        queryFn: () => apiService.course.get(
            `/courses?page=${page}&size=${size}`,
            {
                headers: { 'Accept-Language': language },
                ...(authToken && { authToken })
            }
        ),
        staleTime: 5 * 60 * 1000,
        cacheTime: 60 * 60 * 1000,
    });
}

export const useGetCourseById = (courseId, config = {}, language) => {
    return useQuery({
        queryKey: ['course', courseId, language],
        queryFn: async () => {
            const response = await apiService.course.get(
                `/courses/${courseId}`,
                {
                    headers: { 'Accept-Language': language },
                    ...config
                }
            );
            return response;
        },
        staleTime: 5 * 60 * 1000,
        cacheTime: 60 * 60 * 1000,
        retry: 1,
        enabled: !!courseId,
    });
}
