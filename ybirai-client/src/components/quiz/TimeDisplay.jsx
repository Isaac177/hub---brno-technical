import React from 'react';
import { Clock, Timer } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const TimeDisplay = ({ seconds }) => {
  const { t } = useTranslation();

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative group">
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
              <Timer className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {t('quiz.timeDisplay.title')}
              </div>
              <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {formatTime(seconds)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

