import { useState } from 'react'
import { Search, Filter as FilterIcon } from 'lucide-react'

export default function Filter({ placeholder }) {
	const [query, setQuery] = useState('')
	const [isOpen, setIsOpen] = useState(false)
	const [sortOption, setSortOption] = useState("Сортировать")

	const toggleDropdown = () => setIsOpen(!isOpen)

	const handleSortOption = (option) => {
		setSortOption(option)
		setIsOpen(false)
	}

	return (
		<div className="w-full mx-auto ">
			<div className="flex flex-col sm:flex-row gap-2">
				<div className="relative flex-grow">
					<input
						type="text"
						placeholder={placeholder}
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-input"
					/>
					<Search className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
				</div>
				<div className="relative">
					<button
						onClick={toggleDropdown}
						className="w-full sm:w-auto px-4 py-2 text-white bg-blue-500 rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex gap-2 items-center justify-between"
					>
						{sortOption}
						<FilterIcon />
					</button>
					{isOpen && (
						<div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-md shadow-lg z-10">
							<ul className="py-1">
								<li>
									<button
										onClick={() => handleSortOption("Новые")}
										className="block px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left"
									>
										Новые
									</button>
								</li>
								<li>
									<button
										onClick={() => handleSortOption("Старые")}
										className="block px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left"
									>
										Старые
									</button>
								</li>
							</ul>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}