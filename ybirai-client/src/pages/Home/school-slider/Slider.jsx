import React from "react"
import { useTranslation } from 'react-i18next';
import { useGetSchools } from '../../../hooks/useGetSchools.js'
import SchoolCard from "./SchoolCard.jsx"
import SchoolCarousel from "./SchoolCarousel.jsx"

const ShimmerCard = () => (
    <div className="rounded-3xl bg-gray-100 h-80 w-56 md:h-[30rem] md:w-96 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer"></div>
        <div className="absolute z-10 p-8 h-full flex flex-col justify-between">
            <div>
                <div className="bg-gray-200 h-6 w-3/4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
            </div>
            <div className="space-y-2">
                <div className="bg-gray-200 h-3 w-full rounded"></div>
                <div className="bg-gray-200 h-3 w-4/5 rounded"></div>
                <div className="bg-gray-200 h-3 w-3/5 rounded"></div>
            </div>
        </div>
    </div>
)

const Slider = () => {
    const { t } = useTranslation();
    const language = localStorage.getItem('language') || 'ru'
    const { data: schools, isLoading, isError } = useGetSchools(language)

    if (isLoading) {
        const shimmerCards = Array.from({ length: 6 }, (_, index) => (
            <ShimmerCard key={index} />
        ))
        
        return (
            <div className="w-full h-full py-20">
                <div className="bg-gray-200 h-8 w-64 rounded mb-8 max-w-7xl pl-4 mx-auto"></div>
                <SchoolCarousel items={shimmerCards} />
            </div>
        )
    }

    if (isError) {
        return <div className="flex justify-center items-center h-[400px]"><p className="text-xl text-red-500 dark:text-red-400">{t('slider.error')}</p></div>
    }

    if (!schools || !Array.isArray(schools) || schools.length === 0) {
        return <div className="flex justify-center items-center h-[400px]"><p className="text-xl dark:text-white">{t('slider.noSchools')}</p></div>
    }

    const approvedSchools = schools.filter(school => school.status === 'APPROVED')

    if (approvedSchools.length === 0) {
        return <div className="flex justify-center items-center h-[400px]"><p className="text-xl dark:text-white">{t('slider.noApprovedSchools')}</p></div>
    }

    const cards = approvedSchools.map((school, index) => (
        <SchoolCard key={school.id} school={school} index={index} />
    ))

    return (
        <div className="w-full h-full py-20">
            <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans mb-8">
                {approvedSchools.length}+ {t('slider.topSchools')}
            </h2>
            <SchoolCarousel items={cards} />
        </div>
    )
}

export default Slider
