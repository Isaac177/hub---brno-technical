import React from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import CourseBanner from './CourseBanner'
import StickyCourseCard from "./StickyCourseCard.jsx"
import LearningObjectives from "./LearningObjectives.jsx"
import ExpandableSyllabus from "./ExpandableSyllabus.jsx"
import CourseRequirements from "./CourseRequirements.jsx"
import CourseLongDescription from "./CourseLongDescription.jsx"
import CourseReviews from "./ReviewCard.jsx"
import CourseInstructor from "./CourseInstructor.jsx"
import { useGetCourseById } from '../../hooks/useGetCourses.js'
import { LoaderCircle } from "lucide-react"

const Single = () => {
    const { id } = useParams()
    const { t } = useTranslation()
    const language = localStorage.getItem('i18nextLng') || 'ru'
    const { data: courseData, isLoading, isError } = useGetCourseById(id)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center space-y-4">
                    <LoaderCircle className="animate-spin w-12 h-12 text-blue-600 mx-auto" />
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{t('course.loading')}</p>
                </div>
            </div>
        )
    }

    if (isError || !courseData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center space-y-4 p-8">
                    <div className="text-6xl text-gray-400 dark:text-gray-600">📚</div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('course.notFound')}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t('course.notFoundDescription')}</p>
                </div>
            </div>
        )
    }

    const enhancedCourseData = {
        ...courseData,
        title: courseData.title || '',
        description: courseData.description || '',
        longDescription: courseData.longDescription || '',
        price: courseData.price || 0,
        language: courseData.language || '',
        thumbnailUrl: courseData.thumbnailUrl || null,
        featuredImageUrl: courseData.featuredImageUrl || null,
        tags: courseData.tags || [],
        requirements: courseData.requirements || [],
        learningObjectives: courseData.learningObjectives || [],
        syllabus: courseData.syllabus || [],
        reviews: courseData.reviews || [],
        courseContent: {
            totalLength: courseData.courseContent?.totalLength || '0h 0m',
            sections: courseData.courseContent?.sections || 0,
            lectures: courseData.courseContent?.lectures || 0
        },
        courseIncludes: courseData.courseIncludes || [],
        instructor: courseData.instructor || {
            name: 'Instructor Name',
            bio: t('course.instructor.noInfo'),
            avatar: null
        }
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
            <CourseBanner courseData={enhancedCourseData} />

            <div className='relative'>
                <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>

                <div className='container mx-auto px-4 py-12 relative z-10'>
                    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
                        <div className="lg:w-2/3 space-y-8">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <LearningObjectives objectives={enhancedCourseData.learningObjectives} />
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <ExpandableSyllabus syllabus={enhancedCourseData.syllabus} />
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <CourseRequirements requirements={enhancedCourseData.requirements} />
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <CourseLongDescription description={enhancedCourseData.longDescription} />
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <CourseReviews reviews={enhancedCourseData.reviews} />
                            </div>
                        </div>

                        <div className="lg:w-1/3">
                            <div className="sticky top-8">
                                <StickyCourseCard course={enhancedCourseData} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Single
