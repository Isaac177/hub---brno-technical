import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCourse } from "../../contexts/CourseContext";
import { useVideoPlayer } from "../../contexts/VideoPlayerContext";
import { useGetCourse } from "../../hooks/useGetCourse";
import { useGetEnrolledCourses } from "../../hooks/useGetEnrolledCourses";
import { useProgressWithAI } from "../../hooks/useProgressWithAI";
import { apiService } from "../../utils/apiService";
import { Clock, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import CourseHeader from "./MainCourse/CourseHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import VideoSection from "./MainCourse/VideoSection";
import CourseStats from "./MainCourse/CourseStats";
import CourseContent from "./MainCourse/CourseContent";
import CourseProgress from "./MainCourse/CourseProgress";
import VideoDialog from "./MainCourse/VideoDialog";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import AIChatDialog from "./AIChatDialog";
import { useTranslation } from "react-i18next";

const CourseLearning = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { selectedCourse: course, setSelectedCourse } = useCourse();
  const { data: courseData, isLoading: courseLoading } = useGetCourse(courseId);
  const { data: enrollmentData } = useGetEnrolledCourses();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  const userEmail = user?.email;
  const { t } = useTranslation();

  const { currentTopic, setCurrentTopic } = useVideoPlayer();
  const [localProgress, setLocalProgress] = useState(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [recentQuizResults, setRecentQuizResults] = useState(null);
  const [hasNewRecommendations, setHasNewRecommendations] = useState(false);
  const [pendingRecommendations, setPendingRecommendations] = useState(null);

  const openChat = () => {
    setIsChatOpen(true);
    setHasNewRecommendations(false); // Clear notification when opening chat
  };
  const closeChat = () => setIsChatOpen(false);

  const enrollments = enrollmentData?.enrollments || [];
  const currentEnrollment = enrollments.find(e => e.courseId === courseId);
  const enrollmentId = currentEnrollment?.id;

  const handleTopicSelect = useCallback((topic) => {
    if (!topic || !courseId || !enrollmentId) {
      return;
    }
    setCurrentTopic(topic, courseId, enrollmentId);
    setIsVideoDialogOpen(true);
  }, [courseId, enrollmentId, setCurrentTopic]);

  useEffect(() => {
    if (courseData) {
      setSelectedCourse(courseData);
    }
  }, [courseData, setSelectedCourse]);

  useEffect(() => {
    if (course && !currentTopic && enrollmentId && setCurrentTopic) {
      const firstVideoTopic = course.syllabus
        ?.flatMap(section => section.topics || [])
        ?.find(topic => topic.videoUrl);

      if (firstVideoTopic) {
        setCurrentTopic(firstVideoTopic, courseId, enrollmentId);
      }
    }
  }, [course, currentTopic, courseId, enrollmentId, setCurrentTopic]);

  // AI Analysis Function - only called on specific events
  const analyzeUserData = useCallback(async (triggerData = {}) => {
    if (!userEmail) return;

    try {
      console.log('Triggering AI analysis for specific event:', triggerData.type);
      
      const analysisData = {
        userEmail,
        courseId,
        quizResults: triggerData.quizResults || recentQuizResults,
        progressData: triggerData.progressData || null, // Use progress data from trigger event
        language: currentLanguage,
        triggerEvent: triggerData // Include trigger context for AI
      };

      const response = await apiService.student.post('/ai/recommendations', analysisData);

      if (response.success && response.data.recommendations) {
        const recommendations = response.data.recommendations;
        
        // Check if AI intervention is required
        if (recommendations.intervention?.required) {
          setPendingRecommendations(recommendations);
          setHasNewRecommendations(true);
        }
      }
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      // Don't show error to user for background analysis
    }
  }, [userEmail, courseId, recentQuizResults, currentLanguage]);

  // Function to handle progress milestone events and trigger AI analysis
  const handleProgressMilestone = useCallback((event, progressData) => {
    console.log('Progress milestone reached:', event);
    
    // Trigger AI analysis for significant progress events
    analyzeUserData({
      type: event.type,
      event,
      progressData,
      timestamp: event.timestamp
    });
  }, [analyzeUserData]);

  // Function to handle quiz completion and trigger AI analysis
  const handleQuizCompleted = useCallback((quizResults) => {
    setRecentQuizResults(quizResults);
    
    // Trigger AI analysis specifically for quiz completion
    analyzeUserData({
      type: 'quiz_completion',
      quizResults,
      timestamp: new Date().toISOString()
    });
  }, [analyzeUserData]);

  // Initialize progress hook with AI milestone detection
  const { data: restProgress, isLoading: progressLoading } = useProgressWithAI(
    courseId, 
    userEmail, 
    currentLanguage, 
    handleProgressMilestone
  );

  const canAccessQuiz = useCallback((topicId) => {
    const videoProgress = restProgress?.topicsProgress?.[topicId]?.videoProgress;
    return videoProgress >= 50;
  }, [restProgress]);

  if (courseLoading || progressLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-4 text-center">
          <Loader2 className="animate-spin h-10 w-10 text-blue-500 mx-auto" />
          </div>
      </div>
    );
  }

  if (!course) {
    return (
      <Alert>
        <AlertTitle>{t('course.notFound')}</AlertTitle>
        <AlertDescription>
          {t('course.notFoundDescription')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="px-8 py-6 space-y-8">
        <CourseHeader
          title={course.title}
          description={course.description}
          onBack={() => navigate(-1)}
        />

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <VideoSection
              currentTopic={currentTopic}
              courseId={courseId}
              enrollmentId={enrollmentId}
              localProgress={localProgress}
              progress={restProgress}
              setLocalProgress={setLocalProgress}
              course={course}
            />

            <Card className="border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {t('course.overview.title')}
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">
                  {t('course.overview.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-xl">
                  <CourseStats
                    syllabus={course.syllabus}
                    level={course.level}
                    language={course.language}
                    estimatedHours={course.estimatedHours}
                  />
                </div>

                <CourseContent
                  course={course}
                  progress={restProgress}
                  canAccessQuiz={canAccessQuiz}
                  handleTopicSelect={handleTopicSelect}
                  onQuizCompleted={handleQuizCompleted}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <CourseProgress
              progress={restProgress}
              requirements={course?.requirements}
              learningObjectives={course?.learningObjectives}
            />
          </div>
        </div>
      </div>

      <VideoDialog
        isOpen={isVideoDialogOpen}
        onOpenChange={setIsVideoDialogOpen}
        currentTopic={currentTopic}
        courseId={courseId}
        enrollmentId={enrollmentId}
        localProgress={localProgress}
        setLocalProgress={setLocalProgress}
      />

      <div className="fixed bottom-8 right-8 z-50">
        <div className="relative group">
          {/* Animated background glow */}
          <div
            className={`absolute inset-0 rounded-full transition-all duration-500 ${
              hasNewRecommendations 
                ? "bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 opacity-90 blur-md animate-pulse" 
                : "bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 opacity-75 blur-sm"
            } group-hover:opacity-100`}
            style={{
              animation: hasNewRecommendations 
                ? "pulse 1.5s infinite, rotate 8s linear infinite" 
                : "pulse 3s infinite, rotate 8s linear infinite",
              zIndex: -1,
            }}
          ></div>

          {/* Notification indicator */}
          {hasNewRecommendations && (
            <div className="absolute -top-2 -right-2 z-20">
              <div className="relative">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                  <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                </div>
                <div className="absolute inset-0 w-6 h-6 bg-red-400 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
          )}

          <button
            className={`relative text-white px-6 py-4 rounded-full transform transition-all duration-300 flex items-center space-x-3 backdrop-blur-sm border border-white/20 ${
              hasNewRecommendations
                ? "bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 hover:scale-110 animate-pulse"
                : "bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:scale-105"
            }`}
            onClick={openChat}
          >
            <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-300 ${
              hasNewRecommendations 
                ? "bg-gradient-to-r from-orange-400 to-pink-500"
                : "bg-gradient-to-r from-blue-400 to-indigo-500"
            }`}></div>
            
            {/* AI Icon with enhanced animations */}
            <div className="relative z-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className={`w-6 h-6 transition-transform duration-300 ${
                  hasNewRecommendations 
                    ? "animate-bounce group-hover:rotate-45" 
                    : "group-hover:rotate-12"
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20.25c4.97 0 9-3.806 9-8.5s-4.03-8.5-9-8.5-9 3.806-9 8.5c0 1.763.65 3.398 1.733 4.711-.465 1.912-1.588 2.751-1.795 2.87a.478.478 0 00.226.892c1.315-.124 3.102-.664 4.507-2.004A10.26 10.26 0 0012 20.25z"
                />
              </svg>
              
              {/* Sparkle effect for new recommendations */}
              {hasNewRecommendations && (
                <>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
                  <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                  <div className="absolute top-0 left-1 w-1 h-1 bg-yellow-200 rounded-full animate-bounce"></div>
                </>
              )}
            </div>
            
            <span className={`relative z-10 font-semibold tracking-wide transition-all duration-300 ${
              hasNewRecommendations ? "animate-pulse" : ""
            }`}>
              {hasNewRecommendations ? "🎯 AI Insights!" : t('course.chatAssistant')}
            </span>
          </button>

          {/* Floating text for new recommendations */}
          {hasNewRecommendations && (
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-3 py-1 rounded-lg shadow-lg text-sm font-medium animate-bounce whitespace-nowrap">
              New AI recommendations!
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
            </div>
          )}
        </div>
      </div>

      <AIChatDialog
        isOpen={isChatOpen}
        onClose={closeChat}
        recommendations={pendingRecommendations}
        courseId={courseId}
        userEmail={userEmail}
        progressData={restProgress}
      />

    </div>
  );
};

export default CourseLearning;