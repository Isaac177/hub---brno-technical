import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useQuizSubmission } from '../../hooks/useQuizSubmission';
import { TimeDisplay } from '../../components/quiz/TimeDisplay';
import { QuizIntro } from '../../components/quiz/QuizIntro';
import { CancelQuizDialog } from '../../components/quiz/CancelQuizDialog';
import { SubmitQuizDialog } from '../../components/quiz/SubmitQuizDialog';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { QuizResult } from '../../components/quiz/QuizResult';
import { AnimatePresence } from 'framer-motion';
import { useCourseProgress } from '../../contexts/CourseProgressContext';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useGetCourse } from '../../hooks/useGetCourse';

const StudentQuizDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizId, courseId } = useParams();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(location.state?.quiz || null);
  const [loading, setLoading] = useState(!location.state?.quiz);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [shortAnswers, setShortAnswers] = useState({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentStep, setCurrentStep] = useState('terms');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);

  const { data: courseData, isLoading: courseLoading } = useGetCourse(courseId);
  const { progress: courseProgress } = useCourseProgress();
  const { mutateAsync: submitQuiz, isLoading: isSubmitting, data: quizResult, isSuccess } = useQuizSubmission(courseData);

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!quiz && quizId) {
        try {
          setLoading(true);
          if (courseData?.quizzes) {
            const foundQuiz = courseData.quizzes.find(q => q.id === quizId);
            if (foundQuiz) {
              setQuiz(foundQuiz);
              setLoading(false);
              return;
            }
          }
          const response = await fetch(`/api/quizzes/${quizId}`);
          if (!response.ok) throw new Error('Failed to fetch quiz');
          const data = await response.json();
          setQuiz(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchQuizData();
  }, [quizId, quiz, courseData]);

  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  useEffect(() => {
    if (currentStep === 'questions') {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [currentStep]);

  useEffect(() => {
    if (isSuccess && quizResult?.passed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isSuccess, quizResult?.passed]);

  const unansweredQuestions = useMemo(() => {
    if (!quiz?.questions || !Array.isArray(quiz.questions)) {
      return [];
    }
    return quiz.questions.filter(question => {
      if (question.type === 'MULTIPLE_CHOICE') {
        return !selectedAnswers[question.id];
      }
      return !shortAnswers[question.id] || shortAnswers[question.id].trim() === '';
    });
  }, [quiz, selectedAnswers, shortAnswers]);

  const handleStartQuiz = () => {
    setCurrentStep('questions');
    setTimerActive(true);
  };

  const handleCancelQuiz = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setTimerActive(false);
    setShowCancelModal(false);
    setTimeout(() => {
      navigate(`/student/education/course/${quiz.courseId}/quizzes`);
    }, 100);
  };

  const handleAnswerSelect = (questionId, value) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleShortAnswerChange = (questionId, value) => {
    setShortAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmitClick = () => {
    if (unansweredQuestions.length > 0) {
      const questionNumbers = unansweredQuestions
        .map((q, index) => quiz.questions.findIndex(qz => qz.id === q.id) + 1)
        .join(', ');

      toast.error("Incomplete Quiz", {
        description: `Please answer question${unansweredQuestions.length > 1 ? 's' : ''} ${questionNumbers} before submitting.`
      });
      return;
    }
    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setShowSubmitModal(false);
      setShowResultsDialog(true);
      setTimerActive(false);

      const result = await submitQuiz({
        quiz,
        courseData,
        selectedAnswers,
        shortAnswers,
        timeElapsed,
        courseProgress: courseProgress?.componentProgress
      });

      if (result?.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error('Failed to submit quiz. Please try again.');
      setShowResultsDialog(false);
    }
  };

  const handleResultsClose = () => {
    setShowResultsDialog(false);
    navigate(`/student/education/course/${quiz.courseId}/overview`);
  };

  if (loading || courseLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-medium">
              Loading quiz...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto py-8 px-4">
          <Card className="max-w-md mx-auto text-center border-0 bg-white/90 backdrop-blur-sm dark:bg-slate-800/90">
            <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-b border-red-200 dark:border-red-700">
              <CardTitle className="text-xl font-bold text-red-600 dark:text-red-400">Course Not Found</CardTitle>
              <CardDescription className="text-red-500 dark:text-red-300">
                The course data could not be loaded. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Button
                onClick={() => navigate(-1)}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto py-8 px-4">
          <Card className="max-w-md mx-auto text-center border-0 bg-white/90 backdrop-blur-sm dark:bg-slate-800/90">
            <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-b border-red-200 dark:border-red-700">
              <CardTitle className="text-xl font-bold text-red-600 dark:text-red-400">Quiz Not Found</CardTitle>
              <CardDescription className="text-red-500 dark:text-red-300">
                {error || "The quiz you're looking for doesn't exist or you don't have access to it."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Button
                onClick={() => navigate(-1)}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto py-8 px-4">
          <Card className="max-w-md mx-auto text-center border-0 bg-white/90 backdrop-blur-sm dark:bg-slate-800/90">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-b border-yellow-200 dark:border-yellow-700">
              <CardTitle className="text-xl font-bold text-yellow-600 dark:text-yellow-400">Invalid Quiz</CardTitle>
              <CardDescription className="text-yellow-500 dark:text-yellow-300">
                This quiz has no questions or is malformed.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Button
                onClick={() => navigate(-1)}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full max-w-7xl mx-auto py-8 px-4 relative">
        {timerActive && (
          <div className="fixed top-1/2 right-4 transform -translate-y-1/2 z-50">
            <TimeDisplay seconds={timeElapsed} />
          </div>
        )}

        <AnimatePresence mode="wait">
          {currentStep === 'terms' ? (
            <QuizIntro
              quiz={quiz}
              termsAccepted={termsAccepted}
              onTermsChange={setTermsAccepted}
              onStartQuiz={handleStartQuiz}
              onBack={() => navigate(-1)}
            />
          ) : (
            <div className="max-w-5xl mx-auto">
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {quiz.title}
                      </h1>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">
                        {quiz.questions.length} questions • {quiz.totalPoints} points
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl border border-emerald-200 dark:border-emerald-700">
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        Difficulty: {quiz.difficultyLevel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-4">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((quiz.questions.length - unansweredQuestions.length) / quiz.questions.length) * 100}%`
                    }}
                  />
                </div>

                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>Progress: {quiz.questions.length - unansweredQuestions.length} of {quiz.questions.length} answered</span>
                  <span>{Math.round(((quiz.questions.length - unansweredQuestions.length) / quiz.questions.length) * 100)}% complete</span>
                </div>
              </div>

              <div className="space-y-8">
                {quiz.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 px-8 py-6 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full text-white text-sm font-bold">
                              {index + 1}
                            </div>
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                              Question {index + 1} of {quiz.questions.length}
                            </span>
                          </div>
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                            {question.questionText}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <div className="px-3 py-1 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg border border-amber-200 dark:border-amber-700">
                            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                              {question.points} pts
                            </span>
                          </div>
                          <div className="px-3 py-1 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
                            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                              {question.type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-8">
                      {question.type === 'MULTIPLE_CHOICE' && question.options && (
                        <div className="space-y-4">
                          {question.options.map((option, optIndex) => {
                            const optionText = typeof option === 'string' ? option : option.optionText;

                            return (
                              <label
                                key={optIndex}
                                className="group flex items-start gap-4 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 cursor-pointer"
                              >
                                <div className="relative flex items-center justify-center mt-1">
                                  <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={optionText}
                                    onChange={(e) => handleAnswerSelect(question.id, e.target.value)}
                                    className="w-5 h-5 text-blue-500 border-2 border-slate-300 dark:border-slate-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 bg-white dark:bg-slate-700"
                                  />
                                </div>
                                <div className="flex-1">
                                  <span className="text-slate-900 dark:text-slate-100 font-medium group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors">
                                    {optionText}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {question.type === 'MULTIPLE_CHOICE' && !question.options && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                          <p className="text-red-600 dark:text-red-400 font-medium">
                            No options available for this question
                          </p>
                          <p className="text-sm text-red-500 dark:text-red-300 mt-1">
                            Question ID: {question.id} | Type: {question.type}
                          </p>
                        </div>
                      )}

                      {question.type !== 'MULTIPLE_CHOICE' && question.type === 'SHORT_ANSWER' && (
                        <div className="space-y-4">
                          <textarea
                            className="w-full p-6 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200 resize-none text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                            placeholder="Type your answer here..."
                            onChange={(e) => handleShortAnswerChange(question.id, e.target.value)}
                            rows={4}
                          />
                          <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                            <span>Provide a detailed answer to earn full points</span>
                            <span>{shortAnswers[question.id]?.length || 0} characters</span>
                          </div>
                        </div>
                      )}

                      {question.type !== 'MULTIPLE_CHOICE' && question.type !== 'SHORT_ANSWER' && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                          <p className="text-yellow-600 dark:text-yellow-400 font-medium">
                            Unknown question type: {question.type}
                          </p>
                          <p className="text-sm text-yellow-500 dark:text-yellow-300 mt-1">
                            Question ID: {question.id}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handleCancelQuiz}
                      variant="outline"
                      className="px-8 py-3 border-2 border-slate-300 dark:border-slate-600 hover:border-red-400 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel Quiz
                    </Button>
                  </div>

                  <div className="flex items-center gap-4">
                    {unansweredQuestions.length > 0 && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/30 rounded-xl border border-amber-200 dark:border-amber-700">
                        <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                          {unansweredQuestions.length} questions remaining
                        </span>
                      </div>
                    )}

                    <Button
                      onClick={handleSubmitClick}
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Submit Quiz
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>

        <CancelQuizDialog
          isOpen={showCancelModal}
          onClose={setShowCancelModal}
          onConfirm={handleConfirmCancel}
        />

        <SubmitQuizDialog
          isOpen={showSubmitModal}
          onClose={setShowSubmitModal}
          onConfirm={handleConfirmSubmit}
          isSubmitting={isSubmitting}
        />

        <QuizResult
          isOpen={showResultsDialog}
          onClose={setShowResultsDialog}
          isSuccess={isSuccess}
          quizResult={quizResult}
          quiz={quiz}
          user={user}
          onReturn={handleResultsClose}
          canClose={isSuccess}
          courseData={courseData}
        />
      </div>
    </div>
  );
};

export default StudentQuizDetails;