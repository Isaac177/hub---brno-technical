import React from 'react'
import { ChevronLeft } from 'lucide-react'
import Tests from './Tests.jsx'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const pageVariants = {
	initial: {
		opacity: 0,
		filter: 'blur(20px)',
	},
	animate: {
		opacity: 1,
		filter: 'blur(0px)',
	},
	exit: {
		opacity: 0,
		filter: 'blur(20px)',
	},
}

const pageTransition = {
	duration: 0.6,
	ease: 'easeInOut',
}

export default function TestPage() {
	return (
		<motion.div
			className="page"
			initial="initial"
			animate="animate"
			exit="exit"
			variants={pageVariants}
			transition={pageTransition}
		>
			<main className="min-h-screen bg-gradient-to-br from-light-from to-light-to dark:from-dark-from dark:to-dark-to">
				<div className="container mx-auto flex items-start gap-10 pt-5">
					<div className="flex flex-col md:flex-row md:gap-10 w-full">
						<section className="flex flex-col gap-5 grow max-w-screen-lg mx-auto w-full">
							<div className="flex items-center justify-between mb-0 px-5">
								<Link
									to="/tests"
									className="text-gray-600 dark:text-gray-300 flex items-center hover:text-gray-900 dark:hover:text-white transition-colors duration-100"
								>
									<ChevronLeft className="w-5 h-5" />
									<span className="font-medium">Назад</span>
								</Link>
								<span className="text-sm text-gray-600 dark:text-gray-300">70% 1/25</span>
							</div>

							<div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-0 mx-5">
								<div
									className="bg-blue-500 dark:bg-blue-400 h-2.5 rounded-full transition-all duration-300"
									style={{ width: '70%' }}
								/>
							</div>

							<div className="md:w-full mx-auto max-[768px]:mx-5 bg-white dark:bg-[#1a1f2c] shadow-lg rounded-lg overflow-hidden min-h-96 flex items-center mt-5">
								<div className="p-6 md:flex grow">
									<div className="text-lg font-medium text-gray-900 dark:text-white mb-4 grow flex items-center">
										<p>Я могу отличить спор от ссоры</p>
									</div>
									<div className="space-y-3 grow">
										{["Никогда", "Всегда", "Иногда", "Часто"].map((option) => (
											<button
												key={option}
												className="w-full py-2.5 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
											>
												{option}
											</button>
										))}
									</div>
								</div>
							</div>
						</section>
					</div>
				</div>
			</main>
		</motion.div>
	)
}