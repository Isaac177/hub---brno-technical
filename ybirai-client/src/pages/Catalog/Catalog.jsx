import React, { useState, useMemo } from "react"
import { motion } from "framer-motion"
import CourseCard from "./CourseCard"
import Filter from "./Filter"
import Loader from '../../Loader'
import { useTranslation } from 'react-i18next'
import { useGetCourses } from "../../hooks/useGetCourses"
import { useGetCategories } from '../../hooks/useGetCategories'
import { useGetSchools } from '../../hooks/useGetSchools'
import { RefreshCw, AlertTriangle, Search, Grid, List } from "lucide-react"
import { useNavigate } from "react-router-dom"

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
}

const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.3,
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: index * 0.1,
            duration: 0.4,
            ease: "easeOut"
        }
    })
}

export default function Catalog() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const [language] = useState("ru")

    const { data: courses, isLoading: isLoadingCourses, isError: isErrorCourses, refetch: refetchCourses } = useGetCourses(language)
    const { data: categories, isLoading: isLoadingCategories, isError: isErrorCategories } = useGetCategories(language)
    const { data: schools, isLoading: isLoadingSchools, isError: isErrorSchools } = useGetSchools(language)

    const [priceFilter, setPriceFilter] = useState({ min: 0, max: Infinity })
    const [durationFilter, setDurationFilter] = useState({ min: 0, max: Infinity })
    const [selectedLevels, setSelectedLevels] = useState([])
    const [selectedCategories, setSelectedCategories] = useState([])
    const [selectedSchools, setSelectedSchools] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [viewMode, setViewMode] = useState("grid") // grid or list
    const coursesPerPage = 9

    const courseList = useMemo(() => {
        if (!courses) return [];
        return courses.content || [];
    }, [courses])

    const categoryMap = useMemo(() => {
        const map = new Map()
        if (!categories || !Array.isArray(categories)) return map
        categories.forEach(category => map.set(category.id, category))
        return map
    }, [categories])

    const schoolMap = useMemo(() => {
        const map = new Map()
        if (!schools || !Array.isArray(schools)) return map
        schools.forEach(school => map.set(school.id, school))
        return map
    }, [schools])

    const handlePriceChange = (min, max) => setPriceFilter({ min, max })
    const handleDurationChange = (min, max) => setDurationFilter({ min, max })
    const handleLevelChange = (levels) => setSelectedLevels(levels)
    const handleCategoryChange = (categories) => setSelectedCategories(categories)
    const handleSchoolChange = (schools) => setSelectedSchools(schools)

    const handleRefresh = () => {
        refetchCourses()
    }

    const resetFilters = () => {
        setPriceFilter({ min: 0, max: Infinity })
        setDurationFilter({ min: 0, max: Infinity })
        setSelectedLevels([])
        setSelectedCategories([])
        setSelectedSchools([])
        setSearchTerm("")
        setCurrentPage(1)
    }

    if (isLoadingCourses || isLoadingCategories || isLoadingSchools) {
        return (
            <motion.div
                className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center"
                initial="initial"
                animate="animate"
                variants={pageVariants}
                transition={pageTransition}
            >
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                    </div>
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{t('catalog.loadingCourses')}</p>
                </div>
            </motion.div>
        );
    }

    if (isErrorCourses || isErrorCategories || isErrorSchools) {
        return (
            <motion.div
                className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center"
                initial="initial"
                animate="animate"
                variants={pageVariants}
                transition={pageTransition}
            >
                <div className="flex flex-col items-center gap-6 text-center p-8">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('catalog.errorLoadingData')}</h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md">{t('catalog.tryRefreshing')}</p>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105"
                    >
                        <RefreshCw className="w-5 h-5" />
                        {t('catalog.refresh')}
                    </button>
                </div>
            </motion.div>
        );
    }

    if (!courses?.content?.length) {
        return (
            <motion.div
                className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center"
                initial="initial"
                animate="animate"
                variants={pageVariants}
                transition={pageTransition}
            >
                <div className="flex flex-col items-center gap-6 text-center p-8">
                    <div className="text-8xl text-gray-300 dark:text-gray-600">📚</div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('catalog.noCoursesFound')}</h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md">{t('catalog.noCoursesAvailable')}</p>
                </div>
            </motion.div>
        );
    }

    const filteredCourses = courseList.filter(course => {
        const coursePriceInRubles = course.price / 100;
        const matchesSearch = !searchTerm ||
            course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch &&
            (priceFilter.min === 0 || coursePriceInRubles >= priceFilter.min) &&
            (priceFilter.max === Infinity || coursePriceInRubles <= priceFilter.max) &&
            (durationFilter.min === 0 || course.durationInWeeks >= durationFilter.min) &&
            (durationFilter.max === Infinity || course.durationInWeeks <= durationFilter.max) &&
            (selectedLevels.length === 0 || selectedLevels.includes(course.level)) &&
            (selectedCategories.length === 0 || selectedCategories.includes(course.categoryId)) &&
            (selectedSchools.length === 0 || selectedSchools.includes(course.schoolId));
    })

    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage)
    const indexOfLastCourse = currentPage * coursesPerPage
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage
    const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse)

    return (
        <motion.div
            className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>

            <div className="relative z-10 py-8 px-4 md:px-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                {t('catalog.courseCatalog')}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {t('catalog.discoverCourses')}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                {viewMode === "grid" ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={handleRefresh}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                            >
                                <RefreshCw className="w-4 h-4" />
                                {t('catalog.refresh')}
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder={t('catalog.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Filter Sidebar */}
                    <div className="w-full lg:w-1/4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('catalog.filters')}</h3>
                                <button
                                    onClick={resetFilters}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    {t('catalog.clearAll')}
                                </button>
                            </div>
                            <Filter
                                onPriceChange={handlePriceChange}
                                onDurationChange={handleDurationChange}
                                onLevelChange={handleLevelChange}
                                onCategoryChange={handleCategoryChange}
                                onSchoolChange={handleSchoolChange}
                                categories={Array.isArray(categories) ? categories : []}
                                schools={Array.isArray(schools) ? schools : []}
                                t={t}
                            />
                        </div>
                    </div>

                    {/* Course Grid/List */}
                    <div className="flex-1">
                        {/* Results Info */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-gray-600 dark:text-gray-400">
                                {t('catalog.showing', {
                                    from: indexOfFirstCourse + 1,
                                    to: Math.min(indexOfLastCourse, filteredCourses.length),
                                    total: filteredCourses.length
                                })}
                            </p>
                            {filteredCourses.length > 0 && (
                                <p className="text-sm text-gray-500">
                                    {t('catalog.pageInfo', { current: currentPage, total: totalPages })}
                                </p>
                            )}
                        </div>

                        {filteredCourses.length === 0 ? (
                            <motion.div
                                className="text-center py-12"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="text-6xl text-gray-300 dark:text-gray-600 mb-4">🔍</div>
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('catalog.noCoursesFound')}</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">{t('catalog.tryAdjusting')}</p>
                                <button
                                    onClick={resetFilters}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {t('catalog.resetFilters')}
                                </button>
                            </motion.div>
                        ) : (
                            <div className={viewMode === "grid"
                                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 items-stretch"
                                : "space-y-4"
                            }>
                                {currentCourses.map((course, index) => {
                                    const school = schoolMap.get(course.schoolId)
                                    const category = categoryMap.get(course.categoryId)

                                    // Enhanced course data - exactly like in EducationSection
                                    const enhancedCourse = {
                                        ...course,
                                        school: school,
                                        category: category,
                                        // Ensure all required fields are present
                                        tags: course.tags || [],
                                        syllabus: course.syllabus || [],
                                        instructorsCount: course.instructorsCount || 1
                                    }

                                    return (
                                        <motion.div
                                            key={course.id}
                                            custom={index}
                                            initial="hidden"
                                            animate="visible"
                                            variants={itemVariants}
                                            className={viewMode === "list" ? "w-full" : "h-full"}
                                        >
                                            <CourseCard
                                                course={enhancedCourse}
                                                onClick={() => {
                                                    navigate(`/${i18n.language}/catalog/${course.id}`)
                                                }}
                                                viewMode={viewMode}
                                            />
                                        </motion.div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <motion.div
                                className="flex justify-center items-center gap-2 mt-12"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <button
                                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    {t('catalog.previous')}
                                </button>

                                {/* Page Numbers */}
                                <div className="flex gap-1">
                                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                        const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i));
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-10 h-10 rounded-lg font-medium transition-all duration-300 ${currentPage === pageNum
                                                    ? 'bg-blue-600 text-white'
                                                    : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    {t('catalog.next')}
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
