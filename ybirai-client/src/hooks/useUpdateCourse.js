import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiService } from '../utils/apiService';

const updateCourseApiCall = async (courseId, courseData, language = 'en') => {
    console.log("Received courseData for update:", JSON.stringify(courseData, null, 2));

    try {
        const debugFormData = async (formData) => {
            const entries = {};
            for (const [key, value] of formData.entries()) {
                if (value instanceof Blob) {
                    entries[key] = {
                        type: value.type,
                        size: value.size,
                        content: value instanceof File ?
                            { name: value.name, type: value.type } :
                            await value.text()
                    };
                } else {
                    entries[key] = value;
                }
            }
            console.log('FormData contents:', JSON.stringify(entries, null, 2));
        };

        const formData = new FormData();
        let hasData = false;

        // Always create courseRequest object, even if empty
        const courseRequest = {
            ...(courseData.schoolId && { schoolId: courseData.schoolId }),
            ...(courseData.title && { title: courseData.title.trim() }),
            ...(courseData.description && { description: courseData.description.trim() }),
            ...(courseData.longDescription && { longDescription: courseData.longDescription.trim() }),
            ...(courseData.categoryId && { categoryId: courseData.categoryId }),
            ...(courseData.language && { language: courseData.language.toUpperCase() }),
            ...(courseData.price !== undefined && { price: Number(courseData.price) }),
            ...(courseData.tags && { tags: Array.isArray(courseData.tags) ? courseData.tags.filter(Boolean).map(tag => tag.trim()) : [] }),
            ...(courseData.requirements && { requirements: Array.isArray(courseData.requirements) ? courseData.requirements.filter(Boolean).map(req => req.trim()) : [] }),
            ...(courseData.learningObjectives && { learningObjectives: Array.isArray(courseData.learningObjectives) ? courseData.learningObjectives.filter(Boolean).map(obj => obj.trim()) : [] }),
            ...(courseData.subtitles && { subtitles: Array.isArray(courseData.subtitles) ? courseData.subtitles.filter(Boolean).map(sub => sub.trim().toUpperCase()) : [] }),
            ...(courseData.syllabus && {
                syllabus: Array.isArray(courseData.syllabus) ? courseData.syllabus.map(section => ({
                    title: section.title?.trim(),
                    duration: section.duration?.includes(':') ? section.duration : section.duration ? `00:${section.duration}` : "00:00:00",
                    topics: Array.isArray(section.topics) ? section.topics.map(topic => ({
                        title: topic.title?.trim(),
                        videoUrl: topic.videoUrl?.trim(),
                        duration: topic.duration?.includes(':') ? topic.duration : `00:${topic.duration}`,
                        isPreview: Boolean(topic.isPreview)
                    })) : []
                })) : []
            })
        };

        // Always append courseRequest, even if empty (backend expects it)
        formData.append('courseRequest', new Blob([JSON.stringify(courseRequest)], {
            type: 'application/json'
        }));
        hasData = true;

        // Handle media files with correct field names that match backend
        if (courseData.featuredImageUrl instanceof File) {
            console.log('Adding featuredImage file:', courseData.featuredImageUrl.name);
            formData.append('featuredImage', courseData.featuredImageUrl, courseData.featuredImageUrl.name);
            hasData = true;
        }

        if (courseData.thumbnailUrl instanceof File) {
            console.log('Adding thumbnail file:', courseData.thumbnailUrl.name);
            formData.append('thumbnail', courseData.thumbnailUrl, courseData.thumbnailUrl.name);
            hasData = true;
        }

        if (!hasData) {
            throw new Error('No data to update');
        }

        await debugFormData(formData);

        console.log('Making PUT request to courses API');

        return await apiService.course.put(`/courses/${courseId}`, formData, {
            headers: {
                'Accept-Language': language,
                'Accept': 'application/json',
            }
        });
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const useUpdateCourse = () => {
    const queryClient = useQueryClient();
    const language = localStorage.getItem('language') || 'en';

    return useMutation({
        mutationFn: async ({ courseId, courseData }) => {
            console.log('useUpdateCourse mutation called with:', { courseId, courseData });
            return updateCourseApiCall(courseId, courseData, language);
        },
        onSuccess: (data, variables) => {
            console.log('Course updated successfully:', data);
            queryClient.invalidateQueries(['courses']);
            queryClient.invalidateQueries(['course', variables.courseId]);
            queryClient.invalidateQueries(['school-courses']);
            toast.success('Course updated successfully');
        },
        onError: (error) => {
            console.error('Error updating course:', error);
            toast.error(error.message || 'Error updating course');
        }
    });
};

export const useCourseUpdate = () => {
    const updateCourseMutation = useUpdateCourse();

    const updateCourseData = async (courseId, courseData) => {
        return updateCourseMutation.mutateAsync({ courseId, courseData });
    };

    return {
        updateCourseData,
        isLoading: updateCourseMutation.isPending,
        error: updateCourseMutation.error
    };
};
