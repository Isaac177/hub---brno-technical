import React from 'react'
import { Ellipsis, MessageSquareMore } from 'lucide-react'
import fakeAvatarImage from '../../assets/download.jpg'

export default function Article({ article }) {
	return (
		<>
			<div className="flex flex-col gap-3 border-b-2 pb-5">
				<div className="flex items-center gap-3">
					<img src={fakeAvatarImage} alt="" width={50} height={50} className="rounded-full w-[50px] h-[50px] md:w-[75px] md:h-[75px]" />
					<p className="font-medium text-sm md:text-lg">{article.creator}</p>
					<button className="ml-auto">
						<Ellipsis />
					</button>
				</div>
				<h2 className="text-lg md:text-xl font-medium">
					{article.title}
				</h2>
				<p className="text-sm md:text-base text-gray-400">
					{article.content}
				</p>
				<div className="flex items-center gap-1">
					<MessageSquareMore size={18} />
					<span className="text-xs md:text-sm">{article.commentCount}</span>
				</div>
			</div>
		</>
	)
}
