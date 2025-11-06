import React from 'react'
import MenuComponent from '../../components/common/moderator.nav.jsx'
import { Menu, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useUserData } from '../../contexts/UserContext.jsx'
import { useGetUserByEmail } from '../../hooks/useGetUserByEmail.js'

import fakeAvatarImage from '../../assets/download.jpg'

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

export default function Profile() {
	const [isMenuOpen, setIsMenuOpen] = React.useState(false)
	const { isLoading, error } = useGetUserByEmail()
	const { userData } = useUserData()
	const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

	const authState = useAuth()

	const { data: user, } = useGetUserByEmail()

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
						<button
							onClick={toggleMenu}
							className="md:hidden bg-blue-500 mb-4 p-2 rounded-lg mx-2 px-5 flex justify-center items-center gap-4 font-medium backdrop-blur-sm hover:bg-blue-400 text-white transition-colors"
						>
							<Menu className="w-5 h-5" />
							<span>Меню</span>
						</button>
						<MenuComponent isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />

						<section className="flex flex-col gap-5 grow mx-2">

							<div className="bg-white dark:bg-[#1a1f2c] shadow-lg rounded-lg p-6 flex flex-col space-y-6">
								<h1 className="font-semibold text-3xl dark:text-white text-black">Профиль</h1>
								<div className="flex flex-col sm:flex-row gap-5">
									<div className="relative group">
										<img
											src={fakeAvatarImage}
											alt="Profile avatar"
											className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover border-2 border-gray-100 dark:border-gray-700/50"
										/>
									</div>
									<div className="flex flex-col justify-center gap-3">
										<h2 className="text-2xl font-bold text-gray-900 dark:text-white">John Doa</h2>
										<Link
											to="/profile/edit"
											className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
										>
											Редактировать
										</Link>
									</div>
								</div>

								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
										Основая информация
									</h3>

									<div className="space-y-2">
										<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
											Email
										</p>
										<Link
											to="mailto:email@email.school.kz"
											className="inline-flex items-center gap-2 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:underline"
										>
											<Mail className="w-4 h-4" />
											email@email.school.kz
										</Link>
									</div>
								</div>

								<div className="pt-4 border-t border-gray-200 dark:border-gray-700/50">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div className="space-y-2">
											<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
												Joined Date
											</p>
											<p className="text-gray-900 dark:text-white">
												October 2023
											</p>
										</div>
										<div className="space-y-2">
											<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
												Last Active
											</p>
											<p className="text-gray-900 dark:text-white">
												Today
											</p>
										</div>
									</div>
								</div>
							</div>

							<div className="bg-white dark:bg-[#1a1f2c] shadow-lg rounded-lg p-6 mb-5">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
									Activity
								</h3>
								<div className="text-gray-500 dark:text-gray-400 text-sm">
									No recent activity
								</div>
							</div>
						</section>
					</div>
				</div>
			</main>
		</motion.div>
	)
}
