import React from 'react'
import { Link } from 'react-router-dom'
import Modal from './modal'

export default function MenuComponent({ isMenuOpen, additionalStyles = '', close }) {
	const [isModalOpen, setIsModalOpen] = React.useState(false)

	return (
		<>
			{isModalOpen && <Modal setIsModalOpen={setIsModalOpen} />}
			<nav className={`${isMenuOpen ? 'fixed inset-0 bg-white overflow-y-auto' : 'hidden'} rounded-md md:relative md:block bg-light-nav dark:bg-dark-nav md:w-[300px] z-0 font-medium max-[764px]:relative mb-5 ${additionalStyles}`}>
				<div className='py-5 rounded-md bg-light-nav dark:bg-dark-nav'>
					<Link
						to={'/moderator/schools'}
						className="block px-5 py-3 hover:bg-light-hover dark:hover:bg-dark-hover"
						onClick={close}
					>
						Школы
					</Link>
					<Link
						to={'/moderator/schools/add'}
						className="block px-5 py-3 hover:bg-light-hover dark:hover:bg-dark-hover"
						onClick={close}
					>
						Добавить школу
					</Link>
					<Link
						to={'/moderator/courses/add'}
						className="block px-5 py-3 hover:bg-light-hover dark:hover:bg-dark-hover"
						onClick={close}
					>
						Добавить курс
					</Link>
					<Link
						to={'/moderator/students'}
						className="block px-5 py-3 hover:bg-light-hover dark:hover:bg-dark-hover"
						onClick={close}
					>
						Управление студентами
					</Link>
					<Link
						to={'/moderator/courses'}
						className="block px-5 py-3 hover:bg-light-hover dark:hover:bg-dark-hover"
						onClick={close}
					>
						Управление курсами
					</Link>
					<Link
						to={'/moderator/student-requests'}
						className="block px-5 py-3 hover:bg-light-hover dark:hover:bg-dark-hover"
						onClick={close}
					>
						Заявки студентов
					</Link>
				</div>
			</nav>
		</>
	)
}
