import { useState, useCallback } from "react";
import { apiService } from "../utils/apiService";
import { toast } from "sonner";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const retryOperation = async (operation, maxRetries = MAX_RETRIES, delay = RETRY_DELAY) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
};

export const useCourseUpdate = () => {
  const [updateProgress, setUpdateProgress] = useState(new Map());
  const [updateErrors, setUpdateErrors] = useState(new Map());

  const updateCourseData = async (courseId, data) => {
    try {
      await retryOperation(() =>
        apiService.course.put(`/courses/${courseId}/data`, data, {
          headers: { 'Accept-Language': 'en' }
        })
      );
      toast.success("Course data updated successfully");
    } catch (error) {
      console.error("Failed to update course data:", error);
      toast.error("Failed to update course data");
      throw error;
    }
  };

  const updateCourseSyllabus = async (courseId, syllabus) => {
    try {
      await retryOperation(() =>
        apiService.course.put(`/courses/${courseId}/syllabus`, syllabus, {
          headers: { 'Accept-Language': 'en' }
        })
      );
      toast.success("Course syllabus updated successfully");
    } catch (error) {
      console.error("Failed to update course syllabus:", error);
      toast.error("Failed to update course syllabus");
      throw error;
    }
  };

  const updateCourseMedia = async (courseId, mediaType, file) => {
    const uploadId = uuidv4();
    try {
      setUpdateProgress(prev => new Map(prev).set(uploadId, 0));

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload file directly instead of chunks
      const { data } = await retryOperation(() =>
        axios.post(
          `https://course.ybyraihub.kz/api/courses/${courseId}/media/${mediaType}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
              const progress = (progressEvent.loaded / progressEvent.total) * 100;
              setUpdateProgress(prev => new Map(prev).set(uploadId, Math.round(progress)));
            }
          }
        )
      );

      setUpdateProgress(prev => {
        const newMap = new Map(prev);
        newMap.delete(uploadId);
        return newMap;
      });

      return data.mediaUrl;
    } catch (error) {
      setUpdateErrors(prev => new Map(prev).set(uploadId, error.message));
      throw error;
    }
  };

  const updateCourseVideo = async (courseId, sectionIndex, topicIndex, videoFile) => {
    const uploadId = `video_${sectionIndex}_${topicIndex}`;
    try {
      return await updateCourseMedia(courseId, 'video', videoFile);
    } catch (error) {
      setUpdateErrors(prev => new Map(prev).set(uploadId, error.message));
      throw error;
    }
  };

  return {
    updateCourseData,
    updateCourseSyllabus,
    updateCourseMedia,
    updateProgress,
    updateErrors
  };
};
