import React from 'react'
import { useTranslation } from 'react-i18next'
import { Star, Clock, Users, BookOpen, Award, Globe, Calendar } from 'lucide-react'

const CourseBanner = ({ courseData }) => {
    const { t } = useTranslation()

    const {
        title,
        description,
        price,
        tags = [],
        syllabus = [],
        language,
        featuredImageUrl,
        thumbnailUrl,
        instructor,
        courseContent
    } = courseData

    const displayImage = featuredImageUrl || thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=600&fit=crop"
    const displayPrice = price !== undefined && price !== null ? `${price} ₸` : t('courseCard.free')
    const totalLectures = syllabus.reduce((total, section) => total + (section.lectures || 0), 0)

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

            {/* Background Image Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url(${displayImage})` }}
            />

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 py-16">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="space-y-6">
                            {/* Bestseller Badge */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="inline-flex items-center gap-2 bg-yellow-500 text-yellow-900 text-sm font-semibold px-3 py-1 rounded-full">
                                    <Award className="w-4 h-4" />
                                    {t('course.banner.bestseller')}
                                </span>
                                {price === 0 && (
                                    <span className="inline-flex items-center bg-green-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                                        {t('courseCard.free')}
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                                {title}
                            </h1>

                            {/* Description */}
                            <p className="text-xl text-blue-100 leading-relaxed max-w-2xl">
                                {description}
                            </p>

                            {/* Course Stats */}
                            <div className="flex items-center gap-6 flex-wrap text-blue-100">
                                <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                    <span className="font-semibold">4.8</span>
                                    <span className="text-sm">(2,847 {t('course.reviews.reviews')})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    <span>12,459 {t('course.banner.students')}</span>
                                </div>
                                {totalLectures > 0 && (
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-5 h-5" />
                                        <span>{totalLectures} {t('courseCard.lessons')}</span>
                                    </div>
                                )}
                            </div>

                            {/* Additional Info */}
                            <div className="flex items-center gap-6 flex-wrap text-blue-200 text-sm">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    <span>{language || t('courseCard.language.notSpecified')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{t('course.banner.lastUpdated')} 11/2024</span>
                                </div>
                                {courseContent?.totalLength && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span>{courseContent.totalLength}</span>
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {tags.slice(0, 5).map((tag, index) => (
                                        <span
                                            key={index}
                                            className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm border border-white/30"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Instructor Info */}
                            {instructor && (
                                <div className="flex items-center gap-3 text-blue-100">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                        {instructor.name ? instructor.name.charAt(0) : 'I'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{instructor.name || 'Instructor'}</p>
                                        <p className="text-sm text-blue-200">{t('course.instructor.title')}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Content - Course Image */}
                        <div className="relative">
                            <div className="relative rounded-2xl overflow-hidden border-4 border-white/20 backdrop-blur-sm">
                                <img
                                    src={displayImage}
                                    alt={title}
                                    className="w-full h-80 lg:h-96 object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                                {/* Play Button Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <button className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 group">
                                        <div className="w-0 h-0 border-l-[16px] border-l-blue-600 border-y-[12px] border-y-transparent ml-1 group-hover:border-l-blue-700"></div>
                                    </button>
                                </div>
                            </div>

                            {/* Floating Price Card */}
                            <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400">{t('courseDetailsModal.coursePrice')}</p>
                                <p className="text-2xl font-bold text-green-600">{displayPrice}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CourseBanner
