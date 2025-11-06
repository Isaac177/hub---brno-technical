import React from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import Modal from './modal'

export default function MenuComponent({ isMenuOpen, toggleMenu, additionalStyles = '' }) {
	const [isModalOpen, setIsModalOpen] = React.useState(false)

	const data = {
		categories: [
			{ id: 'main', title: 'Главная' },
			{ id: 'popular', title: 'Популярные темы' },
			{ id: 'technology', title: 'Технологии' },
			{ id: 'entertainment', title: 'Развлечения' },
			{ id: 'science', title: 'Наука' }
		]
	}

	return (
		<>
			{isModalOpen && <Modal setIsModalOpen={setIsModalOpen} />}
			<nav className={`${isMenuOpen ? 'fixed inset-0 bg-light-nav dark:bg-dark-nav overflow-y-auto z-[90]' : 'hidden'} md:relative md:block md:w-[300px]  font-medium max-[764px]:relative mb-5 ${additionalStyles}`}>
				<div className='py-5 rounded-md bg-light-nav dark:bg-dark-nav'>
					<Link
						to={'/forum?category=main'}
						className="block px-5 py-3 hover:bg-light-hover dark:hover:bg-dark-hover"
						onClick={toggleMenu}
					>
						Главная
					</Link>
					<Link
						to={'/forum/?category=popular'}
						className="block px-5 py-3 hover:bg-light-hover dark:hover:bg-dark-hover"
						onClick={toggleMenu}
					>
						Популярные темы
					</Link>
					<hr className='dark:border-slate-500' />
					<button
						className="px-4 py-3 hover:bg-light-hover dark:hover:bg-dark-hover flex items-center gap-3 w-full"
						onClick={() => {
							setIsModalOpen(true)
							toggleMenu()
						}}
					>
						<Plus />
						<span>Создать тему</span>
					</button>
					<hr className='dark:border-slate-500' />
					{data.categories && data.categories.map((thread) => (
						<Link
							to={`/forum?category=${thread.id}`}
							key={thread.id}
							className="block px-5 py-3 hover:bg-light-hover dark:hover:bg-dark-hover"
							onClick={toggleMenu}
						>
							{thread.title}
						</Link>
					))}
				</div>
			</nav>
		</>
	)
}
