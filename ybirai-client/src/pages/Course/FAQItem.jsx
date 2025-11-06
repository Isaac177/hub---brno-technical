import React from 'react';
import { ChevronDown, Play, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function FAQItem({ question, index, openQuestion, toggleQuestion, cardData, onVideoSelect }) {
  const { t } = useTranslation();
  const isOpen = openQuestion === index;

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    const [hours, minutes, seconds] = duration.split(':');
    if (hours === '00') {
      return `${minutes}:${seconds}`;
    }
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="border dark:border-gray-700/50 rounded-lg overflow-hidden">
      <button
        className="w-full text-left p-4 flex justify-between items-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => toggleQuestion(index)}
      >
        <span className="font-medium text-gray-900 dark:text-white">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''
            }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-white dark:bg-gray-800"
          >
            <div className="space-y-2 p-4">
              {cardData && cardData.length > 0 ? (
                cardData.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => onVideoSelect(topic)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-500 dark:group-hover:bg-blue-600 transition-colors">
                        <Play className="w-4 h-4 text-blue-500 dark:text-blue-400 group-hover:text-white transition-colors" />
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                        {topic.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(topic.duration)}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                  {t('course.videoPlayer.noContent')}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
