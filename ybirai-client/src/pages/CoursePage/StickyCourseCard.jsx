import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { useEnrollment } from '../../contexts/EnrollmentContext'
import { useEnrollInCourse } from '../../hooks/useEnrollment'
import { authService } from '../../services/authService'
import { toast } from 'sonner'
import {
    Play,
    Download,
    Smartphone,
    Trophy,
    Infinity,
    Clock,
    BookOpen,
    Users,
    Shield,
    CheckCircle,
    Star,
    Share2,
    Heart,
    Loader2
} from 'lucide-react'
import EnrollmentModal from '../../components/enrollment/EnrollmentModal'

const StickyCourseCard = ({ course }) => {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { isEnrolledInCourse, refreshEnrollmentData } = useEnrollment()
    const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
    const [isWishlisted, setIsWishlisted] = useState(false)
    const enrollMutation = useEnrollInCourse()

    const {
        id,
        title,
        price,
        thumbnailUrl,
        featuredImageUrl,
        syllabus = [],
        courseContent = {},
        courseIncludes = []
    } = course

    const isEnrolled = isEnrolledInCourse(id)
    const displayImage = thumbnailUrl || featuredImageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop"
    const displayPrice = price !== undefined && price !== null ? `${price} ₸` : t('courseCard.free')

    const defaultIncludes = [
        { icon: Play, text: `${courseContent.lectures || 0} ${t('course.stickyCard.lectures')}` },
        { icon: Clock, text: courseContent.totalLength || '10h 30m' },
        { icon: Download, text: 'Downloadable resources' },
        { icon: Smartphone, text: 'Access on mobile and TV' },
        { icon: Infinity, text: 'Full lifetime access' },
        { icon: Trophy, text: t('course.stickyCard.certificate') },
        { icon: Shield, text: t('course.stickyCard.moneyBack') }
    ]

    const handleEnrollClick = async () => {
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

    const toggleWishlist = () => {
        setIsWishlisted(!isWishlisted)
        toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
    }

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Course Preview */}
                <div className="relative">
                    <img
                        src={displayImage}
                        alt={title}
                        className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <button className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300">
                            <Play className="w-6 h-6 text-blue-600 ml-1" />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Price Section */}
                    <div className="text-center mb-6">
                        <div className="text-4xl font-bold text-green-600 mb-2">{displayPrice}</div>
                        {price > 0 && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                {Math.round(price * 1.4)} ₸
                            </div>
                        )}
                        <div className="flex items-center justify-center gap-1 mt-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">4.8</span>
                            <span className="text-sm text-gray-500">(2,847 reviews)</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 mb-6">
                        <button
                            onClick={handleEnrollClick}
                            disabled={enrollMutation.isLoading}
                            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] ${isEnrolled
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                        >
                            {enrollMutation.isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : null}
                            {isEnrolled ? 'Continue Learning' : t('course.stickyCard.enrollNow')}
                        </button>

                        <div className="flex gap-2">
                            <button
                                onClick={toggleWishlist}
                                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-2 ${isWishlisted
                                        ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-red-400 text-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                                Wishlist
                            </button>
                            <button className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 text-gray-600 dark:text-gray-400 transition-all duration-300 flex items-center justify-center gap-2">
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                        </div>
                    </div>

                    {/* What's Included */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            {t('course.stickyCard.includes')}
                        </h3>
                        <div className="space-y-3">
                            {defaultIncludes.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 text-sm">
                                    <item.icon className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Course Stats */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-blue-600">{syllabus.length}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{t('course.stickyCard.sections')}</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-600">{courseContent.lectures || 0}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{t('course.stickyCard.lectures')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Money Back Guarantee */}
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                            <Shield className="w-5 h-5" />
                            <span className="font-medium">{t('course.stickyCard.moneyBack')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enrollment Modal */}
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

export default StickyCourseCard
