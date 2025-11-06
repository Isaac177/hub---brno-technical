import React, { useState } from "react"
import ReactDOM from "react-dom"
import { useGetCourseByIdLocal } from '../../hooks/useGetCoursesLocal'
import { LoaderCircle } from "lucide-react"
import { useTranslation } from 'react-i18next'

export default function Component({ courseId, onClose = () => { }, onEnroll = () => { } }) {
  const { data: course, isLoading } = useGetCourseByIdLocal(courseId)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const { t } = useTranslation()

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const handleEnroll = async () => {
    setIsEnrolling(true)
    try {
      await onEnroll()
    } finally {
      setIsEnrolling(false)
    }
  }

  if (isLoading) return null

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white dark:bg-[#1e2433] rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label={t('courseDetailsModal.close')}
        >
          &times;
        </button>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{course.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              {t('courseDetailsModal.duration')}: {course.durationInWeeks} {t('courseDetailsModal.months')}
            </p>
          </div>
          <div className="md:w-1/2 mt-4 md:mt-0 md:text-right">
            <p className="text-gray-800 dark:text-white font-bold text-xl mb-4">
              {t('courseDetailsModal.coursePrice')}: {course.price}₸
            </p>
            <button
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isEnrolling && <LoaderCircle className="animate-spin -ml-1 mr-2 h-5 w-5" />}
              {t('courseDetailsModal.enrollButton')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}