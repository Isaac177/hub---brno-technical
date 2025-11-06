import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { useFormik } from 'formik'
import { useAuth } from "@aws-amplify/ui-react/internal"
import { useTranslation } from 'react-i18next'
import { clearFormData, getFormData, saveFormData } from '../../utils/courseLocalStorage.js'
import { getStepSchema } from '../../validators/courseValidationSchema.js'
import { STEPS } from '../../utils/courseSteps.js'
import BasicInfoStep from '../../components/course/BasicInfoStep.jsx'
import MediaStep from '../../components/course/MediaStep.jsx'
import ContentStep from '../../components/course/ContentStep.jsx'
import PricingStep from '../../components/course/PricingStep.jsx'
import { useGetSchools } from '../../hooks/useGetSchools.js'
import { toast } from "sonner"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { Progress } from "../ui/progress"
import { useNavigate } from 'react-router-dom'
import { useCourse } from '../../contexts/CourseContext'

const API_BASE_URL = 'https://course.ybyraihub.kz';

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
  subtitles: [],
  tags: []
}

function CreateCourseForm() {
  const { t, i18n } = useTranslation();
  const { isCourseEditing, courseToEdit, setIsCourseEditing, setCourseToEdit } = useCourse();
  const [direction, setDirection] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const { user } = useAuth()
  const navigate = useNavigate()
  const userEmail = user?.signInDetails?.loginId || ''

  const currentLanguage = i18n.language || localStorage.getItem('language') || 'en';

  const { data: schoolsData, isLoading, error } = useGetSchools(currentLanguage);

  const formik = useFormik({
    initialValues: getFormData() || initialValues,
    validationSchema: getStepSchema(STEPS[currentStep].id),
    validateOnChange: true,
    validateOnBlur: true,

    onSubmit: async (values) => {
      console.log('[CreateCourseForm] Form submission started for step:', currentStep, STEPS[currentStep].id);
      console.log('[CreateCourseForm] Form values:', values);
      console.log('[CreateCourseForm] Formik validation state:', {
        isValid: formik.isValid,
        errors: formik.errors,
        touched: formik.touched,
        isSubmitting: formik.isSubmitting
      });

      try {
        const stepSchema = getStepSchema(STEPS[currentStep].id);

        if (currentStep === 2 && values.onStepSubmit) {
          const isValid = await values.onStepSubmit();
          if (!isValid) {
            console.log('[CreateCourseForm] Custom step validation failed, stopping submission');
            return;
          }
        } else {
          try {
            const stepFields = {
              'basic-info': ['title', 'description', 'longDescription', 'schoolId', 'language', 'categoryId'],
              'media': ['featuredImageUrl', 'thumbnailUrl'],
              'content': ['learningObjectives', 'requirements', 'syllabus'],
              'pricing': ['price', 'tags', 'subtitles']
            };

            const currentStepId = STEPS[currentStep].id;
            const relevantFields = stepFields[currentStepId];
            const stepValues = {};

            relevantFields.forEach(field => {
              stepValues[field] = values[field];
            });

            await stepSchema.validate(stepValues, { abortEarly: false });
          } catch (validationError) {

            if (validationError.inner && validationError.inner.length > 0) {
              const errorMap = {};
              validationError.inner.forEach(error => {
                errorMap[error.path] = error.message;
              });
              formik.setErrors(errorMap);
              console.log('[CreateCourseForm] Set formik errors:', errorMap);
            }

            toast.error(`Validation failed: ${validationError.message}`);
            return;
          }
        }

        if (currentStep < STEPS.length - 1) {
-          setDirection(1);
          setCurrentStep(prev => prev + 1);
          saveFormData(values);
          return;
        }
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

        const formData = new FormData()
        formData.append('courseRequest', new Blob([JSON.stringify(courseRequest)], {
          type: 'application/json'
        }))

        if (values.featuredImageUrl instanceof File) {
          const imageBlob = new Blob([values.featuredImageUrl], { type: 'image/jpeg' });
          formData.append('featuredImage', imageBlob, values.featuredImageUrl.name);
        }

        if (values.thumbnailUrl instanceof File) {
          const imageBlob = new Blob([values.thumbnailUrl], { type: 'image/jpeg' });
          formData.append('thumbnail', imageBlob, values.thumbnailUrl.name);
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/courses`, {
            method: 'POST',
            body: formData,
            headers: {
              'Accept': 'application/json',
              'Accept-Language': localStorage.getItem('language') || 'en'
            },
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          toast.success(t('courseForm.messages.createSuccess'));
          clearFormData();
          formik.resetForm();
        } catch (error) {

          toast.error(t('courseForm.messages.createError'));
          if (error.inner) {
            formik.setTouched(
              error.inner.reduce((acc, error) => ({
                ...acc,
                [error.path]: true
              }), {})
            );
          }
        }
      } catch (err) {
        console.error("[CreateCourseForm] Error:", err)
        console.error("[CreateCourseForm] Error stack:", err.stack)
        toast.error(t('courseForm.messages.createError'))
        if (err.inner) {
          formik.setTouched(
            err.inner.reduce((acc, error) => ({
              ...acc,
              [error.path]: true
            }), {})
          );
        }
      }
    }
  })

  useEffect(() => {
    if (Object.keys(formik.values).length > 0) {
      saveFormData(formik.values)
    }
  }, [formik.values])

  useEffect(() => {
    if (isCourseEditing && courseToEdit) {
      const editValues = {
        title: courseToEdit.title || '',
        description: courseToEdit.description || '',
        longDescription: courseToEdit.longDescription || '',
        schoolId: courseToEdit.schoolId || '',
        language: courseToEdit.language || '',
        categoryId: courseToEdit.categoryId || '',
        featuredImageUrl: courseToEdit.featuredImageUrl || null,
        thumbnailUrl: courseToEdit.thumbnailUrl || null,
        learningObjectives: courseToEdit.learningObjectives || [''],
        requirements: courseToEdit.requirements || [''],
        syllabus: courseToEdit.syllabus || [{
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
        price: courseToEdit.price || '',
        subtitles: courseToEdit.subtitles || [],
        tags: courseToEdit.tags || []
      };
      formik.setValues(editValues);
    }

    return () => {
      setIsCourseEditing(false);
      setCourseToEdit(null);
    };
  }, []);

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();

      if (values.featuredImageUrl && !(typeof values.featuredImageUrl === 'string')) {
        formData.append('featuredImage', values.featuredImageUrl);
      }
      if (values.thumbnailUrl && !(typeof values.thumbnailUrl === 'string')) {
        formData.append('thumbnail', values.thumbnailUrl);
      }

      const courseData = {
        ...values,
        duration: formatDuration(values.duration),
        featuredImageUrl: typeof values.featuredImageUrl === 'string' ? values.featuredImageUrl : null,
        thumbnailUrl: typeof values.thumbnailUrl === 'string' ? values.thumbnailUrl : null,
      };
      formData.append('courseData', JSON.stringify(courseData));

      if (isCourseEditing && courseToEdit) {
        const response = await fetch(`${API_BASE_URL}/api/courses/${courseToEdit.id}`, {
          method: 'PUT',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        toast.success(t('courseForm.messages.updateSuccess'));
      } else {
        const response = await fetch(`${API_BASE_URL}/api/courses`, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        toast.success(t('courseForm.messages.createSuccess'));
      }

      clearFormData();
      navigate(-1);
    } catch (error) {
      console.error('Error:', error);
      toast.error(isCourseEditing ? t('courseForm.messages.updateError') : t('courseForm.messages.createError'));
    }
  }

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
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading schools...</span>
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    console.error('[CreateCourseForm] Schools error:', error);
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card className="p-6">
          <div className="text-red-500">
            Error loading schools: {error.message}
            <button
              onClick={() => window.location.reload()}
              className="ml-2 text-blue-500 underline"
            >
              Retry
            </button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-6">
      <Card className="p-6 shadow-none">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('courseForm.steps.progress', { current: currentStep + 1, total: STEPS.length })}</span>
            <span>{t(`courseForm.steps.${STEPS[currentStep].id}`)}</span>
          </div>
          <Progress value={((currentStep + 1) / STEPS.length) * 100} />
        </div>
      </Card>

      <Card className="p-8 shadow-none">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            {renderStep()}
          </AnimatePresence>

          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              disabled={currentStep === 0}
              onClick={handlePrevStep}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('courseForm.navigation.previous')}
            </Button>

            <Button
              type="submit"
              className="flex items-center gap-2"
              onClick={(e) => {
                console.log('[CreateCourseForm] Submit button clicked');
                console.log('[CreateCourseForm] Current step:', currentStep);
                console.log('[CreateCourseForm] Formik state:', {
                  isValid: formik.isValid,
                  isSubmitting: formik.isSubmitting,
                  errors: formik.errors,
                  values: formik.values
                });

                if (!formik.isSubmitting) {
                  console.log('[CreateCourseForm] Manually triggering form submission');
                  formik.handleSubmit(e);
                }
              }}
            >
              {currentStep === STEPS.length - 1 ? t('courseForm.navigation.submit') : t('courseForm.navigation.next')}
              {currentStep < STEPS.length - 1 && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default CreateCourseForm
