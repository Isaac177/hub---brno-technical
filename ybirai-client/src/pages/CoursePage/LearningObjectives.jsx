import React from 'react'
import { useTranslation } from 'react-i18next'
import { Target, CheckCircle, TrendingUp, Award } from 'lucide-react'

const LearningObjectives = ({ objectives = [] }) => {
    const { t } = useTranslation()

    if (!objectives || objectives.length === 0) {
        return null
    }

    const icons = [Target, CheckCircle, TrendingUp, Award]

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t('course.learningObjectives')}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        What you'll achieve after completing this course
                    </p>
                </div>
            </div>

            {/* Objectives Grid */}
            <div className="grid gap-4">
                {objectives.map((objective, index) => {
                    const IconComponent = icons[index % icons.length]

                    return (
                        <div
                            key={index}
                            className="group flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-800 hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300 hover:scale-[1.02]"
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                                    {objective}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Skills Badge */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <Award className="w-5 h-5" />
                    <span className="font-semibold">Skills you'll gain</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Complete this course to demonstrate your expertise and earn recognition
                </p>
            </div>
        </div>
    )
}

export default LearningObjectives
