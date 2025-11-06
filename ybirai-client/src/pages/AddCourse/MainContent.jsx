import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Progress, Button } from '@nextui-org/react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useFormik } from 'formik'
import { useAuth } from "@aws-amplify/ui-react/internal"
import { clearFormData, getFormData, saveFormData } from '../../utils/courseLocalStorage.js'
import { getStepSchema } from '../../validators/courseValidationSchema.js'
import { STEPS } from '../../utils/courseSteps.js'
import BasicInfoStep from '../../components/course/BasicInfoStep.jsx'
import MediaStep from '../../components/course/MediaStep.jsx'
import ContentStep from '../../components/course/ContentStep.jsx'
import PricingStep from '../../components/course/PricingStep.jsx'
import { useGetSchools } from '../../hooks/useGetSchools.js'
import axios from "axios"
import { toast } from "sonner"
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../contexts/LanguageContext'

const stepVariants = {
	enter: (direction) => ({
		x: direction > 0 ? 1000 : -1000,
		opacity: 0
	}),
	center: {
		zIndex: 1,
		x: 0,
		opacity: 1
	},
	exit: (direction) => ({
		x: direction < 0 ? 1000 : -1000,
		opacity: 0
	})
}

const formatDuration = (duration) => {
	if (!duration) return "00:00:00"
	if (duration.split(':').length === 2) return `00:${duration}`
	return duration
}

const initialValues = {
	title: '',
	description: '',
	longDescription: '',
	schoolId: '',
	language: '',
	categoryId: '',
	featuredImageUrl: null,
	thumbnailUrl: null,
	learningObjectives: [''],
	requirements: [''],
	syllabus: [{
		title: '',
		lectures: 0,
		duration: '00:00:00',
		thumbnailUrl: '',
		topics: [{
			title: '',
			duration: '00:00:00',
			isPreview: false,
			videoUrl: ''
		}]
	}],
	price: '',
	subtitles: [''],
	tags: []
}

export const MainContent = () => {
	const [currentStep, setCurrentStep] = useState(0)
	const [direction, setDirection] = useState(0)
	const { user } = useAuth()
	const { t } = useTranslation()
	const { displayLanguage } = useLanguage()
	const userEmail = user?.signInDetails?.loginId || ''
	const { data: schoolsData, isLoading } = useGetSchools()

	const API_URL = import.meta.env.VITE_API_URL

	const formik = useFormik({
		initialValues: getFormData() || initialValues,
		validationSchema: getStepSchema(STEPS[currentStep].id),
		validateOnChange: true,
		validateOnBlur: true,
		onSubmit: async (values) => {
			try {
				await getStepSchema(STEPS[currentStep].id).validate(values, { abortEarly: false })

				if (currentStep < STEPS.length - 1) {
					setDirection(1)
					setCurrentStep(prev => prev + 1)
					saveFormData(values)
					return
				}

				console.log("Form values:", JSON.stringify(values, null, 2))

				const courseRequest = {
					schoolId: values.schoolId,
					title: values.title?.trim(),
					description: values.description?.trim(),
					longDescription: values.longDescription?.trim(),
					categoryId: values.categoryId,
					language: values.language?.toUpperCase() || "ENGLISH",
					price: Number(values.price) || 0,
					tags: values.tags?.filter(Boolean),
					requirements: values.requirements?.filter(req => req?.trim()),
					learningObjectives: values.learningObjectives?.filter(obj => obj?.trim()),
					syllabus: values.syllabus?.map(section => ({
						title: section.title?.trim(),
						duration: formatDuration(section.duration),
						topics: section.topics
							?.filter(topic => topic.title?.trim())
							.map(topic => ({
								title: topic.title?.trim(),
								videoUrl: topic.videoUrl?.trim(),
								duration: formatDuration(topic.duration),
								isPreview: Boolean(topic.isPreview)
							}))
					})),
					subtitles: values.subtitles?.filter(sub => sub?.trim()).map(sub => sub.toUpperCase())
				}

				console.log("Course request:", JSON.stringify(courseRequest, null, 2))

				const formData = new FormData()
				formData.append('courseRequest', new Blob([JSON.stringify(courseRequest)], {
					type: 'application/json'
				}))

				if (values.featuredImageUrl instanceof File) {
					formData.append('featuredImage', values.featuredImageUrl)
				}

				if (values.thumbnailUrl instanceof File) {
					formData.append('thumbnail', values.thumbnailUrl)
				}

				const formDataEntries = {}
				for (const [key, value] of formData.entries()) {
					if (value instanceof Blob) {
						formDataEntries[key] = {
							type: value.type,
							size: value.size,
							content: value instanceof File ?
								{ name: value.name, type: value.type } :
								await value.text()
						}
					} else {
						formDataEntries[key] = value
					}
				}
				console.log("FormData entries:", JSON.stringify(formDataEntries, null, 2))

				const boundary = '----WebKitFormBoundary' + Math.random().toString(36).slice(2)

				const response = await axios({
					method: 'POST',
					url: '/api/courses',
					headers: {
						'Accept': 'application/json',
						'Accept-Language': localStorage.getItem('language') || 'en',
						'Content-Type': `multipart/form-data; boundary=${boundary}`
					},
					transformRequest: [(data) => data],
					data: formData,
					withCredentials: true
				})

				console.log("API Response:", JSON.stringify(response.data, null, 2))
				toast.success(t('courseForm.messages.updateSuccess'))
				clearFormData()
			} catch (err) {
				console.error("Error:", JSON.stringify(err, null, 2))
				toast.error(err.message || t('courseForm.messages.updateError'))
				if (err.inner) {
					formik.setTouched(
						err.inner.reduce((acc, error) => ({
							...acc,
							[error.path]: true
						}), {})
					)
				}
			}
		}
	})

	useEffect(() => {
		if (Object.keys(formik.values).length > 0) {
			saveFormData(formik.values)
		}
	}, [formik.values])

	const filteredSchools = schoolsData?.filter(school =>
		school.email === userEmail
	) || []

	const renderStep = () => {
		const stepComponents = {
			'basic-info': BasicInfoStep,
			'media': MediaStep,
			'content': ContentStep,
			'pricing': PricingStep
		}

		const StepComponent = stepComponents[STEPS[currentStep].id]

		return (
			<motion.div
				custom={direction}
				variants={stepVariants}
				initial="enter"
				animate="center"
				exit="exit"
				transition={{
					x: { type: "spring", stiffness: 300, damping: 30 },
					opacity: { duration: 0.2 }
				}}
				className="w-full"
			>
				<StepComponent formik={formik} schools={filteredSchools} />
			</motion.div>
		)
	}

	const handlePrevStep = () => {
		setDirection(-1)
		setCurrentStep(prev => prev - 1)
		saveFormData(formik.values)
	}

	if (isLoading || !userEmail) {
		return (
			<div className="max-w-4xl mx-auto py-8 px-4">
				<Card className="p-6 shadow-none sticky z-50">
					<div className="text-center">{t('common.loading')}</div>
				</Card>
			</div>
		)
	}

	return (
		<div className="container max-w-7xl mx-auto py-8 px-4 space-y-6">
			<Card className="p-6 shadow-none">
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span>{t('courseForm.steps.basicInfo')} {currentStep + 1} {t('catalog.previous')} {STEPS.length}</span>
						<span>{t(`courseForm.steps.${STEPS[currentStep].id.replace('-', '')}`) || STEPS[currentStep].title}</span>
					</div>
					<Progress
						aria-label="Form Progress"
						value={((currentStep + 1) / STEPS.length) * 100}
						className="h-2"
						color="primary"
					/>
				</div>
			</Card>

			<Card className="p-8 shadow-none">
				<form onSubmit={formik.handleSubmit} className="space-y-6">
					<AnimatePresence initial={false} custom={direction} mode="wait">
						{renderStep()}
					</AnimatePresence>

					{process.env.NODE_ENV === 'development' && (
						<div className="space-y-2">
							<div>
								<h3 className="text-lg font-semibold">Formik Errors</h3>
								<pre>{JSON.stringify(formik.errors, null, 2)}</pre>
							</div>
							<div>
								<h3 className="text-lg font-semibold">Yup Errors</h3>
								<pre>{JSON.stringify(formik.errors, null, 2)}</pre>
							</div>
						</div>
					)}

					<div className="flex justify-between pt-6 border-t">
						<Button
							type="button"
							variant="flat"
							disabled={currentStep === 0}
							onClick={handlePrevStep}
							startContent={<ArrowLeft size={20} />}
						>
							{t('courseForm.navigation.previous')}
						</Button>

						<Button
							type="submit"
							color="success"
							endContent={<ArrowRight size={20} />}
						>
							{currentStep === STEPS.length - 1 ? t('modal.submit') : t('courseForm.navigation.next')}
						</Button>
					</div>
				</form>
			</Card>
		</div>
	)
}
