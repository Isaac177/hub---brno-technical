import React, { useState } from 'react'
import { validateSchoolData } from '../../validators/validateSchoolData.js'
import { SingleImageUpload } from '../../components/common/SingleImageUpload.jsx'
import { useUserData } from '../../contexts/UserContext.jsx'
import { useCreateSchool } from '../../hooks/useCreateSchool.js'
import { toast } from "sonner"
import { LoaderCircle } from "lucide-react"

export default function Form() {
	const { mutate: createSchool, isLoading, isError, error } = useCreateSchool()

	const [formData, setFormData] = useState({
		name: '',
		description: '',
		website: '',
		foundedYear: new Date().getFullYear(),
		address: '',
		city: '',
		country: '',
		phoneNumber: '',
		logo: null
	})

	const [errors, setErrors] = useState({})
	const { userData } = useUserData()
	const userId = userData?.id

	const handleSubmit = async (e) => {
		e.preventDefault()

		try {
			const validationErrors = validateSchoolData(formData)
			if (Object.keys(validationErrors).length > 0) {
				setErrors(validationErrors)
				return
			}

			const schoolRequest = {
				name: formData.name,
				description: formData.description,
				website: formData.website,
				foundedYear: formData.foundedYear,
				address: formData.address,
				city: formData.city,
				country: formData.country,
				phoneNumber: formData.phoneNumber,
				status: "PENDING",
				primaryContactUserId: userId
			}

			console.log('Submitting school data:', schoolRequest)

			await createSchool({
				request: schoolRequest,
				logo: formData.logo
			})

			setFormData({
				name: '',
				description: '',
				website: '',
				foundedYear: new Date().getFullYear(),
				address: '',
				city: '',
				country: '',
				phoneNumber: '',
				logo: null
			})
		} catch (error) {
			console.error('Form submission error:', error)
			toast.error(error.message || 'Error submitting form')
		}
	}

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value
		}))
		if (errors[name]) {
			setErrors(prev => ({ ...prev, [name]: undefined }))
		}
	}


	return (
		<div className="mx-auto p-4 font-sans w-full max-w-[666px]">
			<form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
				<div className="space-y-2">
					<label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-white">
						School Name
					</label>
					<input
						type="text"
						id="name"
						name="name"
						value={formData.name}
						onChange={handleChange}
						className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white dark:bg-dark-input"
					/>
					{errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
				</div>

				<div className="space-y-2">
					<label className="block text-sm font-medium text-gray-700 dark:text-white">
						School Logo
					</label>
					<SingleImageUpload
						image={formData.logo}
						onChange={(logo) => setFormData(prev => ({ ...prev, logo }))}
					/>
				</div>

				<div className="space-y-2">
					<label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-white">
						Website
					</label>
					<input
						type="url"
						id="website"
						name="website"
						value={formData.website}
						onChange={handleChange}
						className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white dark:bg-dark-input"
					/>
					{errors.website && <p className="text-red-500 text-sm">{errors.website}</p>}
				</div>

				<div className="space-y-2">
					<label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700 dark:text-white">
						Founded Year
					</label>
					<input
						type="number"
						id="foundedYear"
						name="foundedYear"
						value={formData.foundedYear}
						onChange={handleChange}
						className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white dark:bg-dark-input"
					/>
					{errors.foundedYear && <p className="text-red-500 text-sm">{errors.foundedYear}</p>}
				</div>

				<div className="space-y-2">
					<label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-white">
						Address
					</label>
					<input
						type="text"
						id="address"
						name="address"
						value={formData.address}
						onChange={handleChange}
						className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white dark:bg-dark-input"
					/>
					{errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-white">
							City
						</label>
						<input
							type="text"
							id="city"
							name="city"
							value={formData.city}
							onChange={handleChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white dark:bg-dark-input"
						/>
						{errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
					</div>

					<div className="space-y-2">
						<label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-white">
							Country
						</label>
						<input
							type="text"
							id="country"
							name="country"
							value={formData.country}
							onChange={handleChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white dark:bg-dark-input"
						/>
						{errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
					</div>
				</div>

				<div className="space-y-2">
					<label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-white">
						Phone Number
					</label>
					<input
						type="tel"
						id="phoneNumber"
						name="phoneNumber"
						value={formData.phoneNumber}
						onChange={handleChange}
						className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white dark:bg-dark-input"
					/>
					{errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
				</div>

				{isLoading && <p>Creating school...</p>}
				{isError && <p className='text-red-500'>Error: {error.message}</p>}

				<div className="flex gap-5 justify-end w-full pt-3">
					<button
						type="button"
						className="bg-red-500 py-2 px-5 rounded-xl text-white font-medium"
						disabled={isLoading}
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={isLoading}
						className="bg-blue-500 py-2 px-5 rounded-xl text-white font-medium flex items-center gap-2"
					>
						{isLoading ? (
							<>
								<LoaderCircle className="h-4 w-4 animate-spin" />
								Creating...
							</>
						) : (
							'Add School'
						)}
					</button>
				</div>
			</form>
		</div>
	)
}
