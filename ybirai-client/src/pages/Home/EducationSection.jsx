import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from 'react-i18next';
import Loader from '../../Loader.jsx'
import { useGetCourses } from '../../hooks/useGetCourses.js'
import { useGetCategories } from '../../hooks/useGetCategories.js'
import CourseCard from "../Catalog/CourseCard.jsx"

const EducationSection = () => {
    const { t, i18n } = useTranslation();
    const [selectedCategory, setSelectedCategory] = useState(t('education.allDirections'))
    const [language] = useState("ru")
    const navigate = useNavigate()

    const size = 6

    const { data: coursesData, isLoading: isLoadingCourses, isError: isErrorCourses } = useGetCourses(language, 0, size)
    const { data: categories, isLoading: isLoadingCategories, isError: isErrorCategories } = useGetCategories(language)

    const uniqueCategories = useMemo(() => {
        if (!categories) return [t('education.allDirections')]
        return [t('education.allDirections'), ...categories.map(category => category.name)]
    }, [categories, t])

    const mobileCategories = uniqueCategories.slice(0, 4)
    const desktopCategories = uniqueCategories.slice(0, 3)

    if (isLoadingCourses || isLoadingCategories) {
        return <Loader />
    }

    if (isErrorCourses || isErrorCategories) {
        return <div className="text-primary-900 dark:text-primary-100">{t('education.errorLoading')}</div>
    }

    if (!coursesData || !coursesData.content || coursesData.content.length === 0) {
        return (
            <div className="text-center p-5 mt-3">
                <h2 className="text-3xl text-primary-100 dark:text-primary-900">{t('education.coursesUpdating')}</h2>
                <p className="text-lg text-primary-200 dark:text-primary-800 italic mt-5">
                    {t('education.newCourses')}
                </p>
            </div>
        )
    }

    const handleShowMoreCategories = () => navigate(`/${i18n.language}/catalog`)
    const handleSeeMore = () => navigate(`/${i18n.language}/catalog`)

    return (
        <div className="py-8 md:py-16 px-4 md:px-8 bg-secondary-100 dark:bg-secondary-200 dark:text-white" id='educationSection'>
            <h2 className="text-2xl md:text-4xl font-bold text-primary-900 dark:text-primary-100 mb-6 md:mb-10 text-center dark:text-white">
                {t('education.educationForEveryone')}
            </h2>

            <div className="flex md:hidden overflow-x-auto no-scrollbar space-x-4 mb-6 md:mb-8 px-2">
                {mobileCategories.map((category, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedCategory(category)}
                        className={`flex-shrink-0 px-4 py-2 whitespace-nowrap rounded-xl font-medium ${selectedCategory === category
                            ? "bg-primary-600 text-primary-100 dark:bg-primary-400 dark:text-primary-900"
                            : "bg-primary-100 text-primary-600 border border-primary-600 dark:bg-primary-800 dark:text-primary-200 dark:border-primary-400"
                            }`}
                    >
                        {category}
                    </button>
                ))}
                <button
                    onClick={handleShowMoreCategories}
                    className="flex-shrink-0 px-4 py-2 whitespace-nowrap rounded-lg bg-primary-100 text-primary-600 border border-primary-600 dark:bg-primary-800 dark:text-primary-200 dark:border-primary-400"
                >
                    {t('education.more')}
                </button>
            </div>

            <div className="hidden md:flex justify-center space-x-4 mb-6 md:mb-8">
                {desktopCategories.map((category, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-xl font-medium ${selectedCategory === category
                            ? "bg-primary-600 text-primary-100 dark:bg-primary-400 dark:text-primary-900"
                            : "bg-primary-100 text-primary-600 border border-primary-600 dark:bg-primary-800 dark:text-primary-200 dark:border-primary-400"
                            }`}
                    >
                        {category}
                    </button>
                ))}
                <button
                    onClick={handleShowMoreCategories}
                    className="px-4 py-2 rounded-xl bg-primary-100 text-primary-600 border border-primary-600 dark:bg-primary-800 dark:text-primary-200 dark:border-primary-400"
                >
                    {t('education.more')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
                {coursesData.content.slice(0, 6).map((course, index) => (
                    <CourseCard
                        key={course.id || index}
                        course={course}
                        onClick={() => {
                            navigate(`/${i18n.language}/catalog/${course.id}`)
                            console.log('Navigating to course:', course.id)
                        }}
                    />
                ))}
            </div>

            <div className="flex justify-center mt-8">
                <button
                    onClick={handleSeeMore}
                    className="bg-primary-600 text-primary-100 px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors duration-300 dark:bg-primary-500 dark:text-primary-900 dark:hover:bg-primary-400"
                >
                    {t('education.seeMoreCourses')}
                </button>
            </div>
        </div>
    )
}

export default EducationSection
