import { useState } from 'react';
import { apiService } from '../utils/apiService';

const useCreateQuiz = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createQuiz = async (quizData, courseId) => {
    if (!courseId) {
      throw new Error('Course ID is required');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.course.post(`/courses/${courseId}/quizzes`, quizData, {
        headers: { 'Accept-Language': 'en' }
      });

      console.log('Quiz creation successful:', JSON.stringify(response, null, 2));
      return response;
    } catch (error) {
      console.error('Quiz creation failed:', JSON.stringify({
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      }, null, 2));

      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const saveQuizDraft = async (quizData, courseId) => {
    if (!courseId) {
      throw new Error('Course ID is required');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Saving quiz draft with data:', JSON.stringify({
        courseId,
        quizData
      }, null, 2));

      const response = await apiService.course.post(`/courses/${courseId}/quizzes/draft`, quizData, {
        headers: { 'Accept-Language': 'en' }
      });

      console.log('Quiz draft saved successfully:', JSON.stringify(response, null, 2));
      return response;
    } catch (error) {
      console.error('Quiz draft save failed:', JSON.stringify({
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      }, null, 2));

      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createQuiz,
    saveQuizDraft,
    loading,
    error,
  };
};

export default useCreateQuiz;
