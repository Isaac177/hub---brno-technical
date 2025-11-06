import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import VideoPlayer from '../../../components/education/VidstackPlayer';
import { useTranslation } from 'react-i18next';

export const VideoDialog = ({
  isOpen,
  onOpenChange,
  currentTopic,
  courseId,
  enrollmentId,
  localProgress,
  setLocalProgress
}) => {
  const { t } = useTranslation();

  if (!currentTopic) return null;

  const handleProgressUpdate = (progress) => {
    setLocalProgress({
      ...localProgress,
      topicsProgress: {
        ...localProgress?.topicsProgress,
        [currentTopic.id]: {
          ...localProgress?.topicsProgress?.[currentTopic.id],
          videoProgress: progress
        }
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 bg-white/95 backdrop-blur-md dark:bg-slate-900/95 border-0 rounded-2xl overflow-hidden">
        <DialogHeader className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
            {currentTopic?.title || t('dialog.video.title')}
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 flex-1">
          <div className="aspect-video h-full bg-gradient-to-br from-black to-slate-900 rounded-xl overflow-hidden ring-2 ring-slate-200 dark:ring-slate-700">
            <VideoPlayer
              videoUrl={currentTopic.videoUrl}
              topicId={currentTopic.id}
              title={currentTopic.title}
              posterUrl={currentTopic.posterUrl}
              subtitles={currentTopic.subtitles}
              courseId={courseId}
              enrollmentId={enrollmentId}
              onProgressUpdate={handleProgressUpdate}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoDialog;