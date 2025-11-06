import { useCallback } from 'react';
import { useQuizSubmission } from './useQuizSubmission';
import { useAuth } from '../contexts/AuthContext';

export const useQuizWithAI = (courseData, onAIRecommendation = null) => {
  const { user } = useAuth();

  const handleQuizCompleted = useCallback(async (quizResults) => {
    if (!user?.email || !quizResults) return;

    if (onAIRecommendation && typeof onAIRecommendation === 'function') {
      onAIRecommendation(quizResults);
    }
  }, [user?.email, onAIRecommendation]);

  const quizMutation = useQuizSubmission(courseData, handleQuizCompleted);

  return quizMutation;
};