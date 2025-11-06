import { Send } from 'lucide-react'

export default function CommentForm() {
	return (
		<form className='flex gap-4'>
			<input
				type="text"
				placeholder='Написать комментарий'
				className='rounded-lg grow w-0 outline-none border border-gray-300 dark:border-gray-700 p-2 px-4 bg-white dark:bg-dark-input text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
			/>
			<button className='bg-blue-500 text-white hover:bg-blue-400 px-4 rounded-lg text-lg'>
				<Send />
			</button>
		</form>
	)
}