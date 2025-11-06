import React, { useState, useEffect } from 'react'
import { ListFilter, X, Moon, Sun } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import Header from '../../components/common/forum.header.jsx'
import MenuComponent from '../../components/common/forum.nav.jsx'
import MainContent from './MainContent'
import { motion } from 'framer-motion'
import { useGetPosts } from '../../hooks/useGetPosts.js'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../contexts/LanguageContext'

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

function DarkModeToggle() {
	const [darkMode, setDarkMode] = useState(false)
	const { t } = useTranslation()

	useEffect(() => {
		if (darkMode) {
			document.documentElement.classList.add('dark')
		} else {
			document.documentElement.classList.remove('dark')
		}
	}, [darkMode])

	return (
		<button
			onClick={() => setDarkMode(!darkMode)}
			className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
			aria-label={darkMode ? t('common.lightMode') : t('common.darkMode')}
		>
			{darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
		</button>
	)
}

export default function Forum() {
	const [thread, setThread] = useState('main')
	const [searchParams] = useSearchParams()
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const category = searchParams.get('category')
	const { t } = useTranslation()
	const { currentLanguage } = useLanguage()

	const { data: posts, isLoading, isError } = useGetPosts(currentLanguage)

	useEffect(() => {
		if (category === 'main' || category === 'popular' || typeof +category === 'number') {
			setThread(category)
		} else {
			setThread('main')
		}
	}, [category])

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen)
	}

	const discussionPosts = posts ? posts.filter(post => post.type === 'DISCUSSION') : []

	return (
		<motion.div
			className="page"
			initial="initial"
			animate="animate"
			exit="exit"
			variants={pageVariants}
			transition={pageTransition}
		>
			<div className="min-h-screen bg-gradient-to-br from-light-from to-light-to dark:from-dark-from dark:to-dark-to">
				<Header />

				<main className="w-full pt-[150px] md:pt-[270px]">
					<div className="container mx-auto px-4 md:px-5">
						<div className="flex flex-col md:items-start md:flex-row md:gap-10 md:pt-16">
							<button onClick={toggleMenu} className="mb-4 md:hidden p-2 bg-primary-500 backdrop-blur-sm rounded-lg max-[764px]:mt-16 flex items-center gap-5 font-medium text-white px-5 justify-center hover:bg-primary-400">
								{isMenuOpen
									? <>
										<X />
										<span>{t('common.close')}</span>
									</>
									: <>
										<ListFilter />
										<span>{t('forum.categories.selectCategory')}</span>
									</>}
							</button>

							<MenuComponent isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
							{isLoading ? (
								<div className="text-white">{t('forum.loading')}</div>
							) : isError ? (
								<div className="text-red-400">{t('forum.errors.loadingFailed')}</div>
							) : (
								<MainContent data={{ main: discussionPosts }} />
							)}
						</div>
					</div>
				</main>
			</div>
		</motion.div>
	)
}