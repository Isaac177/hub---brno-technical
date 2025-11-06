import React from 'react'
import { Clock, BookOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function OrderCard() {
	const { t } = useTranslation();
	
	return (
		<div className="w-full mx-auto bg-white dark:bg-[#1a1f2c] rounded-lg shadow-lg overflow-hidden py-5 px-3 transition-all duration-200 hover:shadow-xl">
			<div className="p-4 flex items-start space-x-4">
				<div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center">
					<BookOpen className="w-8 h-8 text-gray-500 dark:text-gray-400" />
				</div>
				<div className="flex-grow">
					<div className="flex justify-between items-start">
						<div>
							<h2 className="text-lg font-semibold text-gray-800 dark:text-white">
								{t('orders.card.title')}
							</h2>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								{t('orders.card.school')}
							</p>
						</div>
						<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
							{t('orders.card.pay')}
						</button>
					</div>
					<div className="mt-4">
						<div className="flex items-center justify-between">
							<span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
								<Clock className="w-4 h-4" />
								{t('orders.card.duration', { minutes: 45 })}
							</span>
							<div className="flex-grow mx-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
								<div
									className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
									style={{ width: '37%' }}
								/>
							</div>
							<span className="text-xs text-gray-500 dark:text-gray-400">
								37%
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}