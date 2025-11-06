import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Star, Clock, Play, Users, BookOpen } from "lucide-react"
import { authService } from '../../services/authService.js'
import { useTranslation } from 'react-i18next'
import { useEnrollInCourse } from '../../hooks/useEnrollment.js'
import { useEnrollment } from '../../contexts/EnrollmentContext.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { toast } from 'sonner'
import EnrollmentModal from '../../components/enrollment/EnrollmentModal.jsx'

const DEFAULT_COURSE_IMAGE = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"

const CourseCard = ({ course, onClick, viewMode = "grid" }) => {
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()
    const { user } = useAuth()
    const { isEnrolledInCourse, refreshEnrollmentData } = useEnrollment()
    const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
    const enrollMutation = useEnrollInCourse()

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
    } = course || {}

    const isEnrolled = isEnrolledInCourse(id)

    const handleEnrollClick = async (e) => {
        e.stopPropagation()

        if (isEnrolled) {
            navigate(`/${i18n.language}/course/${id}`)
            return
        }

        try {
            const { isSignedIn } = await authService.checkAuth()

            if (!isSignedIn) {
                sessionStorage.setItem('enrollmentIntent', id)
                navigate(`/${i18n.language}/login`)
                return
            }

            setShowEnrollmentModal(true)

        } catch (error) {
            console.error('Authentication check failed:', error)
            navigate(`/${i18n.language}/login`)
        }
    }

    const handleEnrollment = async (courseId) => {
        try {
            await enrollMutation.mutateAsync({
                courseId,
                language: i18n.language
            })

            refreshEnrollmentData()

            toast.success(t('courseCard.enrollmentDialog.success'))

            navigate(`/${i18n.language}/course/${courseId}`)
        } catch (error) {
            console.error('Enrollment failed:', error)
            toast.error(error.message || t('courseCard.enrollmentDialog.error.enrollmentError'))
            throw error
        }
    }

    const handleCardClick = () => {
        if (onClick) {
            onClick()
        } else {
            navigate(`/${i18n.language}/catalog/${id}`)
        }
    }

    const calculateTotalDuration = () => {
        if (!syllabus || syllabus.length === 0) return null

        const totalMinutes = syllabus.reduce((total, section) => {
            if (!section.duration) return total
            const [hours, minutes] = section.duration.split(':').map(Number)
            return total + (hours * 60) + minutes
        }, 0)

        if (totalMinutes < 60) {
            return `${totalMinutes}m`
        } else {
            const hours = Math.floor(totalMinutes / 60)
            const mins = totalMinutes % 60
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
        }
    }

    const getTotalLectures = () => {
        if (!syllabus || syllabus.length === 0) return 0
        return syllabus.reduce((total, section) => total + (section.lectures || 0), 0)
    }

    const displayImage = thumbnailUrl || featuredImageUrl || DEFAULT_COURSE_IMAGE
    const totalDuration = calculateTotalDuration()
    const totalLectures = getTotalLectures()
    const primaryTag = tags.length > 0 ? tags[0] : language?.toLowerCase()
    const displayPrice = price !== undefined && price !== null ? `${price} ₸` : t('courseCard.free')

    const getButtonText = () => {
        if (isEnrolled) {
            return t('courseCard.continueLearning') || 'Continue Learning'
        }
        return t('courseCard.enroll')
    }

    const getButtonStyle = () => {
        if (isEnrolled) {
            return "w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02]"
        }
        return "w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02]"
    }

    if (viewMode === "list") {
        return (
            <>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 transform hover:scale-[1.01]">
                    <div className="flex flex-col md:flex-row">
                        <div className="relative md:w-80 h-48 md:h-40 flex-shrink-0" onClick={handleCardClick}>
                            <img
                                src={displayImage}
                                alt={title || 'Course image'}
                                className="w-full h-full object-cover cursor-pointer"
                                onError={(e) => {
                                    e.target.src = DEFAULT_COURSE_IMAGE
                                }}
                            />
                            {primaryTag && (
                                <div className="absolute top-2 left-2">
                                    <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium capitalize">
                                        {primaryTag}
                                    </span>
                                </div>
                            )}
                            {price === 0 && (
                                <div className="absolute top-2 right-2">
                                    <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                                        {t('courseCard.free')}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 p-4 flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 cursor-pointer" onClick={handleCardClick}>
                                    {title || 'Course Title'}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2 cursor-pointer" onClick={handleCardClick}>
                                    {description || 'Course description not available'}
                                </p>

                                <div className="flex items-center gap-4 mb-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                                    {totalDuration && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{totalDuration}</span>
                                        </div>
                                    )}
                                    {totalLectures > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Play className="w-3 h-3" />
                                            <span>{totalLectures} {t('courseCard.lessons')}</span>
                                        </div>
                                    )}
                                    {syllabus.length > 0 && (
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="w-3 h-3" />
                                            <span>{syllabus.length} {t('courseCard.modules')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-4">
                                    <span className="text-xl font-bold text-green-600">
                                        {displayPrice}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">4.5</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {isEnrolled && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                            ✓ {t('courseCard.enrolled') || 'Enrolled'}
                                        </span>
                                    )}

                                    <button
                                        onClick={handleEnrollClick}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02] text-sm"
                                    >
                                        {getButtonText()}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {!isEnrolled && (
                    <EnrollmentModal
                        isOpen={showEnrollmentModal}
                        onClose={() => setShowEnrollmentModal(false)}
                        course={course}
                        onEnroll={handleEnrollment}
                        isLoading={enrollMutation.isLoading}
                    />
                )}
            </>
        )
    }

    // Default grid view - improved layout
    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden border border-gray-100 dark:border-gray-700 h-full flex flex-col min-h-[520px]">
                {/* Image Section */}
                <div className="relative overflow-hidden flex-shrink-0 h-48" onClick={handleCardClick}>
                    <img
                        src={displayImage}
                        alt={title || 'Course image'}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                            e.target.src = DEFAULT_COURSE_IMAGE
                        }}
                    />
                    {primaryTag && (
                        <div className="absolute top-3 left-3">
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium capitalize">
                                {primaryTag}
                            </span>
                        </div>
                    )}
                    {price === 0 && (
                        <div className="absolute top-3 right-3">
                            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                                {t('courseCard.free')}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content Section - grows to fill space */}
                <div className="p-5 flex flex-col flex-1">
                    {/* Title - Fixed height */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 leading-tight cursor-pointer h-14 overflow-hidden" onClick={handleCardClick}>
                        <span className="line-clamp-2">
                            {title || 'Course Title'}
                        </span>
                    </h3>

                    {/* Description - Fixed height */}
                    <div className="h-16 mb-4 overflow-hidden">
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed cursor-pointer line-clamp-3" onClick={handleCardClick}>
                            {description || 'Course description not available'}
                        </p>
                    </div>

                    {/* Course Stats - Fixed height */}
                    <div className="h-8 mb-4 overflow-hidden">
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                            {totalDuration && (
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{totalDuration}</span>
                                </div>
                            )}
                            {totalLectures > 0 && (
                                <div className="flex items-center gap-1">
                                    <Play className="w-3 h-3" />
                                    <span>{totalLectures} {t('courseCard.lessons')}</span>
                                </div>
                            )}
                            {syllabus.length > 0 && (
                                <div className="flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    <span>{syllabus.length} {t('courseCard.modules')}</span>
                                </div>
                            )}
                            {instructorsCount > 0 && (
                                <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    <span>{instructorsCount} {t('courseCard.instructors')}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tags - Fixed height */}
                    <div className="h-8 mb-4 overflow-hidden">
                        {tags.length > 1 && (
                            <div className="flex flex-wrap gap-2">
                                {tags.slice(1, 3).map((tag, index) => (
                                    <span
                                        key={index}
                                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs capitalize"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {tags.length > 3 && (
                                    <span className="text-gray-500 text-xs">+{tags.length - 2} {t('courseCard.more')}</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Price and Button Section - stays at bottom */}
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl font-bold text-green-600">
                                {displayPrice}
                            </span>
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">4.5</span>
                            </div>
                        </div>

                        {/* Enrollment Status Badge */}
                        {isEnrolled && (
                            <div className="mb-3">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    ✓ {t('courseCard.enrolled') || 'Enrolled'}
                                </span>
                            </div>
                        )}

                        {/* Enroll/Continue Button */}
                        <button
                            onClick={handleEnrollClick}
                            className={getButtonStyle()}
                        >
                            {getButtonText()}
                        </button>
                    </div>
                </div>
            </div>

            {/* Enrollment Modal - only show if not enrolled */}
            {!isEnrolled && (
                <EnrollmentModal
                    isOpen={showEnrollmentModal}
                    onClose={() => setShowEnrollmentModal(false)}
                    course={course}
                    onEnroll={handleEnrollment}
                    isLoading={enrollMutation.isLoading}
                />
            )}
        </>
    )
}

export default CourseCard
