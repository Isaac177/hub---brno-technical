import { apiService } from "./apiService";

export const createCourseApiCall = async (courseData, language = 'en') => {
  const formData = new FormData();

  // Prepare the course request data
  const courseRequest = {
    schoolId: courseData.schoolId,
    title: courseData.title,
    description: courseData.description,
    longDescription: courseData.longDescription,
    categoryId: courseData.categoryId,
    language: courseData.language?.toUpperCase(),
    price: Number(courseData.price),
    tags: courseData.tags || [],
    requirements: courseData.requirements?.filter(req => req && req.trim()),
    syllabus: courseData.syllabus?.map(section => ({
      courseId: section.courseId, // Make sure this is included if required
      title: section.title,
      duration: section.duration || "00:00:00",
      topics: section.topics?.map(topic => ({
        title: topic.title,
        videoUrl: topic.videoUrl,
        duration: topic.duration.includes(':') ? topic.duration : `00:${topic.duration}`,
        isPreview: Boolean(topic.isPreview)
      }))
    })),
    learningObjectives: courseData.learningObjectives?.filter(obj => obj && obj.trim()),
    subtitles: courseData.subtitles?.filter(sub => sub && sub.trim()).map(sub => sub.toUpperCase())
  };

  // Append courseRequest as a string
  formData.append('courseRequest', JSON.stringify(courseRequest));

  // Append files if they exist
  if (courseData.featuredImageUrl instanceof File) {
    formData.append('featuredImage', courseData.featuredImageUrl, courseData.featuredImageUrl.name);
  }

  if (courseData.thumbnailUrl instanceof File) {
    formData.append('thumbnail', courseData.thumbnailUrl, courseData.thumbnailUrl.name);
  }

  // Log FormData entries for debugging
  for (let pair of formData.entries()) {
    console.log('FormData entry:', pair[0],
      pair[1] instanceof File ? `File: ${pair[1].name}` :
        pair[0] === 'courseRequest' ? 'JSON string' : pair[1]
    );
  }

  try {
    return await apiService.course.post('/courses', formData, {
      headers: {
        'Accept-Language': language,
        'Accept': 'application/json',
      }
    });
  } catch (error) {
    console.error('Course Creation Error:', error);
    throw error;
  }
};
