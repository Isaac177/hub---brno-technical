import React, { useState } from 'react';
import { X, Clock, Users, BookOpen, Star, Check, Loader2 } from "lucide-react";
import { useTranslation } from 'react-i18next';

const EnrollmentModal = ({ isOpen, onClose, course, onEnroll, isLoading }) => {
  const { t } = useTranslation();
  const [isEnrolling, setIsEnrolling] = useState(false);

  if (!isOpen || !course) return null;

  const {
    id,
    title,
    description,
    price,
    thumbnailUrl,
    featuredImageUrl,
    language,
    tags = [],
    syllabus = [],
    instructorsCount = 0
  } = course;

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      await onEnroll(id);
      onClose();
    } catch (error) {
      console.error('Enrollment failed:', error);
    } finally {
      setIsEnrolling(false);
    }
  };

  // Calculate total duration from syllabus
  const calculateTotalDuration = () => {
    if (!syllabus || syllabus.length === 0) return null;

    const totalMinutes = syllabus.reduce((total, section) => {
      if (!section.duration) return total;
      const [hours, minutes] = section.duration.split(':').map(Number);
      return total + (hours * 60) + minutes;
    }, 0);

    if (totalMinutes < 60) {
      return `${totalMinutes}m`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
  };

  const getTotalLectures = () => {
    if (!syllabus || syllabus.length === 0) return 0;
    return syllabus.reduce((total, section) => total + (section.lectures || 0), 0);
  };

  const displayImage = thumbnailUrl || featuredImageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop";
  const totalDuration = calculateTotalDuration();
  const totalLectures = getTotalLectures();
  const displayPrice = price !== undefined && price !== null ? `${price} ₸` : t('courseCard.free');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="relative">
          <img
            src={displayImage}
            alt={title}
            className="w-full h-48 object-cover rounded-t-2xl"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          {price === 0 && (
            <div className="absolute top-4 left-4">
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {t('courseCard.free')}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title and Rating */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex-1">
              {title}
            </h2>
            <div className="flex items-center gap-1 ml-4">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 dark:text-gray-400">4.5</span>
            </div>
          </div>

          {/* Course Stats */}
          <div className="flex items-center gap-6 mb-6 text-sm text-gray-600 dark:text-gray-400">
            {totalDuration && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{totalDuration}</span>
              </div>
            )}
            {totalLectures > 0 && (
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{totalLectures} {t('courseCard.lessons')}</span>
              </div>
            )}
            {instructorsCount > 0 && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{instructorsCount} {t('courseCard.instructors')}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('courseCard.enrollmentDialog.description')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {description || t('courseCard.enrollmentDialog.notSpecified')}
            </p>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 6).map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm capitalize"
                  >
                    {tag}
                  </span>
                ))}
                {tags.length > 6 && (
                  <span className="text-gray-500 text-sm">+{tags.length - 6} {t('courseCard.more')}</span>
                )}
              </div>
            </div>
          )}

          {/* What you'll get */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              What you'll get:
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-gray-600 dark:text-gray-300">Lifetime access to course materials</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-gray-600 dark:text-gray-300">Certificate of completion</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-gray-600 dark:text-gray-300">Direct instructor support</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-gray-600 dark:text-gray-300">Access to course community</span>
              </div>
            </div>
          </div>

          {/* Price and Enroll */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Course Price</p>
                <p className="text-3xl font-bold text-green-600">{displayPrice}</p>
              </div>
              {price > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">30-day money back</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">guarantee</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isEnrolling || isLoading}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {t('courseCard.enrollmentDialog.cancel')}
              </button>
              <button
                onClick={handleEnroll}
                disabled={isEnrolling || isLoading}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {(isEnrolling || isLoading) ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('courseCard.enrollmentDialog.enrolling')}
                  </div>
                ) : (
                  t('courseCard.enrollmentDialog.confirmEnroll')
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentModal;
