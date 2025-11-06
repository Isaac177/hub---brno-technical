import { MessageSquareMore } from 'lucide-react'
import fakeAvatarImage from '../../assets/download.jpg'
import replyCommentSideImage from '../../assets/group11.png'

export default function Comment({ isReply = false }) {
	return (
		<div className={`py-3 ${isReply ? 'ml-12 relative' : ''}`}>
			{isReply && (
				<img
					src={replyCommentSideImage}
					alt=""
					width={24}
					height={24}
					className="absolute -left-6 top-3"
				/>
			)}
			<div className='flex items-center gap-5'>
				<img
					src={fakeAvatarImage}
					alt=""
					width={50}
					height={50}
					className="rounded-full"
				/>
				<span className='text-sm font-semibold text-gray-900 dark:text-white'>Жамбыл Альтаир</span>
			</div>
			<p className='font-medium ml-1 mt-2 text-gray-800 dark:text-gray-200'>Оставайся позитивной. Ты справишься! Подумай о том, какой будет твоя жизнь, когда ты достигнешь среднего балла 4, и начни работать в этом направлении. Оставайся надеждой, ведь у тебя ещё есть шанс!
			</p>
			<button className='flex gap-1 items-center hover:bg-slate-100 dark:hover:bg-gray-700 py-1 rounded-full px-4 mt-2 text-gray-700 dark:text-gray-300'>
				<MessageSquareMore size={16} />
				<span>Ответить</span>
			</button>
		</div>
	)
}