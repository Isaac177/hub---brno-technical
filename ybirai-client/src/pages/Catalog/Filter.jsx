import React, { useState } from 'react'
import { ChevronDown, ChevronUp, DollarSign, Clock, Award, Building, Tag } from 'lucide-react'

const Filter = ({
    onPriceChange,
    onDurationChange,
    onLevelChange,
    onCategoryChange,
    onSchoolChange,
    categories,
    schools,
    t
}) => {
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [minDuration, setMinDuration] = useState('')
    const [maxDuration, setMaxDuration] = useState('')
    const [selectedLevels, setSelectedLevels] = useState([])
    const [selectedCategories, setSelectedCategories] = useState([])
    const [selectedSchools, setSelectedSchools] = useState([])

    const [openSections, setOpenSections] = useState({
        price: true,
        duration: false,
        level: false,
        category: false,
        school: false
    })

    const levels = [
        { value: 'beginner', label: t('filter.levels.beginner') },
        { value: 'intermediate', label: t('filter.levels.intermediate') },
        { value: 'advanced', label: t('filter.levels.advanced') }
    ]

    const toggleSection = (section) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    const handlePriceSubmit = () => {
        const min = minPrice ? parseFloat(minPrice) : 0
        const max = maxPrice ? parseFloat(maxPrice) : Infinity
        onPriceChange(min, max)
    }

    const handleDurationSubmit = () => {
        const min = minDuration ? parseInt(minDuration) : 0
        const max = maxDuration ? parseInt(maxDuration) : Infinity
        onDurationChange(min, max)
    }

    const handleLevelToggle = (level) => {
        const newLevels = selectedLevels.includes(level)
            ? selectedLevels.filter(l => l !== level)
            : [...selectedLevels, level]
        setSelectedLevels(newLevels)
        onLevelChange(newLevels)
    }

    const handleCategoryToggle = (categoryId) => {
        const newCategories = selectedCategories.includes(categoryId)
            ? selectedCategories.filter(c => c !== categoryId)
            : [...selectedCategories, categoryId]
        setSelectedCategories(newCategories)
        onCategoryChange(newCategories)
    }

    const handleSchoolToggle = (schoolId) => {
        const newSchools = selectedSchools.includes(schoolId)
            ? selectedSchools.filter(s => s !== schoolId)
            : [...selectedSchools, schoolId]
        setSelectedSchools(newSchools)
        onSchoolChange(newSchools)
    }

    const FilterSection = ({ title, icon: Icon, isOpen, onToggle, children }) => (
        <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg px-2"
            >
                <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900 dark:text-white">{title}</span>
                </div>
                <div className={`transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
            </button>

            {/* Animated Content Container */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen
                ? 'max-h-[500px] opacity-100 pb-4'
                : 'max-h-0 opacity-0 pb-0'
                }`}>
                <div className="px-2 transform transition-transform duration-300 ease-in-out" style={{
                    transform: isOpen ? 'translateY(0)' : 'translateY(-10px)'
                }}>
                    {children}
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-0">
            {/* Price Filter */}
            <FilterSection
                title={t('filter.price')}
                icon={DollarSign}
                isOpen={openSections.price}
                onToggle={() => toggleSection('price')}
            >
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            placeholder={t('filter.minPrice')}
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                        <input
                            type="number"
                            placeholder={t('filter.maxPrice')}
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                    <button
                        onClick={handlePriceSubmit}
                        className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium transform hover:scale-[1.02]"
                    >
                        {t('filter.apply')}
                    </button>
                </div>
            </FilterSection>

            {/* Duration Filter */}
            <FilterSection
                title={t('filter.duration')}
                icon={Clock}
                isOpen={openSections.duration}
                onToggle={() => toggleSection('duration')}
            >
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            placeholder={t('filter.minDuration')}
                            value={minDuration}
                            onChange={(e) => setMinDuration(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                        <input
                            type="number"
                            placeholder={t('filter.maxDuration')}
                            value={maxDuration}
                            onChange={(e) => setMaxDuration(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                    <button
                        onClick={handleDurationSubmit}
                        className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium transform hover:scale-[1.02]"
                    >
                        {t('filter.apply')}
                    </button>
                </div>
            </FilterSection>

            {/* Level Filter */}
            <FilterSection
                title={t('filter.difficulty')}
                icon={Award}
                isOpen={openSections.level}
                onToggle={() => toggleSection('level')}
            >
                <div className="space-y-2">
                    {levels.map((level, index) => (
                        <label
                            key={level.value}
                            className="flex items-center gap-2 cursor-pointer group transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-1"
                            style={{
                                animationDelay: `${index * 50}ms`
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={selectedLevels.includes(level.value)}
                                onChange={() => handleLevelToggle(level.value)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-all duration-200"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">
                                {level.label}
                            </span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Category Filter */}
            <FilterSection
                title={t('filter.categories')}
                icon={Tag}
                isOpen={openSections.category}
                onToggle={() => toggleSection('category')}
            >
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {categories.map((category, index) => (
                        <label
                            key={category.id}
                            className="flex items-center gap-2 cursor-pointer group transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-1"
                            style={{
                                animationDelay: `${index * 30}ms`
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={selectedCategories.includes(category.id)}
                                onChange={() => handleCategoryToggle(category.id)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-all duration-200"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200 line-clamp-1">
                                {category.name}
                            </span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* School Filter */}
            <FilterSection
                title={t('filter.schools')}
                icon={Building}
                isOpen={openSections.school}
                onToggle={() => toggleSection('school')}
            >
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {schools.map((school, index) => (
                        <label
                            key={school.id}
                            className="flex items-center gap-2 cursor-pointer group transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-1"
                            style={{
                                animationDelay: `${index * 30}ms`
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={selectedSchools.includes(school.id)}
                                onChange={() => handleSchoolToggle(school.id)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-all duration-200"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200 line-clamp-1">
                                {school.name}
                            </span>
                        </label>
                    ))}
                </div>
            </FilterSection>
        </div>
    )
}

export default Filter