import React from 'react';
import { PlayCircle, FileText, CheckCircle2, ChevronRight } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../../components/ui/accordion';
import { Badge } from '../../../components/ui/badge';
import { useTranslation } from 'react-i18next';

// Sub-component for course description
const CourseDescription = ({ description }) => {
  const { t } = useTranslation();
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="long-description" className="border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <AccordionTrigger className="px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-slate-700 dark:hover:to-slate-600 rounded-t-xl transition-all duration-300">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {t('course.description.title')}
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6">
          <div
            className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: description,
            }}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

// Sub-component for individual topic
const TopicItem = ({ topic, progress, canAccessQuiz, handleTopicSelect }) => {
  const { t } = useTranslation();
  const isCompleted = progress?.progress?.topicsProgress?.update?.[topic.id]?.videoProgress >= 100;
  const videoProgress = progress?.progress?.topicsProgress?.update?.[topic.id]?.videoProgress || 0;

  return (
    <div className="group relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div
          className="flex items-center gap-3 cursor-pointer flex-1 group-hover:translate-x-1 transition-transform duration-300"
          onClick={() => handleTopicSelect(topic)}
        >
          <div className={`p-2 rounded-lg transition-all duration-300 ${isCompleted
            ? 'bg-gradient-to-r from-green-500 to-green-600'
            : 'bg-gradient-to-r from-blue-500 to-blue-600'
            }`}>
            {isCompleted ? (
              <CheckCircle2 className="h-4 w-4 text-white" />
            ) : (
              <PlayCircle className="h-4 w-4 text-white" />
            )}
          </div>
          <div className="flex-1">
            <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
              {topic.title}
            </span>
            {videoProgress > 0 && videoProgress < 100 && (
              <div className="mt-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${videoProgress}%` }}
                ></div>
              </div>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
        </div>
        {topic.quiz && (
          <div className="flex items-center gap-2 ml-4">
            <div className="p-1.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
              <FileText className="h-3 w-3 text-white" />
            </div>
            {progress?.progress?.topicsProgress?.update?.[topic.id]?.quizCompleted ? (
              <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                {t('course.sidebar.completed')}
              </Badge>
            ) : canAccessQuiz(topic.id) ? (
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                {t('course.quizzes.available')}
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-0">
                {t('course.sidebar.watchVideo', { progress: videoProgress })}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Main CourseContent component
export const CourseContent = ({ course, progress, canAccessQuiz, handleTopicSelect }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {t('course.courseContent')}
        </h3>
      </div>

      {course.longDescription && (
        <div className="mb-6">
          <CourseDescription description={course.longDescription} />
        </div>
      )}

      <Accordion type="single" collapsible className="w-full space-y-4">
        {course.syllabus?.map((section, index) => (
          <AccordionItem key={index} value={`section-${index}`} className="border border-slate-200 dark:border-slate-700 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm overflow-hidden">
            <AccordionTrigger className="px-6 py-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 rounded-t-xl">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-left">
                  {section.title}
                </span>
                <Badge className="bg-gradient-to-r from-slate-500 to-slate-600 text-white border-0">
                  {t('course.syllabus.lectures', { count: section.topics?.length || 0 })}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-3 pt-2">
                {section.topics?.map((topic, topicIndex) => (
                  <TopicItem
                    key={topicIndex}
                    topic={topic}
                    progress={progress}
                    canAccessQuiz={canAccessQuiz}
                    handleTopicSelect={handleTopicSelect}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default CourseContent;