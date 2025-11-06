import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Bold, Italic, List, AlignLeft } from "lucide-react"

export default function MainContent() {
	const [moduleName, setModuleName] = useState('')
	const [content, setContent] = useState('')

	return (
		<section className="max-w-4xl w-full mx-auto md:mt-14">
			<div className="flex justify-between items-center my-5">
				<Link
					to="/moderator/courses/add"
					className="flex items-center gap-2 hover:bg-gray-200 p-1 rounded-2xl px-3 transition-colors duration-200"
				>
					<ChevronLeft className="w-5 h-5" />
					<span>Назад</span>
				</Link>
				<h1 className="text-2xl font-semibold">Название курса</h1>
				<div className="w-16" />
			</div>

			<form className="space-y-4 md:space-y-6 p-5 rounded-lg mb-5 bg-white md:p-10">
				<div>
					<label htmlFor="moduleName" className="block mb-2 text-sm font-medium text-gray-900">
						Название модуля
					</label>
					<input
						type="text"
						id="moduleName"
						className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
						placeholder="Введите название модуля"
						value={moduleName}
						onChange={(e) => setModuleName(e.target.value)}
						required
					/>
				</div>

				<div>
					<label htmlFor="content" className="block mb-2 text-sm font-medium text-gray-900">
						Контент
					</label>
					<div className="mb-2 flex gap-2">
						<button type="button" className="p-2 hover:bg-gray-100 rounded">
							<Bold className="w-5 h-5" />
						</button>
						<button type="button" className="p-2 hover:bg-gray-100 rounded">
							<Italic className="w-5 h-5" />
						</button>
						<button type="button" className="p-2 hover:bg-gray-100 rounded">
							<List className="w-5 h-5" />
						</button>
						<button type="button" className="p-2 hover:bg-gray-100 rounded">
							<AlignLeft className="w-5 h-5" />
						</button>
					</div>
					<textarea
						id="content"
						rows={6}
						className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
						placeholder="Введите контент модуля"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						required
					/>
				</div>

				<div className="flex justify-end">
					<button
						type="button"
						className="w-32 mr-2 text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
					>
						Отменить
					</button>
					<button
						type="submit"
						className="w-32 ml-2 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
					>
						Далее
					</button>
				</div>
			</form>
		</section>
	)
}