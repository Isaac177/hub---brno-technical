import React from 'react'
import { Link } from 'react-router-dom'
import { Camera } from 'lucide-react'
import fakeAvatarImage from '../../assets/download.jpg'
import { useTranslation } from 'react-i18next'

export default function EditForm() {
	const { t } = useTranslation()
	const [fileName, setFileName] = React.useState(null)
	const [formData, setFormData] = React.useState({
		name: '',
		surname: '',
		email: '',
		file: null,
	})
	const fileInputRef = React.useRef(null)

	const handleClick = () => {
		fileInputRef.current?.click()
	}

	const handleFileChange = (event) => {
		const file = event.target.files?.[0]
		setFileName(file ? file.name : null)
		setFormData(prevData => ({ ...prevData, file }))
	}

	const handleInputChange = (event) => {
		const { id, value } = event.target
		setFormData(prevData => ({
			...prevData,
			[id]: value,
		}))
	}

	const handleSubmit = (event) => {
		event.preventDefault()
		const formDataToSubmit = new FormData()

		formDataToSubmit.append('name', formData.name)
		formDataToSubmit.append('surname', formData.surname)
		formDataToSubmit.append('email', formData.email)
		if (formData.file) {
			formDataToSubmit.append('file', formData.file)
		}
	}

	return (
		<form
			className="bg-white dark:bg-[#1a1f2c] shadow-lg rounded-lg p-6 flex flex-col space-y-6"
			onSubmit={handleSubmit}
		>
			<h1 className="font-semibold text-3xl dark:text-white text-black">{t('profile.edit.title')}</h1>

			<div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
				<div className="relative group">
					<img
						src={ fakeAvatarImage }
						alt={t('profile.edit.avatarAlt')}
						className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover border-2 border-gray-100 dark:border-gray-700/50"
					/>
					<button
						type="button"
						onClick={handleClick}
						className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
					>
						<Camera className="w-6 h-6 text-white" />
					</button>
				</div>
				<div className="flex flex-col gap-2">
					<h2 className="font-semibold text-xl text-gray-900 dark:text-white">{t('profile.edit.profilePhoto')}</h2>
					<button
						type="button"
						onClick={handleClick}
						className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
					>
						{t('profile.edit.addPhoto')}
					</button>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						onChange={handleFileChange}
						className="hidden"
					/>
					{fileName && (
						<p className="text-sm text-gray-500 dark:text-gray-400">
							{t('profile.edit.selectedFile')}: {fileName}
						</p>
					)}
				</div>
			</div>

			<div className="space-y-4">
				<h3 className="font-medium text-gray-900 dark:text-white text-lg">
					{t('profile.edit.basicInfo')}
				</h3>

				<div className="space-y-4">
					<div className="space-y-2">
						<label htmlFor="name" className="block text-sm font-medium text-gray-500 dark:text-gray-400">
							{t('profile.edit.firstName')}
						</label>
						<input
							type="text"
							id="name"
							value={formData.name}
							onChange={handleInputChange}
							className="w-full max-w-md px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-shadow"
							placeholder={t('profile.edit.firstName')}
						/>
					</div>

					<div className="space-y-2">
						<label htmlFor="surname" className="block text-sm font-medium text-gray-500 dark:text-gray-400">
							{t('profile.edit.lastName')}
						</label>
						<input
							type="text"
							id="surname"
							value={formData.surname}
							onChange={handleInputChange}
							className="w-full max-w-md px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-shadow"
							placeholder={t('profile.edit.lastName')}
						/>
					</div>

					<div className="space-y-2">
						<label htmlFor="email" className="block text-sm font-medium text-gray-500 dark:text-gray-400">
							{t('profile.edit.email')}
						</label>
						<input
							type="email"
							id="email"
							value={formData.email}
							onChange={handleInputChange}
							className="w-full max-w-md px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-shadow"
							placeholder="example@gmail.com"
						/>
					</div>
				</div>
			</div>

			<div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700/50">
				<Link
					to="/profile"
					className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
				>
					{t('profile.edit.cancel')}
				</Link>
				<button
					type="submit"
					className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
				>
					{t('profile.edit.save')}
				</button>
			</div>
		</form>
	)
}