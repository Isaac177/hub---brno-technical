import React from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, PlayCircle, Timer, FileText, BookOpen, Target } from 'lucide-react';
import { useGetCourse } from '../../hooks/useGetCourse';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Badge } from '../ui/badge';
import { useTranslation } from 'react-i18next';

const CourseSyllabus = () => {
  const { courseId } = useParams();
  const { data: course, isLoading, error } = useGetCourse(courseId);
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="h-[50vh] w-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center animate-pulse">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                {t('course.loading')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="h-[50vh] w-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                {t('course.syllabus.loadError')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatDuration = (duration) => {
    if (!duration) return t('course.duration.notSpecified');
    return duration.split(":").slice(0, 2).join(":");
  };

  const getQuizzesForTopic = (topicId) => {
    return course.quizzes?.filter(quiz => quiz.topicId === topicId) || [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Course Header */}
        <Card className="mb-8 border-0 bg-white/90 backdrop-blur-sm dark:bg-slate-800/90 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 border-b border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {course.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2 text-slate-600 dark:text-slate-300">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">{t('course.syllabus.section')} {course.syllabus?.length || 0}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {course.description}
            </p>
          </CardContent>
        </Card>

        {/* Course Syllabus */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t('course.syllabus.title')}
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {course.syllabus?.map((section, index) => (
              <AccordionItem
                key={section.id || index}
                value={section.id || `section-${index}`}
                className="border border-slate-200 dark:border-slate-700 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 hover:no-underline">
                  <div className="flex items-center gap-4 text-left w-full">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-slate-800 dark:text-slate-200">
                        {section.title}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-1">
                        <div className="flex items-center gap-1">
                          <Timer className="h-4 w-4" />
                          <span>{formatDuration(section.duration)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <PlayCircle className="h-4 w-4" />
                          <span>{t('course.syllabus.lectures', { count: section.topics?.length || 0 })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-3 pt-2">
                    {section.topics?.map((topic, topicIndex) => (
                      <div
                        key={topic.id || topicIndex}
                        className="group relative bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg transition-all duration-300 group-hover:scale-110">
                              <PlayCircle className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                                {topic.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1 text-sm text-slate-600 dark:text-slate-400">
                                <Timer className="h-3 w-3" />
                                <span>{formatDuration(topic.duration)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {topic.preview && (
                              <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                                {t('course.syllabus.preview')}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Quizzes for this topic */}
                        {getQuizzesForTopic(topic.id).map((quiz) => (
                          <div
                            key={quiz.id}
                            className="flex items-center gap-3 mt-3 pl-11 p-3 bg-purple-50/50 dark:bg-slate-600/50 rounded-lg border border-purple-100 dark:border-slate-500"
                          >
                            <div className="p-1.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                              <FileText className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-medium text-slate-800 dark:text-slate-200 flex-1">
                              {quiz.title}
                            </span>
                            <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                              {t('course.syllabus.questions', { count: quiz.questions?.length || 0 })}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default CourseSyllabus;