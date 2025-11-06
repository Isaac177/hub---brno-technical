import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Timer, PenLine, Trophy, Save, BookOpen, Eye, HelpCircle, BarChart, Book } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import useCreateQuiz from '../../hooks/useCreateQuiz';
import useUpdateQuiz from '../../hooks/useUpdateQuiz';
import { toast } from "sonner";
import { apiService } from '../../utils/apiService';
import useGetQuizQuestions from '../../hooks/useGetQuizQuestions';
import { Loader } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';

const questionValidationSchema = Yup.object({
  type: Yup.string().required('createQuiz.validation.questionType'),
  questionText: Yup.string().required('createQuiz.validation.questionText'),
  options: Yup.array().when('type', {
    is: 'MULTIPLE_CHOICE',
    then: () => Yup.array()
      .of(Yup.string())
      .min(2, 'createQuiz.validation.options'),
    otherwise: () => Yup.array().notRequired()
  }),
  correctAnswer: Yup.string().required('createQuiz.validation.correctAnswer'),
  explanation: Yup.string(),
  points: Yup.number()
    .min(1, 'createQuiz.validation.points')
    .required('createQuiz.validation.points')
});

const validationSchema = Yup.object({
  topicId: Yup.string().required('createQuiz.validation.topic'),
  title: Yup.string().required('createQuiz.validation.title'),
  description: Yup.string(),
  difficultyLevel: Yup.string().required('createQuiz.validation.difficultyLevel'),
  timeLimit: Yup.number().min(1, 'createQuiz.validation.timeLimit'),
  passingScore: Yup.number()
    .min(0, 'createQuiz.validation.passingScore.range')
    .max(100, 'createQuiz.validation.passingScore.range')
    .required('createQuiz.validation.passingScore.required'),
  totalPoints: Yup.number()
    .min(1, 'createQuiz.validation.totalPoints')
    .required('createQuiz.validation.totalPoints'),
  visibility: Yup.string().required('createQuiz.validation.visibility'),
  helpGuidelines: Yup.string(),
  isDraft: Yup.boolean(),
  questions: Yup.array()
    .of(questionValidationSchema)
    .min(1, 'createQuiz.validation.questions.required')
    .test('points-sum', 'createQuiz.validation.questions.pointsSum', function (questions) {
      if (!questions || !Array.isArray(questions)) return false;
      const totalPoints = this.parent.totalPoints;
      if (!totalPoints) return false;
      const pointsSum = questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
      return pointsSum === totalPoints;
    })
});

const CreateQuiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId } = useParams();
  const { t } = useTranslation();
  const { displayLanguage } = useLanguage();
  const isEditing = location.state?.isEditing;
  const editQuiz = location.state?.quiz;
  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [questions, setQuestions] = useState(() => {
    if (isEditing && editQuiz?.questions) {
      return editQuiz.questions.map(q => ({
        id: q.id,
        type: q.type || 'MULTIPLE_CHOICE',
        questionText: q.questionText || q.text || '',
        options: q.options || [],
        correctAnswer: q.correctAnswer || '',
        explanation: q.explanation || '',
        points: q.points || 1
      }));
    }
    const savedQuestions = localStorage.getItem('quiz_questions');
    return savedQuestions ? JSON.parse(savedQuestions) : [];
  });

  const [currentQuestion, setCurrentQuestion] = useState(() => {
    if (isEditing) {
      return {
        type: 'MULTIPLE_CHOICE',
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        points: 1
      };
    }
    const savedCurrentQuestion = localStorage.getItem('quiz_current_question');
    return savedCurrentQuestion ? JSON.parse(savedCurrentQuestion) : {
      type: 'MULTIPLE_CHOICE',
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      points: 1
    };
  });

  const [editingQuestionIndex, setEditingQuestionIndex] = useState(-1);
  const { createQuiz, saveQuizDraft, loading: createLoading } = useCreateQuiz();
  const { mutateAsync: updateQuiz, isLoading: updateLoading } = useUpdateQuiz();

  const {
    data: quizQuestions,
    isLoading: isLoadingQuestions,
    error: questionsError
  } = useGetQuizQuestions(editQuiz?.id);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);

        const urlParts = window.location.pathname.split('/');
        const actualCourseId = courseId || urlParts[urlParts.length - 1];

        if (!actualCourseId) {
          setError('No course ID provided');
          setIsLoading(false);
          return;
        }

        let courseData;
        if (location.state?.course) {
          courseData = location.state.course;
        } else {
          const response = await apiService.course.get(`/courses/${actualCourseId}`, {
            headers: { 'Accept-Language': 'en' }
          });
          courseData = response;
        }

        if (!courseData) {
          throw new Error('No course data received');
        }

        setCourse(courseData);

        if (courseData.syllabus && Array.isArray(courseData.syllabus)) {
          const allTopics = courseData.syllabus.reduce((acc, section) => {
            if (section.topics && Array.isArray(section.topics)) {
              return [...acc, ...section.topics.map(topic => ({
                id: topic.id,
                title: `${section.title} - ${topic.title}`,
                sectionTitle: section.title
              }))];
            }
            return acc;
          }, []);
          console.log('Processed topics:', allTopics);
          setTopics(allTopics);
        } else {
          console.warn('No syllabus or topics found in course data');
          setTopics([]);
        }
      } catch (error) {
        console.error('Error getting course data:', error);
        setError(error.response?.data?.message || 'Failed to load course data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, location.state]);

  useEffect(() => {
    if (!isEditing) {
      localStorage.setItem('quiz_questions', JSON.stringify(questions));
    }
  }, [questions, isEditing]);

  useEffect(() => {
    if (!isEditing) {
      localStorage.setItem('quiz_current_question', JSON.stringify(currentQuestion));
    }
  }, [currentQuestion, isEditing]);

  useEffect(() => {
    return () => {
      if (!isEditing) {
        localStorage.removeItem('quiz_questions');
        localStorage.removeItem('quiz_current_question');
        localStorage.removeItem('quiz_form_data');
      }
    };
  }, [isEditing]);

  useEffect(() => {
    if (isEditing && quizQuestions && quizQuestions.length > 0) {
      console.log('Updating questions from API:', quizQuestions);
      const formattedQuestions = quizQuestions.map(q => ({
        id: q.id,
        type: q.type || 'MULTIPLE_CHOICE',
        questionText: q.questionText || q.text || '',
        options: q.options || [],
        correctAnswer: q.correctAnswer || '',
        explanation: q.explanation || '',
        points: q.points || 1
      }));
      setQuestions(formattedQuestions);
      formik.setFieldValue('questions', formattedQuestions);
    }
  }, [quizQuestions, isEditing]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      topicId: editQuiz?.topicId || '',
      title: editQuiz?.title || '',
      description: editQuiz?.description || '',
      difficultyLevel: editQuiz?.difficultyLevel || '',
      timeLimit: editQuiz?.timeLimit || 1,
      passingScore: editQuiz?.passingScore || 70,
      totalPoints: editQuiz?.totalPoints || 1,
      visibility: editQuiz?.visibility || 'CLASS_ONLY',
      helpGuidelines: editQuiz?.helpGuidelines || '',
      isDraft: editQuiz?.isDraft || false,
      questions: []
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting }) => {
      console.log('Formik onSubmit triggered');
      console.log('Form values:', JSON.stringify(values, null, 2));
      console.log('Questions:', JSON.stringify(questions, null, 2));
      console.log('Course ID:', courseId);

      try {
        setSubmitting(true);
        setIsSubmitting(true);

        const errors = await formik.validateForm(values);
        if (Object.keys(errors).length > 0) {
          Object.entries(errors).forEach(([field, error]) => {
            toast.error(t(error));
          });
          return;
        }

        if (!courseId) {
          throw new Error('Course ID is required');
        }

        if (questions.length === 0) {
          toast.error('Please add at least one question to the quiz');
          return;
        }

        const submitData = {
          ...values,
          courseId,
          questions: questions.map(q => ({
            type: q.type || 'MULTIPLE_CHOICE',
            questionText: q.questionText,
            options: q.type === 'MULTIPLE_CHOICE' ? q.options : [],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || '',
            points: Number(q.points) || 1
          }))
        };

        console.log('Prepared submit data:', JSON.stringify(submitData, null, 2));

        if (isEditing) {
          console.log('Updating existing quiz...');
          await updateQuiz({ quizId: editQuiz.id, courseId, data: submitData });
          toast.success('Quiz updated successfully!');
        } else {
          console.log('Creating new quiz...');
          const result = await createQuiz(submitData, courseId);
          console.log('Create quiz result:', JSON.stringify(result, null, 2));
          toast.success('Quiz created successfully!');
        }

        if (!isEditing) {
          localStorage.removeItem('quiz_questions');
          localStorage.removeItem('quiz_current_question');
          localStorage.removeItem('quiz_form_data');
        }

        navigate(`/${location.pathname.split('/')[1]}/admin/education/quizzes/all`);
      } catch (error) {
        console.error('Submission error:', JSON.stringify({
          message: error.message,
          response: error.response?.data,
          stack: error.stack
        }, null, 2));
        toast.error(error.message || 'Failed to submit quiz');
      } finally {
        setSubmitting(false);
        setIsSubmitting(false);
      }
    }
  });

  const handleSubmit = async (values, isDraft = false) => {
    try {
      console.log('handleSubmit called with values:', values);
      console.log('courseId:', courseId);

      const errors = await formik.validateForm(values);
      if (Object.keys(errors).length > 0) {
        Object.entries(errors).forEach(([field, error]) => {
          toast.error(t(error));
        });
        return;
      }

      if (questions.length === 0) {
        toast.error('Please add at least one question to the quiz');
        return;
      }

      const totalPoints = questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
      if (totalPoints > formik.values.totalPoints) {
        toast.error(`Total points (${totalPoints}) exceeds quiz total points (${formik.values.totalPoints})`);
        return;
      }

      const quizData = {
        ...values,
        courseId: courseId,
        id: isEditing ? editQuiz?.id : undefined,
        questions: questions.map(q => ({
          id: q.id,
          type: q.type || 'MULTIPLE_CHOICE',
          questionText: q.questionText,
          options: q.type === 'MULTIPLE_CHOICE'
            ? q.options.filter(option => option && option.trim() !== '')
            : undefined,
          correctAnswer: (q.correctAnswer || '').trim(),
          explanation: (q.explanation || '').trim(),
          points: Number(q.points) || 1
        }))
      };

      console.log('Submitting quiz data:', quizData);

      if (isEditing) {
        console.log('Updating existing quiz...');
        await updateQuiz({ quizId: editQuiz.id, courseId, data: quizData });
        navigate(`/${location.pathname.split('/')[1]}/admin/education/quizzes/all`);
      } else if (isDraft) {
        console.log('Saving as draft...');
        await saveQuizDraft(quizData, courseId);
        navigate(`/${location.pathname.split('/')[1]}/admin/education/quizzes?tab=drafts`);
      } else {
        console.log('Creating new quiz...');
        await createQuiz(quizData, courseId);
        navigate(`/${location.pathname.split('/')[1]}/admin/education/quizzes/all`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to handle quiz';
      console.error('Failed to handle quiz:', error);
      setError(errorMessage);
      throw error;
    }
  };

  const handleQuestionChange = (field, value) => {
    if (field === 'options') {
      const trimmedOptions = value.map(opt => opt.trim());
      setCurrentQuestion(prev => ({
        ...prev,
        options: trimmedOptions,
        correctAnswer: trimmedOptions.includes(prev.correctAnswer?.trim())
          ? prev.correctAnswer.trim()
          : ''
      }));
    } else if (field === 'correctAnswer') {
      setCurrentQuestion(prev => ({
        ...prev,
        correctAnswer: value.trim()
      }));
    } else {
      setCurrentQuestion(prev => ({
        ...prev,
        [field]: value,
        questionText: field === 'questionText' ? value : prev.questionText
      }));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions,
      correctAnswer: prev.correctAnswer && !newOptions.includes(prev.correctAnswer) ? '' : prev.correctAnswer
    }));
  };

  const handleAddQuestion = () => {
    console.log('handleAddQuestion called');

    const questionText = currentQuestion.questionText;

    if (!questionText.trim()) {
      toast.error('Question text is required');
      return;
    }

    if (!currentQuestion.correctAnswer) {
      toast.error('Please select a correct answer');
      return;
    }

    const totalPoints = questions.reduce((sum, q, index) => {
      if (index === editingQuestionIndex) return sum;
      return sum + (Number(q.points) || 0);
    }, 0) + (Number(currentQuestion.points) || 0);

    if (totalPoints > formik.values.totalPoints) {
      toast.error(`Total points (${totalPoints}) exceeds quiz total points (${formik.values.totalPoints})`);
      return;
    }

    const cleanedQuestion = {
      ...currentQuestion,
      questionText: questionText.trim(),
      type: currentQuestion.type || 'MULTIPLE_CHOICE',
      options: currentQuestion.type === 'MULTIPLE_CHOICE'
        ? currentQuestion.options.map(opt => opt.trim()).filter(opt => opt !== '')
        : undefined,
      correctAnswer: currentQuestion.correctAnswer.trim(),
      explanation: (currentQuestion.explanation || '').trim(),
      points: Number(currentQuestion.points) || 1
    };

    if (cleanedQuestion.type === 'MULTIPLE_CHOICE' &&
      !cleanedQuestion.options.includes(cleanedQuestion.correctAnswer)) {
      toast.error('Correct answer must match one of the options exactly');
      return;
    }

    let newQuestions;
    if (editingQuestionIndex === -1) {
      newQuestions = [...questions, cleanedQuestion];
    } else {
      newQuestions = questions.map((q, index) =>
        index === editingQuestionIndex ? cleanedQuestion : q
      );
      setEditingQuestionIndex(-1);
    }

    setQuestions(newQuestions);
    formik.setFieldValue('questions', newQuestions, true);

    setCurrentQuestion({
      type: 'MULTIPLE_CHOICE',
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      points: 1
    });

    toast.success(editingQuestionIndex === -1 ? 'Question added successfully' : 'Question updated successfully');
  };

  const editQuestion = (index) => {
    setCurrentQuestion(questions[index]);
    setEditingQuestionIndex(index);
  };

  const deleteQuestion = (index) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
    if (editingQuestionIndex === index) {
      setEditingQuestionIndex(-1);
      setCurrentQuestion({
        type: 'MULTIPLE_CHOICE',
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        points: 1
      });
    }
    toast.success('Question deleted successfully');
  };

  useEffect(() => {
    if (questions.length > 0) {
      formik.setFieldValue('questions', questions, true);
    }
  }, []);

  useEffect(() => {
    formik.setFieldValue('questions', questions, true);
  }, [questions]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>{t('createQuiz.messages.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-red-500">
              <p className="text-lg font-semibold mb-2">{t('createQuiz.messages.error')}</p>
              <p>{error}</p>
              <Button
                className="mt-4"
                onClick={() => window.location.reload()}
                variant="outline"
              >
                {t('createQuiz.messages.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">
        {isEditing ? t('createQuiz.title.edit') : t('createQuiz.title.create')}
      </h1>

      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <Card className="shadow-none">
          <CardHeader className="border-b">
            <CardTitle>
              {isEditing ? t('createQuiz.title.edit') : t('createQuiz.title.create')}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="text-sm text-gray-500 mb-4">
              <p>{t('createQuiz.courseInfo.courseId')}: {courseId}</p>
              <p>{t('createQuiz.courseInfo.availableTopics')}: {topics.length}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Book className="w-4 h-4" />
                  {t('createQuiz.form.topic.label')}
                </Label>
                <Select
                  value={formik.values.topicId}
                  onValueChange={(value) => formik.setFieldValue('topicId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('createQuiz.form.topic.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>{topic.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formik.touched.topicId && formik.errors.topicId && (
                  <div className="text-red-500 text-sm">{t(formik.errors.topicId)}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <PenLine className="w-4 h-4" />
                  {t('createQuiz.form.title.label')}
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder={t('createQuiz.form.title.placeholder')}
                  {...formik.getFieldProps('title')}
                />
                {formik.touched.title && formik.errors.title && (
                  <div className="text-red-500 text-sm">{t(formik.errors.title)}</div>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Trophy className="w-4 h-4" />
                  {t('createQuiz.form.difficultyLevel.label')}
                </Label>
                <Select
                  value={formik.values.difficultyLevel}
                  onValueChange={(value) => formik.setFieldValue('difficultyLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('createQuiz.form.difficultyLevel.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">{t('createQuiz.form.difficultyLevel.beginner')}</SelectItem>
                    <SelectItem value="INTERMEDIATE">{t('createQuiz.form.difficultyLevel.intermediate')}</SelectItem>
                    <SelectItem value="ADVANCED">{t('createQuiz.form.difficultyLevel.advanced')}</SelectItem>
                  </SelectContent>
                </Select>
                {formik.touched.difficultyLevel && formik.errors.difficultyLevel && (
                  <div className="text-red-500 text-sm">{t(formik.errors.difficultyLevel)}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Eye className="w-4 h-4" />
                  {t('createQuiz.form.visibility.label')}
                </Label>
                <Select
                  value={formik.values.visibility}
                  onValueChange={(value) => formik.setFieldValue('visibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('createQuiz.form.visibility.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">{t('createQuiz.form.visibility.public')}</SelectItem>
                    <SelectItem value="PRIVATE">{t('createQuiz.form.visibility.private')}</SelectItem>
                    <SelectItem value="CLASS_ONLY">{t('createQuiz.form.visibility.classOnly')}</SelectItem>
                  </SelectContent>
                </Select>
                {formik.touched.visibility && formik.errors.visibility && (
                  <div className="text-red-500 text-sm">{t(formik.errors.visibility)}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Timer className="w-4 h-4" />
                  {t('createQuiz.form.timeLimit.label')}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="timeLimit"
                    name="timeLimit"
                    type="number"
                    min="1"
                    {...formik.getFieldProps('timeLimit')}
                  />
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {t('createQuiz.form.timeLimit.unit')}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="w-4 h-4" />
                {t('createQuiz.form.description.label')}
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder={t('createQuiz.form.description.placeholder')}
                className="min-h-[100px] resize-none"
                {...formik.getFieldProps('description')}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <BarChart className="w-4 h-4" />
                  {t('createQuiz.form.passingScore.label')}
                </Label>
                <Input
                  id="passingScore"
                  name="passingScore"
                  type="number"
                  min="0"
                  max="100"
                  {...formik.getFieldProps('passingScore')}
                />
                {formik.touched.passingScore && formik.errors.passingScore && (
                  <div className="text-red-500 text-sm">{t(formik.errors.passingScore)}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <BarChart className="w-4 h-4" />
                  {t('createQuiz.form.totalPoints.label')}
                </Label>
                <Input
                  id="totalPoints"
                  name="totalPoints"
                  type="number"
                  min="1"
                  {...formik.getFieldProps('totalPoints')}
                />
                {formik.touched.totalPoints && formik.errors.totalPoints && (
                  <div className="text-red-500 text-sm">{t(formik.errors.totalPoints)}</div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <HelpCircle className="w-4 h-4" />
                {t('createQuiz.form.helpGuidelines.label')}
              </Label>
              <Textarea
                id="helpGuidelines"
                name="helpGuidelines"
                placeholder={t('createQuiz.form.helpGuidelines.placeholder')}
                className="min-h-[100px] resize-none"
                {...formik.getFieldProps('helpGuidelines')}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="border-b">
            <CardTitle>{t('createQuiz.questions.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('createQuiz.questions.type.label')}</Label>
                <Select
                  value={currentQuestion.type}
                  onValueChange={(value) => handleQuestionChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('createQuiz.questions.type.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MULTIPLE_CHOICE">{t('createQuiz.questions.type.multipleChoice')}</SelectItem>
                    <SelectItem value="TRUE_FALSE">{t('createQuiz.questions.type.trueFalse')}</SelectItem>
                    <SelectItem value="SHORT_ANSWER">{t('createQuiz.questions.type.shortAnswer')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('createQuiz.questions.points.label')}</Label>
                <Input
                  type="number"
                  value={currentQuestion.points}
                  onChange={(e) => handleQuestionChange('points', parseInt(e.target.value))}
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('createQuiz.questions.text.label')}</Label>
              <Textarea
                value={currentQuestion.questionText}
                onChange={(e) => handleQuestionChange('questionText', e.target.value)}
                placeholder={t('createQuiz.questions.text.placeholder')}
                className="min-h-[100px]"
              />
            </div>

            {currentQuestion.type === 'MULTIPLE_CHOICE' && (
              <div className="space-y-4">
                <Label>{t('createQuiz.questions.options.label')}</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  {currentQuestion.options.map((option, index) => (
                    <Input
                      key={index}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={t('createQuiz.questions.options.placeholder', { number: index + 1 })}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>{t('createQuiz.questions.correctAnswer.label')}</Label>
              {currentQuestion.type === 'MULTIPLE_CHOICE' ? (
                <Select
                  value={currentQuestion.correctAnswer}
                  onValueChange={(value) => handleQuestionChange('correctAnswer', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('createQuiz.questions.correctAnswer.placeholder.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {currentQuestion.options
                      .filter(option => option !== '')
                      .map((option, index) => (
                        <SelectItem key={index} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : currentQuestion.type === 'TRUE_FALSE' ? (
                <Select
                  value={currentQuestion.correctAnswer}
                  onValueChange={(value) => handleQuestionChange('correctAnswer', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('createQuiz.questions.correctAnswer.placeholder.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">{t('createQuiz.questions.correctAnswer.true')}</SelectItem>
                    <SelectItem value="false">{t('createQuiz.questions.correctAnswer.false')}</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={currentQuestion.correctAnswer}
                  onChange={(e) => handleQuestionChange('correctAnswer', e.target.value)}
                  placeholder={t('createQuiz.questions.correctAnswer.placeholder.enter')}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('createQuiz.questions.explanation.label')}</Label>
              <Textarea
                value={currentQuestion.explanation}
                onChange={(e) => handleQuestionChange('explanation', e.target.value)}
                placeholder={t('createQuiz.questions.explanation.placeholder')}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                onClick={handleAddQuestion}
                className="flex-1"
              >
                {editingQuestionIndex === -1
                  ? t('createQuiz.questions.buttons.add')
                  : t('createQuiz.questions.buttons.update')}
              </Button>
              {editingQuestionIndex !== -1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingQuestionIndex(-1);
                    setCurrentQuestion({
                      type: 'MULTIPLE_CHOICE',
                      questionText: '',
                      options: ['', '', '', ''],
                      correctAnswer: '',
                      explanation: '',
                      points: 1
                    });
                  }}
                >
                  {t('createQuiz.questions.buttons.cancelEdit')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {questions.length > 0 && (
          <Card className="shadow-none">
            <CardHeader className="border-b">
              <CardTitle>{t('createQuiz.addedQuestions.title')} ({questions.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {questions.map((question, index) => (
                <Card key={index} className="border">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="font-medium mb-2">
                          {t('createQuiz.addedQuestions.question', { number: index + 1 })}
                        </p>
                        <p className="text-gray-600">{question.questionText}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {t('createQuiz.addedQuestions.type')}: {question.type} |
                          {t('createQuiz.addedQuestions.points')}: {question.points}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => editQuestion(index)}
                        >
                          {t('createQuiz.addedQuestions.buttons.edit')}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteQuestion(index)}
                        >
                          {t('createQuiz.addedQuestions.buttons.delete')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            {t('createQuiz.buttons.cancel')}
          </Button>
          <Button
            type="submit"
            className="w-full md:w-auto"
            disabled={createLoading || updateLoading || isSubmitting}
            onClick={(e) => {
              e.preventDefault();
              if (Object.keys(formik.errors).length > 0) {
                Object.entries(formik.errors).forEach(([field, error]) => {
                  toast.error(t(error));
                });
                return;
              }
              formik.handleSubmit();
            }}
          >
            {(createLoading || updateLoading || isSubmitting)
              ? t('createQuiz.buttons.creating')
              : isEditing
                ? t('createQuiz.buttons.update')
                : t('createQuiz.buttons.create')}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateQuiz