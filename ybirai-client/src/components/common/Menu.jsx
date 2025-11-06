import React from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'

export default function MenuComponent({ isMenuOpen, toggleMenu }) {
	const uniqueId = sessionStorage.getItem('userUniqueId');

	return (
		<>
			<nav className={`${isMenuOpen ? 'fixed inset-0 z-40 bg-white dark:bg-[#0D1626] overflow-y-auto' : 'hidden'} md:relative md:block md:w-[250px] font-medium z-[9999999]`}>
				<div className='bg-light-nav dark:bg-dark-nav py-5 rounded-md'>
					<div className="md:hidden flex justify-end p-4">
						<button onClick={toggleMenu}><X /></button>
					</div>
					<Link to={'/profile'} className="block px-5 py-3 hover:bg-light-hover dark:hover:bg-dark-hover">Мой профиль</Link>
					<Link to={`/${uniqueId}/education`} className="block px-5 py-3 hover:bg-light-hover dark:hover:bg-dark-hover">Мое обучение</Link>
					<Link to={'/tests'} className="block px-5 py-3 hover:bg-light-hover dark:hover:bg-dark-hover">Мои тесты</Link>
					<Link to={'/orders'} className="block px-5 py-3 hover:bg-light-hover dark:hover:bg-dark-hover">Мои заказы</Link>
					<Link to={'/help'} className="block px-5 py-3 hover:bg-light-hover dark:hover:bg-dark-hover">Помощь</Link>
				</div>
			</nav>
		</>
	)
}
