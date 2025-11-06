import { useQuery } from "@tanstack/react-query";
import { apiService } from "../utils/apiService";

export const useGetCoursesLocal = (language, page = 0, size = 10) => {
    return useQuery({
        queryKey: ['courses-local', language, page, size],
        queryFn: () => apiService.course.get(
            `/courses?page=${page}&size=${size}`,
            { headers: { 'Accept-Language': language } }
        ),
        staleTime: 0,
        cacheTime: 0,
    });
}

export const useGetCourseByIdLocal = (courseId, language) => {
    return useQuery({
        queryKey: ['course-local', courseId, language],
        queryFn: () => apiService.course.get(
            `/courses/${courseId}`,
            { headers: { 'Accept-Language': language } }
        ),
        staleTime: 0,
        cacheTime: 0,
    });
}
