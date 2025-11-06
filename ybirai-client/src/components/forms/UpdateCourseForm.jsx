import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useFormik } from 'formik';
import { useAuth } from "@aws-amplify/ui-react/internal";
import { useTranslation } from 'react-i18next';
import { getStepSchema } from '../../validators/courseValidationSchema.js';
import { STEPS } from '../../utils/courseSteps.js';
import BasicInfoStep from '../../components/course/BasicInfoStep.jsx';
import MediaStep from '../../components/course/MediaStep.jsx';
import ContentStep from '../../components/course/ContentStep.jsx';
import PricingStep from '../../components/course/PricingStep.jsx';
import { useGetSchools } from '../../hooks/useGetSchools.js';
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { useCourseUpdate } from '../../hooks/useCourseUpdate';
import { useNavigate } from 'react-router-dom';
import { useCourse } from "../../contexts/CourseContext";

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
};

const formatDuration = (duration) => {
  if (!duration) return "00:00:00";
  if (duration.split(':').length === 2) return `00:${duration}`;
  return duration;
};

const UpdateCourseForm = () => {
  const { t } = useTranslation();
  const { courseToEdit } = useCourse();
  const initialCourseData = {
    id: courseToEdit?.id || '',
    title: courseToEdit?.title || '',
    description: courseToEdit?.description || '',
    longDescription: courseToEdit?.longDescription || '',
    schoolId: courseToEdit?.schoolId || '',
    language: courseToEdit?.language || '',
    categoryId: courseToEdit?.categoryId || '',
    price: courseToEdit?.price || 0,
    subtitles: courseToEdit?.subtitles || [],
    tags: courseToEdit?.tags || [],
    featuredImageUrl: courseToEdit?.featuredImageUrl || '',
    thumbnailUrl: courseToEdit?.thumbnailUrl || '',
    syllabus: courseToEdit?.syllabus || [],
    learningObjectives: courseToEdit?.learningObjectives || [''],
    requirements: courseToEdit?.requirements || ['']
  };

  const [direction, setDirection] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    updateProgress,
    updateErrors,
    updateCourseData,
    updateCourseSyllabus,
    updateCourseMedia,
    updateCourseVideo
  } = useCourseUpdate();

  const formik = useFormik({
    initialValues: initialCourseData,
    validationSchema: getStepSchema(STEPS[currentStep].id),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const courseId = initialCourseData.id;

        await updateCourseData(courseId, {
          title: values.title,
          description: values.description,
          longDescription: values.longDescription,
          schoolId: values.schoolId,
          language: values.language,
          categoryId: values.categoryId,
          price: values.price,
          subtitles: values.subtitles,
          tags: values.tags
        });

        if (values.featuredImageUrl instanceof File) {
          const newFeaturedImageUrl = await updateCourseMedia(
            courseId,
            'featuredImage',
            values.featuredImageUrl
          );
          values.featuredImageUrl = newFeaturedImageUrl;
        }

        if (values.thumbnailUrl instanceof File) {
          const newThumbnailUrl = await updateCourseMedia(
            courseId,
            'thumbnail',
            values.thumbnailUrl
          );
          values.thumbnailUrl = newThumbnailUrl;
        }

        const updatedSyllabus = [...values.syllabus];
        for (let sectionIndex = 0; sectionIndex < values.syllabus.length; sectionIndex++) {
          const section = values.syllabus[sectionIndex];
          for (let topicIndex = 0; topicIndex < section.topics.length; topicIndex++) {
            const topic = section.topics[topicIndex];
            if (topic.videoFile instanceof File) {
              toast.loading(t('courseForm.messages.uploadingVideo', {
                section: sectionIndex + 1,
                topic: topicIndex + 1
              }));
              const newVideoUrl = await updateCourseVideo(
                courseId,
                sectionIndex,
                topicIndex,
                topic.videoFile
              );
              updatedSyllabus[sectionIndex].topics[topicIndex].videoUrl = newVideoUrl;
              delete updatedSyllabus[sectionIndex].topics[topicIndex].videoFile;
            }
          }
        }

        await updateCourseSyllabus(courseId, updatedSyllabus);

        toast.success(t('courseForm.messages.updateSuccess'));
        navigate(-1);
      } catch (error) {
        console.error('Error updating course:', error);
        toast.error(t('courseForm.messages.updateError'));
      }
    }
  });

  const handleNext = async () => {
    const stepSchema = getStepSchema(STEPS[currentStep].id);
    try {
      await stepSchema.validate(formik.values, { abortEarly: false });
      if (currentStep < STEPS.length - 1) {
        setDirection(1);
        setCurrentStep(prev => prev + 1);
      } else {
        await formik.submitForm();
      }
    } catch (error) {
      const errors = {};
      error.inner.forEach(err => {
        errors[err.path] = err.message;
      });
      formik.setErrors(errors);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const currentStepComponent = (() => {
    switch (STEPS[currentStep].id) {
      case 'basic-info':
        return <BasicInfoStep formik={formik} />;
      case 'media':
        return <MediaStep formik={formik} />;
      case 'content':
        return <ContentStep formik={formik} />;
      case 'pricing':
        return <PricingStep formik={formik} />;
      default:
        return null;
    }
  })();

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <Card className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">{t('courseForm.title.update')}</h2>
          <Progress value={(currentStep + 1) * (100 / STEPS.length)} />
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {currentStepComponent}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('courseForm.navigation.previous')}
          </Button>
          <Button onClick={handleNext}>
            {currentStep === STEPS.length - 1 ? (
              t('courseForm.title.update')
            ) : (
              <>
                {t('courseForm.navigation.next')} <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default UpdateCourseForm;
