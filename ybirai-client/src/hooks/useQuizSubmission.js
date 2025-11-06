import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../utils/apiService';
import { useAuth } from '../contexts/AuthContext';
import { useGetEnrolledCourses } from './useGetEnrolledCourses';
import { toast } from 'sonner';
import { useRef } from 'react';

export const useQuizSubmission = (courseData, onQuizCompleted = null) => {
  const queryClient = useQueryClient();
  const { user, getAccessToken } = useAuth();
  const { data: enrollmentData } = useGetEnrolledCourses();
  const submissionInProgressRef = useRef(false);
  const progressUpdateSentRef = useRef(false);

  const quizMutation = useMutation({
    mutationFn: async ({ quiz, selectedAnswers, shortAnswers, timeElapsed }) => {
      if (submissionInProgressRef.current || progressUpdateSentRef.current) {
        return null;
      }

      submissionInProgressRef.current = true;

      const submissionData = {
        courseId: quiz.courseId,
        quizId: quiz.id,
        userEmail: user?.email,
        timeElapsed,
        submittedAt: new Date().toISOString(),
        answers: [
          ...Object.entries(selectedAnswers).map(([questionId, answer]) => ({
            questionId,
            answer,
            type: 'multiple-choice'
          })),
          ...Object.entries(shortAnswers || {}).map(([questionId, answer]) => ({
            questionId,
            answer,
            type: 'short-answer'
          }))
        ]
      };

      try {
        const response = await apiService.course.post(
          `/quiz-submissions`,
          submissionData,
          { headers: { 'Accept-Language': 'en' } }
        );

        if (!response?.submissionId) {
          throw new Error('No submission ID returned from server');
        }

        const results = await pollForResults(response.submissionId, quiz);

        if (enrollmentData && Array.isArray(enrollmentData)) {
          const enrollment = enrollmentData.find(e => e.courseId === quiz.courseId);
          if (enrollment) {
            progressUpdateSentRef.current = true;
            await updateProgress(quiz, results);
          }
        }

        // Trigger AI analysis callback if provided
        if (onQuizCompleted && typeof onQuizCompleted === 'function') {
          onQuizCompleted(results);
        }

        return results;
      } catch (error) {
        console.error('Error submitting quiz:', error);
        toast.error('Failed to submit quiz. Please try again.');
        throw error;
      } finally {
        submissionInProgressRef.current = false;
        progressUpdateSentRef.current = false;
      }
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast.error('Failed to submit quiz. Please try again.');
    }
  });

  const pollForResults = async (submissionId, quiz) => {
    let attempts = 0;
    const maxAttempts = 30;
    const delay = 3000;

    while (attempts < maxAttempts) {
      try {

        if (attempts > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const response = await apiService.course.get(
          `/quiz-submissions/results/${submissionId}`,
          { headers: { 'Accept-Language': 'en' } }
        );

        if (!response) {
          attempts++;
          continue;
        }

        if (response) {
          const result = {
            status: 'completed',
            score: response.score,
            passed: response.passed,
            totalPossibleScore: response.totalPossibleScore,
            totalQuestions: response.totalQuestions,
            questionResults: response.questionResults
          };
          return result;
        }

        attempts++;
      } catch (error) {
        console.error('Error polling for results:', error?.response?.status, error?.message);
        if (error?.response?.status === 403) {
          attempts++;
          continue;
        }
        if (attempts === maxAttempts - 1) {
          throw new Error('Failed to get quiz results after multiple attempts');
        }
        attempts++;
      }
    }

    throw new Error('Timeout waiting for quiz results');
  };

  const updateProgress = async (quiz, results) => {
    try {
      const token = await getAccessToken();
      await apiService.course.post(
        `/course-progress`,
        {
          type: 'quiz',
          courseId: quiz.courseId,
          quizId: quiz.id,
          score: results.score,
          totalQuestions: results.totalQuestions,
          passed: results.passed
        },
        { headers: { 'Accept-Language': 'en', 'Authorization': `Bearer ${token}` } }
      );

      queryClient.invalidateQueries(['courseProgress', quiz.courseId]);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return quizMutation;
};