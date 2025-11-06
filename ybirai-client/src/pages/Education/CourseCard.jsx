import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { displayLanguage } = useLanguage();

  const handleCourseClick = () => {
    navigate(`/${displayLanguage}/education/course/${course.id}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div
      onClick={handleCourseClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden"
    >
      <div className="relative h-48">
        <img
          src={course.thumbnailUrl ? `https://${course.thumbnailUrl}` : 'https://via.placeholder.com/400x200'}
          alt={course.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/400x200';
          }}
        />
        <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
          {formatPrice(course.price)}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
          {course.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {course.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-sm flex items-center gap-1"
            >
              <Tag size={14} />
              {tag}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            {course.syllabus?.[0]?.duration || t('course.duration.notSpecified')}
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} />
            {t('course.instructors', { count: course.instructorsCount })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;