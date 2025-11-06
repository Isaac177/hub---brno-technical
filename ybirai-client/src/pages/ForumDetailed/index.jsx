import React from 'react'
import { ListFilter, X, Moon, Sun } from 'lucide-react'
import { useParams, useSearchParams } from 'react-router-dom'
import Header from '../../components/common/forum.header.jsx'
import MenuComponent from '../../components/common/forum.nav.jsx'
import MainContent from './MainContent'

const data = {
	categories: [
		{ id: 1, title: 'Языки программирования', views: 200, createdAt: '2022-01-01' },
		{ id: 2, title: 'Дизайн', views: 150, createdAt: '2022-01-02' },
		{ id: 4, title: 'Маркетинг', views: 180, createdAt: '2022-01-03' },
		{ id: 3, title: 'Книги', views: 180, createdAt: '2022-01-03' },
		{ id: 5, title: 'Фильмы', views: 180, createdAt: '2022-01-03' },
		{ id: 7, title: 'Другое', views: 180, createdAt: '2022-01-03' },
	],
	detailedData: {
		id: 2, title: 'Я хочу плакать.', commentCount: 9, creator: 'Lastname Surname', content: 'Heres how you can create the fake content, map over it, and render it within your Forum component using React: ', createdAt: '2022-01-02'
	},
}

export default function ForumDetailed() {
	const [isMenuOpen, setIsMenuOpen] = React.useState(false)
	const [articleId, setArticleId] = React.useState(useParams().id)

	const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

	return (
		<div className="min-h-screen bg-gradient-to-br from-light-from to-light-to dark:from-dark-from dark:to-dark-to">
			<Header />
			<main className="w-full pt-[150px] md:pt-[270px]">
				<div className="container mx-auto px-4 md:px-5">
					<div className="flex flex-col md:flex-row md:gap-10">
						<button onClick={toggleMenu} className="md:hidden mb-4 p-2 bg-blue-500 rounded max-[764px]:mt-16 flex items-center gap-5 font-medium text-white px-5 justify-center">
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
						<MenuComponent data={data} isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} additionalStyles='md:mt-20' />
						<MainContent data={data.detailedData} />
					</div>
				</div>
			</main>
		</div>
	)
}