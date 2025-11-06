import { useState } from 'react'
import { ChevronDown, Phone } from 'lucide-react'
import Modal from './Modal'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export default function Content() {
	const { t } = useTranslation()
	const [openQuestion, setOpenQuestion] = useState(null)
	const [modalOpen, setModalOpen] = useState(false)

	const toggleQuestion = (index) => {
		setOpenQuestion(openQuestion === index ? null : index)
	}

	const faqQuestions = [
		"Как зарегистрироваться на сайте?",
		"Как восстановить пароль?",
		"Как изменить личные данные?",
		"Как связаться с поддержкой?",
		"Как удалить аккаунт?"
	]

	return (
		<>
			{modalOpen && <Modal setModalOpen={setModalOpen} />}
			<h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
				{t('help')}
			</h1>

			<a href="#" className="text-blue-500 dark:text-blue-400 hover:underline mb-1 block">
				{t('rules')}
			</a>

			<p className="text-gray-700 dark:text-gray-300">
				{t('help_text')}
			</p>
			<div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 mb-6 pb-1 border-b dark:border-gray-700">
				<Phone className="w-4 h-4" />
				<span>+7 705 956 72 14</span>
			</div>

			<h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">FAQ</h2>
			<div className="space-y-2">
				{faqQuestions.map((question, index) => (
					<div key={index} className="border dark:border-gray-700 rounded-lg overflow-hidden">
						<button
							className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
							onClick={() => toggleQuestion(index)}
						>
							<span className="text-gray-900 dark:text-white">{question}</span>
							<ChevronDown
								className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${openQuestion === index ? 'transform rotate-180' : ''
									}`}
							/>
						</button>
						<AnimatePresence>
							{openQuestion === index && (
								<motion.div
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: "auto", opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									transition={{ duration: 0.2 }}
									className="overflow-hidden"
								>
									<div className="p-4 bg-gray-50 dark:bg-gray-800/50">
										<p className="text-gray-700 dark:text-gray-300">
											{t('answer_placeholder')}
										</p>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				))}
			</div>

			<div className="mt-8">
				<h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
					{t('write_to_us')}
				</h2>
				<p className="mb-4 text-gray-700 dark:text-gray-300">
					{t('write_to_us_text')}
				</p>
				<button
					className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
					onClick={() => setModalOpen(true)}
				>
					{t('write_to_us_button')}
				</button>
			</div>
		</>
	)
}