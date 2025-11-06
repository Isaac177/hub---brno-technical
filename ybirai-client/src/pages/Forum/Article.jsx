import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MoreHorizontal, MessageSquare, Heart } from 'lucide-react'
import fakeAvatarImage from '../../assets/download.jpg'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../contexts/LanguageContext'
import { formatDate } from '../../utils/formateData'

export default function Article({ article }) {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const menuRef = useRef(null)
	const { t } = useTranslation()
	const { currentLanguage } = useLanguage()

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false)
		}
		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [])

	return (
		<div className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700/50 pb-5">
			<div className="flex items-center gap-3">
				<img src={fakeAvatarImage} alt="" width={50} height={50} className="rounded-full w-[50px] h-[50px] md:w-[75px] md:h-[75px]" />
				<p className="font-medium text-sm md:text-lg text-gray-900 dark:text-white">
					{article.commentList && article.commentList.length > 0 && article.commentList[0].userEmail
						? article.commentList[0].userEmail
						: t('forum.post.anonymous')}
				</p>
				<div className="ml-auto relative">
					<button
						className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
						onClick={() => setIsMenuOpen(!isMenuOpen)}
					>
						<MoreHorizontal className="w-5 h-5" />
					</button>
					{isMenuOpen && (
						<div
							ref={menuRef}
							className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1e2433] rounded-lg shadow-xl z-10 border border-gray-100 dark:border-gray-700/50"
						>
							<div className="py-1">
								<button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50">
									{t('forum.actions.report')}
								</button>
								<button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 text-red-500 dark:text-red-400">
									{t('forum.actions.delete')}
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
			<Link
				to={`/forum/${article.id}`}
				className="text-lg hover:underline md:text-xl font-medium text-gray-900 dark:text-white hover:text-blue-500 dark:hover:text-blue-400"
			>
				{article.title}
			</Link>
			<Link
				to={`/forum/${article.id}`}
				className="text-sm hover:underline md:text-base dark:text-white hover:text-blue-600 dark:hover:text-blue-300"
			>
				{article.content}
			</Link>
			<div className="flex items-center gap-4">
				<button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
					<Heart className="w-5 h-5" />
					<span className="text-xs md:text-sm">{article.likes.length}</span>
				</button>
				<button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
					<MessageSquare className="w-5 h-5" />
					<span className="text-xs md:text-sm">{article.commentList.length}</span>
				</button>
			</div>
		</div>
	)
}