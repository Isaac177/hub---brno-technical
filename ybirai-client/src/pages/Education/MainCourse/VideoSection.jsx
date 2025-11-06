import React from 'react';
import VidstackPlayer from '../../../components/education/VidstackPlayer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { useTranslation } from 'react-i18next';

const VideoSection = ({
  currentTopic,
  courseId,
  enrollmentId,
  localProgress,
  progress,
  setLocalProgress,
  course
}) => {
  const { t } = useTranslation();

  if (!currentTopic) {
    return (
      <Card className="border-0 bg-white/90 backdrop-blur-sm dark:bg-slate-800/90 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t('course.overview.currentLesson')}
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-300">
            {t('course.overview.selectLesson')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex items-center justify-center h-[400px] bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-500 transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-500">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">{t('videoPlayer.selectTopic')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white/90 backdrop-blur-sm dark:bg-slate-800/90 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {t('course.overview.currentLesson')}
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-300 font-medium">
          {currentTopic.title}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="aspect-video bg-gradient-to-br from-black to-slate-900 rounded-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
          <VidstackPlayer
            videoUrl={currentTopic.videoUrl}
            topicId={currentTopic.id}
            title={currentTopic.title}
            courseId={courseId}
            enrollmentId={enrollmentId}
            onProgressUpdate={setLocalProgress}
            course={course}
          />
        </div>
        {currentTopic.description && (
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-xl border border-blue-100 dark:border-slate-600">
            <h4 className="font-bold mb-3 text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
              {t('course.overview.lessonDescription')}
            </h4>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{currentTopic.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoSection;