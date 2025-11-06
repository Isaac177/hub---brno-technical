import * as Yup from 'yup';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpg', 'image/jpeg', 'image/png'];

const DURATION_REGEX = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;

export const basicInfoSchema = Yup.object().shape({
  title: Yup.string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must not exceed 100 characters')
    .required('Title is required'),
  description: Yup.string()
    .min(20, 'Description must be at least 20 characters')
    .max(200, 'Short description must not exceed 200 characters')
    .required('Short description is required'),
  longDescription: Yup.string()
    .min(100, 'Detailed description must be at least 100 characters')
    .required('Detailed description is required'),
  schoolId: Yup.string()
    .uuid('Invalid school ID format')
    .required('School selection is required'),
  language: Yup.string()
    .matches(/^(ENGLISH|RUSSIAN|KAZAKH)$/, 'Invalid language selection')
    .required('Language is required'),
  categoryId: Yup.string()
    .uuid('Invalid category ID format')
    .required('Category is required'),
});

export const mediaSchema = Yup.object().shape({
  featuredImageUrl: Yup.mixed()
    .required('Featured image is required'),
  thumbnailUrl: Yup.mixed()
    .required('Thumbnail is required')
});

export const contentSchema = Yup.object().shape({
  learningObjectives: Yup.array()
    .of(Yup.string()
      .min(10, 'Each learning objective must be at least 10 characters')
      .nullable())
    .min(3, 'Please add at least 3 learning objectives')
    .required('Learning objectives are required'),
  requirements: Yup.array()
    .of(Yup.string()
      .min(10, 'Each requirement must be at least 10 characters')
      .nullable())
    .min(1, 'Please add at least 1 requirement')
    .required('Requirements are required'),
  syllabus: Yup.array()
    .of(
      Yup.object().shape({
        title: Yup.string()
          .min(5, 'Section title must be at least 5 characters')
          .required('Section title is required'),
        topics: Yup.array()
          .of(
            Yup.object().shape({
              title: Yup.string()
                .min(5, 'Topic title must be at least 5 characters')
                .required('Topic title is required'),
              duration: Yup.string()
                .matches(DURATION_REGEX, 'Please use format HH:mm:ss (e.g., 01:30:00)')
                .required('Topic duration is required'),
              isPreview: Yup.boolean()
                .default(false),
              videoUrl: Yup.string()
                .required('Video upload is required')
            })
          )
          .min(1, 'Please add at least one topic to this section')
          .required('Topics are required')
      })
    )
    .min(1, 'Please add at least one section to your course')
    .required('Course content is required')
}, [['videoUrl', 'isPreview']]);

export const pricingSchema = Yup.object().shape({
  price: Yup.number()
    .required('Price is required')
    .min(0, 'Price cannot be negative'),
  tags: Yup.array()
    .of(Yup.string()
      .min(2, 'Tag must be at least 2 characters')
      .matches(/^[a-z0-9-]+$/, 'Tags can only contain lowercase letters, numbers, and hyphens'))
    .min(1, 'At least one tag is required')
    .required('Tags are required'),
  subtitles: Yup.array()
    .of(Yup.string()
      .matches(/^(ENGLISH|RUSSIAN|KAZAKH)$/, 'Invalid language selection'))
    .default([])  // Set default as empty array
});

// Helper functions for section and topic validation
export const validateSection = (section) => {
  console.log('Validating section:', section);
  const errors = {};
  
  if (!section.title) {
    errors.title = 'Section title is required';
  }
  
  if (!section.topics || section.topics.length === 0) {
    errors.topics = 'At least one topic is required';
  } else {
    const topicErrors = section.topics.map(validateTopic);
    if (topicErrors.some(error => Object.keys(error).length > 0)) {
      errors.topics = topicErrors;
    }
  }
  
  console.log('Section validation result:', errors);
  return errors;
};

export const validateTopic = (topic) => {
  console.log('Validating topic:', topic);
  const errors = {};
  
  if (!topic.title) {
    errors.title = 'Topic title is required';
  }
  
  if (!topic.duration) {
    errors.duration = 'Duration is required';
  }
  
  if (!topic.videoUrl) {
    errors.videoUrl = 'Video upload is required';
  }
  
  console.log('Topic validation result:', errors);
  return errors;
};

export const getStepSchema = (step) => {
  const schemas = {
    'basic-info': basicInfoSchema,
    'media': mediaSchema,
    'content': contentSchema,
    'pricing': pricingSchema
  };
  return schemas[step];
};
