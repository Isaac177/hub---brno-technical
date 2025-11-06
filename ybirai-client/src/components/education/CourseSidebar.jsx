import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from 'framer-motion';
import { cn } from "../../lib/utils";
import { useCourse } from "../../contexts/CourseContext";
import { useVideoPlayer } from "../../contexts/VideoPlayerContext";
import { useCourseProgress } from "../../contexts/CourseProgressContext";
import { useGetEnrolledCourses } from "../../hooks/useGetEnrolledCourses";
import { useGetCourse } from "../../hooks/useGetCourse";
import {
  BookOpen,
  GraduationCap,
  FileQuestion,
  BarChart3,
  PlayCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import VideoPlayer from "./VideoPlayer";
import { useTranslation } from "react-i18next";
import { useEnrollment } from "../../contexts/EnrollmentContext";

const CourseSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId } = useParams();
  const { selectedCourse: course, setSelectedCourse } = useCourse();
  const { data: courseData, isLoading: courseLoading, error: courseError } = useGetCourse(courseId);
  const { currentTopic, setCurrentTopic } = useVideoPlayer();
  const {
    getEnrollmentByCourseId,
    getProgressByCourseId,
    canAccessQuiz: canAccessQuizFromContext
  } = useEnrollment();
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const { t } = useTranslation();

  const enrollment = getEnrollmentByCourseId(courseId);
  const progressFromContext = getProgressByCourseId(courseId);

  useEffect(() => {
    if (courseData && (!course || course.id !== courseId)) {
      setSelectedCourse(courseData);
    }
  }, [courseData, course, setSelectedCourse, courseId]);

  const handleTopicClick = useCallback((topic) => {

    if (!topic.videoUrl) {
      console.warn('CourseSidebar: Topic has no video URL');
      return;
    }

    if (!courseId) {
      console.warn('CourseSidebar: No courseId available');
      return;
    }

    if (!enrollment?.id) {
      console.warn('CourseSidebar: No enrollmentId available');
      return;
    }

    if (setCurrentTopic && typeof setCurrentTopic === 'function') {
      setCurrentTopic(topic, courseId, enrollment.id);
      if (!window.location.pathname.includes('overview')) {
        navigate("overview");
      }
    }
  }, [courseId, enrollment?.id, setCurrentTopic, navigate]);

  const canAccessQuiz = useCallback((topicId) => {
    const hasAccess = canAccessQuizFromContext(courseId, topicId, 50);
    const topicProgress = progressFromContext?.topicsProgress?.[topicId];

    return hasAccess;
  }, [courseId, progressFromContext, canAccessQuizFromContext]);

  const getActiveRoute = () => {
    const pathname = location.pathname;
    if (pathname.endsWith('/overview')) return 'overview';
    if (pathname.endsWith('/syllabus')) return 'syllabus';
    if (pathname.endsWith('/quizzes')) return 'quizzes';
    if (pathname.endsWith('/progress')) return 'progress';
    return 'overview';
  };

  const currentCourse = course || courseData;

  const getQuizzesForTopic = useCallback((topicId) => {
    const quizzes = currentCourse?.quizzes?.filter((quiz) => quiz.topicId === topicId) || [];

    return quizzes;
  }, [currentCourse?.quizzes, currentCourse?.syllabus]);

  const getOrphanedQuizzes = useCallback(() => {
    const allTopicIds = currentCourse?.syllabus?.flatMap(section =>
      section.topics?.map(topic => topic.id) || []
    ) || [];

    const orphanedQuizzes = currentCourse?.quizzes?.filter(quiz =>
      !allTopicIds.includes(quiz.topicId)
    ) || [];

    return orphanedQuizzes;
  }, [currentCourse?.quizzes, currentCourse?.syllabus]);

  if (courseLoading) {
    return (
      <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 w-80 min-w-80 max-w-80 flex-shrink-0 border-none">
        <div className="p-6 flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (courseError) {
    return (
      <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 w-80 min-w-80 max-w-80 flex-shrink-0 border-none">
        <div className="p-6 text-center text-red-500">
          Error loading course: {courseError.message}
        </div>
      </div>
    );
  }

  if (!currentCourse && !courseLoading) {
    return (
      <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 w-80 min-w-80 max-w-80 flex-shrink-0 border-none">
        <div className="p-6 text-center text-muted-foreground">
          Course not found
        </div>
      </div>
    );
  }

  const activeRoute = getActiveRoute();

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 w-80 min-w-80 max-w-80 flex-shrink-0 border-none">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
            <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
              {t('course.sidebar.courseMenu')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
              {currentCourse?.title || t('course.sidebar.learningMaterials')}
            </p>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-4 pr-2">
            <div className="space-y-2">
              {[
                {
                  icon: BookOpen,
                  title: t('course.sidebar.overview'),
                  path: 'overview',
                  description: t('course.sidebar.overviewDescription')
                },
                {
                  icon: GraduationCap,
                  title: t('course.sidebar.syllabus'),
                  path: 'syllabus',
                  description: t('course.sidebar.syllabusDescription')
                },
                {
                  icon: FileQuestion,
                  title: t('course.sidebar.quizzes'),
                  path: 'quizzes',
                  description: t('course.sidebar.quizzesDescription')
                },
                {
                  icon: BarChart3,
                  title: t('course.sidebar.progress'),
                  path: 'progress',
                  description: t('course.sidebar.progressDescription')
                }
              ].map((item, index) => {
                const isActive = activeRoute === item.path;

                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "group flex flex-col gap-1 rounded-xl p-4 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent w-full text-left min-w-0",
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                        : ""
                    )}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="min-w-0 w-full"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          "p-2 rounded-lg transition-colors flex-shrink-0",
                          isActive
                            ? "bg-blue-100 dark:bg-blue-800/30"
                            : "bg-slate-100 dark:bg-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-600"
                        )}>
                          <item.icon className={cn(
                            "h-5 w-5 transition-colors",
                            isActive
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-600 dark:text-slate-300"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "font-semibold text-sm transition-colors break-words",
                            isActive
                              ? "text-blue-900 dark:text-blue-100"
                              : "text-slate-900 dark:text-slate-100"
                          )}>
                            {item.title}
                          </div>
                        </div>
                      </div>
                      <p className={cn(
                        "text-xs ml-11 transition-colors break-words leading-relaxed",
                        isActive
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-slate-500 dark:text-slate-400"
                      )}>
                        {item.description}
                      </p>
                    </motion.div>
                  </button>
                );
              })}
            </div>

            {currentCourse?.syllabus && currentCourse.syllabus.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 px-2 break-words">
                  {t('course.sidebar.courseContent')}
                </h3>
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {currentCourse.syllabus.map((section, sectionIndex) => (
                    <AccordionItem
                      key={section.id}
                      value={section.id}
                      className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
                    >
                      <AccordionTrigger className="text-sm hover:no-underline px-4 py-3 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3 w-full min-w-0">
                          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md flex-shrink-0">
                            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="font-medium text-slate-900 dark:text-slate-100 break-words pr-2">
                              {section.title}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 break-words">
                              {section.topics?.length || 0} topics • {section.duration}
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-2 py-2">
                        <div className="space-y-1">
                          {section.topics?.map((topic, topicIndex) => (
                            <div key={topic.id} className="space-y-1">
                              <button
                                className={cn(
                                  "w-full p-3 rounded-lg transition-all duration-200 text-left min-w-0",
                                  "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                                  currentTopic?.id === topic.id && "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                                )}
                                onClick={() => handleTopicClick(topic)}
                              >
                                <motion.div
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.05 * topicIndex }}
                                  className="min-w-0 w-full"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className={cn(
                                      "p-1.5 rounded-md transition-colors flex-shrink-0",
                                      currentTopic?.id === topic.id
                                        ? "bg-blue-100 dark:bg-blue-800/30"
                                        : "bg-slate-100 dark:bg-slate-700"
                                    )}>
                                      <PlayCircle className={cn(
                                        "h-4 w-4",
                                        currentTopic?.id === topic.id
                                          ? "text-blue-600 dark:text-blue-400"
                                          : "text-slate-600 dark:text-slate-300"
                                      )} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className={cn(
                                        "font-medium text-sm break-words pr-2",
                                        currentTopic?.id === topic.id
                                          ? "text-blue-900 dark:text-blue-100"
                                          : "text-slate-900 dark:text-slate-100"
                                      )}>
                                        {topic.title}
                                      </div>
                                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                        <Clock className="h-3 w-3 flex-shrink-0" />
                                        <span className="break-words">{topic.duration}</span>
                                      </div>
                                    </div>
                                    {topic.completed && (
                                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    )}
                                  </div>
                                </motion.div>
                              </button>

                              {/* Quiz buttons for this topic */}
                              {getQuizzesForTopic(topic.id).map((quiz) => {
                                const canAccess = canAccessQuiz(topic.id);
                                const isCompleted = progressFromContext?.topicsProgress?.[topic.id]?.quizCompleted;

                                console.log(`[Rendering] Quiz ${quiz.id} for topic ${topic.id}:`, {
                                  canAccess,
                                  isCompleted,
                                  topicId: topic.id,
                                  quizTitle: quiz.title,
                                  progressData: progressFromContext?.topicsProgress?.[topic.id],
                                  videoProgress: progressFromContext?.topicsProgress?.[topic.id]?.videoProgress,
                                  requiredProgress: 50,
                                  shouldRender: true
                                });

                                return (
                                  <button
                                    key={quiz.id}
                                    className={cn(
                                      "w-full ml-6 mt-1 p-2 rounded-lg",
                                      "flex items-center gap-2",
                                      "text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100",
                                      "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200",
                                      "border border-slate-200 dark:border-slate-700",
                                      isCompleted && "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
                                    )}
                                    onClick={() => {
                                      console.log('Quiz button clicked:', {
                                        quizId: quiz.id,
                                        topicId: topic.id,
                                        canAccess,
                                        isCompleted
                                      });
                                      navigate(`quizzes/${quiz.id}`, {
                                        state: { quiz },
                                      });
                                    }}
                                  >
                                    <div className={cn(
                                      "p-1 rounded-md flex-shrink-0",
                                      isCompleted
                                        ? "bg-green-100 dark:bg-green-800/30"
                                        : "bg-purple-100 dark:bg-purple-800/30"
                                    )}>
                                      <FileQuestion className={cn(
                                        "h-3 w-3",
                                        isCompleted ? "text-green-600 dark:text-green-400" : "text-purple-600 dark:text-purple-400"
                                      )} />
                                    </div>
                                    <span className={cn(
                                      "truncate flex-1 text-left",
                                      isCompleted && "text-green-700 dark:text-green-300"
                                    )}>
                                      {quiz.title}
                                    </span>
                                    {!canAccess && !isCompleted && (
                                      <Badge className="ml-auto text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-0">
                                        {t('course.sidebar.watchVideo', {
                                          progress: Math.round(progressFromContext?.topicsProgress?.[topic.id]?.videoProgress || 0)
                                        })}%
                                      </Badge>
                                    )}
                                    {canAccess && !isCompleted && (
                                      <Badge className="ml-auto text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-0">
                                        Available
                                      </Badge>
                                    )}
                                    {isCompleted && (
                                      <Badge className="ml-auto text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0">
                                        {t('course.sidebar.completed')}
                                      </Badge>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {/* Display orphaned quizzes (quizzes not linked to any topic) */}
                {getOrphanedQuizzes().length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 px-2 break-words">
                      Unlinked Quizzes
                    </h3>
                    <div className="space-y-1 px-2">
                      {getOrphanedQuizzes().map((quiz) => (
                        <button
                          key={quiz.id}
                          className="w-full p-2 rounded-lg flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 border border-slate-200 dark:border-slate-700"
                          onClick={() => {
                            console.log('Orphaned quiz button clicked:', {
                              quizId: quiz.id,
                              topicId: quiz.topicId
                            });
                            navigate(`quizzes/${quiz.id}`, {
                              state: { quiz },
                            });
                          }}
                        >
                          <div className="p-1 rounded-md flex-shrink-0 bg-orange-100 dark:bg-orange-800/30">
                            <FileQuestion className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                          </div>
                          <span className="truncate flex-1 text-left">
                            {quiz.title}
                          </span>
                          <Badge className="ml-auto text-xs bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 border-0">
                            Unlinked
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 px-2 break-words">
                {t('course.sidebar.courseStats')}
              </h3>
              <div className="space-y-2 px-2">
                <div className="flex items-center justify-between text-sm min-w-0 gap-2">
                  <span className="text-slate-500 dark:text-slate-400 break-words">{t('course.sidebar.courseDuration')}</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100 break-words text-right">
                    {currentCourse?.estimatedHours || t('course.sidebar.selfPaced')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm min-w-0 gap-2">
                  <span className="text-slate-500 dark:text-slate-400 break-words">{t('course.sidebar.sectionsCount')}</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100 text-right">
                    {currentCourse?.syllabus?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm min-w-0 gap-2">
                  <span className="text-slate-500 dark:text-slate-400 break-words">{t('course.sidebar.topicsCount')}</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100 text-right">
                    {currentCourse?.syllabus?.reduce(
                      (total, section) => total + (section.topics?.length || 0),
                      0
                    ) || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center break-words">
            Course Learning Platform
          </div>
        </div>
      </div>

      <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
        <DialogContent
          className="max-w-[90vw] w-[1200px] h-[80vh] max-h-[900px] p-6"
          showCloseButton={true}
        >
          <DialogHeader>
            <DialogTitle>{currentTopic?.title || t('course.sidebar.videoPlayer')}</DialogTitle>
            <DialogDescription className="sr-only">
              {t('course.sidebar.videoPlayerDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="h-[calc(100%-60px)] w-full">
            <VideoPlayer />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseSidebar;
