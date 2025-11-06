import React from 'react'
import { useTranslation } from 'react-i18next'

export default function Modal({ setIsModalOpen }) {
	const { t } = useTranslation();
	const [data, setData] = React.useState({
		title: '',
		description: ''
	})

	const handleChange = (e) => {
		const { name, value } = e.target
		setData((prevData) => ({
			...prevData,
			[name]: value,
		}))
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		console.log(data)
	}

	return (
		<div className='fixed inset-0 flex items-center justify-center min-h-screen bg-blur z-[99]'>
			<form className='flex flex-col w-full max-w-[597px] bg-white p-5 rounded-lg gap-5' onSubmit={handleSubmit}>
				<h2 className='font-semibold text-3xl'>{t('modal.createTopic')}</h2>
				<input
					type="text"
					name="title"
					value={data.title}
					onChange={handleChange}
					placeholder={t('modal.topicName')}
					className='border-slate-200 border-1 p-2 rounded-xl px-3'
				/>
				<input
					type="text"
					name="description"
					value={data.description}
					onChange={handleChange}
					placeholder={t('modal.description')}
					className='border-slate-200 border-1 p-2 rounded-xl px-3'
				/>
				<div className='flex justify-end gap-5'>
					<button
						className='bg-red-500 text-white p-1 rounded-xl px-2'
						type='button'
						onClick={() => setIsModalOpen(false)}>
						{t('modal.cancel')}
					</button>
					<button className='bg-[#1E90FF] text-white p-1 rounded-xl px-2' type='submit'>
						{t('modal.submit')}
					</button>
				</div>
			</form>
		</div>
	)
}
