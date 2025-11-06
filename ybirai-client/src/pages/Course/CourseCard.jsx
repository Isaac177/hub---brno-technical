import React from 'react'
import { Play, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function CourseCard({ card }) {
	const { t } = useTranslation();
	
	return (
		<div className="bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 w-full rounded-lg p-4 flex flex-col justify-center items-center transition-all duration-200 group cursor-pointer">
			<div className="relative h-52 w-full bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 overflow-hidden">
				<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
					<Play className="w-12 h-12 text-white" />
				</div>
			</div>
			<div className="w-full space-y-2">
				<p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
					<Clock className="w-4 h-4" />
					{card.time}
				</p>
				<p className="text-sm font-medium text-gray-900 dark:text-white">
					{card.title}
				</p>
			</div>
		</div>
	)
}