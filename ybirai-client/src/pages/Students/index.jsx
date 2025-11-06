import { ListFilter, X } from 'lucide-react'
import React from 'react'
import MenuComponent from '../../components/common/moderator.nav.jsx'
import MainContent from './MainContent.jsx'

export default function Students() {
	const [isMenuOpen, setIsMenuOpen] = React.useState(false)

	const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
	const close = () => setIsMenuOpen(false)

	return (
		<div className="min-h-screen bg-gradient-to-br from-light-from to-light-to dark:from-dark-from dark:to-dark-to">
			<main className="w-full">
				<div className="container mx-auto px-4 md:px-5">
					<div className="flex flex-col md:flex-row md:gap-10 md:items-start">
						<button onClick={toggleMenu} className="md:hidden mb-4 p-2 bg-blue-500 rounded max-[764px]:mt-5 flex items-center gap-5 font-medium text-white px-5 justify-center">
							{isMenuOpen
								? <>
									<X />
									<span>Закрыть</span>
								</>
								: <>
									<ListFilter />
									<span>Выбрать Категорию</span>
								</>}
						</button>
						<MenuComponent isMenuOpen={isMenuOpen} close={close} additionalStyles='md:mt-10' />
						<MainContent />
					</div>
				</div>
			</main>
		</div>
	)
}
