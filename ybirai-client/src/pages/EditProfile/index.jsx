import React from 'react'
import MenuComponent from '../../components/common/moderator.nav'
import { Menu, X } from 'lucide-react'
import EditForm from './EditForm'
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

export default function EditProfile() {
	const [isMenuOpen, setIsMenuOpen] = React.useState(false)
	const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

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
							<EditForm />
						</section>
					</div>
				</div>
			</main>
		</motion.div>
	)
}