import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, LoaderCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactPlayer from 'react-player';
import { useTranslation } from 'react-i18next';
import { useGetCourse } from '../../hooks/useGetCourse';
import FAQItem from './FAQItem';

const pageVariants = {
  initial: {
    opacity: 0,
    filter: 'blur(20px)',
  },
  animate: {
    opacity: 1,
    filter: 'blur(0px)',
  },
  exit: {
    opacity: 0,
    filter: 'blur(20px)',
  },
};

const pageTransition = {
  duration: 0.6,
  ease: 'easeInOut',
};

export default function Course() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: course, isLoading, error } = useGetCourse(id);
  const [openSection, setOpenSection] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

  const handleVideoSelect = (topic) => {
    setSelectedVideo(topic);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderCircle className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {t('course.notFound')}
      </div>
    );
  }

  return (
    <motion.div
      className="page"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
    >
      <div className="min-h-screen bg-gradient-to-br from-light-from to-light-to dark:from-dark-from dark:to-dark-to py-5">
        <div className="flex flex-col container mx-auto">
          <div className="my-5">
            <Link
              className="text-gray-600 dark:text-gray-300 font-medium flex items-center gap-2 hover:text-gray-900 dark:hover:text-white transition-colors duration-100 mx-4 md:mx-0"
              to="/education"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>{t('course.backToCourses')}</span>
            </Link>
          </div>

          <div className="flex max-[768px]:flex-col items-start mb-5 gap-5 px-4 md:px-0">
            <div className="w-full lg:w-2/3 space-y-6">
              {/* Video Player */}
              <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
                {selectedVideo ? (
                  <div className="aspect-video">
                    <ReactPlayer
                      url={selectedVideo.videoUrl}
                      width="100%"
                      height="100%"
                      controls
                      playing
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('course.selectVideoPrompt')}
                    </p>
                  </div>
                )}
              </div>

              {/* Course Info */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {course?.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {course?.longDescription}
                </p>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {t('course.learningObjectives')}
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                    {course?.learningObjectives.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Course Syllabus */}
            <div className="w-full lg:w-1/3 bg-white dark:bg-gray-800 rounded-xl p-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                {t('course.courseContent')}
              </h2>
              <div className="space-y-2">
                {course?.syllabus.map((section, index) => (
                  <FAQItem
                    key={section.id}
                    question={section.title}
                    index={index}
                    openQuestion={openSection}
                    toggleQuestion={toggleSection}
                    cardData={section.topics || []}
                    onVideoSelect={handleVideoSelect}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}