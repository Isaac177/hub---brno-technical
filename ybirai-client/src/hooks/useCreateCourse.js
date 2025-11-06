import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiService } from "../utils/apiService";

export const createCourseApiCall = async (courseData, language = 'en') => {
  console.log("Received courseData:", JSON.stringify(courseData, null, 2));

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

    await debugFormData(formData);

    const courseRequest = {
      schoolId: courseData.schoolId,
      title: courseData.title?.trim(),
      description: courseData.description?.trim(),
      longDescription: courseData.longDescription?.trim(),
      categoryId: courseData.categoryId,
      language: courseData.language?.toUpperCase(),
      price: Number(courseData.price),
      tags: Array.isArray(courseData.tags) ? courseData.tags.filter(Boolean).map(tag => tag.trim()) : [],
      requirements: Array.isArray(courseData.requirements) ? courseData.requirements.filter(Boolean).map(req => req.trim()) : [],
      learningObjectives: Array.isArray(courseData.learningObjectives) ? courseData.learningObjectives.filter(Boolean).map(obj => obj.trim()) : [],
      subtitles: Array.isArray(courseData.subtitles) ? courseData.subtitles.filter(Boolean).map(sub => sub.trim().toUpperCase()) : [],
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
    };

    formData.append('courseRequest', new Blob([JSON.stringify(courseRequest)], {
      type: 'application/json'
    }));

    if (courseData.featuredImageUrl instanceof File) {
      formData.append('featuredImage', courseData.featuredImageUrl, courseData.featuredImageUrl.name);
    }

    if (courseData.thumbnailUrl instanceof File) {
      formData.append('thumbnail', courseData.thumbnailUrl, courseData.thumbnailUrl.name);
    }

    console.log('FormData entries:', JSON.stringify(Object.fromEntries(formData.entries()), null, 2));

    return await apiService.course.post('/courses', formData, {
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

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  const language = localStorage.getItem('language') || 'en';

  return useMutation({
    mutationFn: async (formData) => {
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      return createCourseApiCall(formData, language);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['courses']);
      queryClient.invalidateQueries(['school-courses']);
      toast.success('Course created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Error creating course');
    }
  });
};
