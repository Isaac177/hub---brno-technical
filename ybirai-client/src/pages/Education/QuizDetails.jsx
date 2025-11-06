import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDeleteQuiz } from '../../hooks/useDeleteQuiz';
import useGetQuizQuestions from '../../hooks/useGetQuizQuestions';
import { Badge } from "../../components/ui/badge";
import { Loader2, Clock, Trash2 } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { AlertDialog } from "../../components/ui/alert-dialog";

const QuizDetails = () => {
  const { t } = useTranslation();
  const { displayLanguage } = useLanguage();
  const location = useLocation();
  const { quiz, course } = location.state || {};
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { mutate: deleteQuizMutation, isLoading: deleteLoading } = useDeleteQuiz();
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleDeleteQuiz = async () => {
    deleteQuizMutation(quiz.id, {
      onSuccess: () => {
        navigate('/quizzes');
      }
    });
  };

  const {
    data: questions,
    isLoading,
    error
  } = useGetQuizQuestions(quiz?.id);

  if (!quiz) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{t('quizDetails.error.title')}</AlertTitle>
        <AlertDescription>{t('quizDetails.error.quizNotFound')}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{t('quizDetails.error.title')}</AlertTitle>
        <AlertDescription>{t('quizDetails.error.loadingError')}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <p className="text-gray-600">{quiz.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            <Clock className="w-4 h-4 mr-2" />
            {quiz.timeLimit} {t('quizDetails.details.minutes')}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </DropdownMenuTrigger>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={t('allQuizzes.deleteConfirm.title')}
        description={t('allQuizzes.deleteConfirm.description', { quizTitle: quiz.title })}
        cancelText={t('allQuizzes.deleteConfirm.cancel')}
        confirmText={t('allQuizzes.deleteConfirm.confirm')}
        onConfirm={handleDeleteQuiz}
        variant="destructive"
      />

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">{t('quizDetails.details.title')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">{t('quizDetails.details.description')}</p>
              <p>{quiz.description}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('quizDetails.details.helpGuidelines')}</p>
              <p>{quiz.helpGuidelines}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('quizDetails.details.timeLimit')}</p>
              <p>{quiz.timeLimit} {t('quizDetails.details.minutes')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('quizDetails.details.passingScore')}</p>
              <p>{quiz.passingScore}%</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">
            {t('quizDetails.questions.title')} ({questions?.length || 0})
            {questions?.length === 0 && ` - ${t('quizDetails.questions.noQuestions')}`}
          </h3>
          {questions && questions.length > 0 && (
            <div className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {questions.map((question, index) => (
                  <AccordionItem key={question.id} value={`question-${index}`} className="border rounded-lg mb-2">
                    <AccordionTrigger className="text-left px-4 py-2 hover:bg-gray-50">
                      {t('quizDetails.questions.question')} {index + 1}: {question.questionText}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-2">
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          {question.options?.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
                              <div className="relative">
                                <Badge
                                  variant="outline"
                                  className={`w-6 h-6 flex items-center justify-center ${question.correctAnswer === optIndex ? 'border-green-500 text-green-500' : ''
                                    }`}
                                >
                                  {String.fromCharCode(65 + optIndex)}
                                </Badge>
                                {question.correctAnswer === optIndex && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                )}
                              </div>
                              <span className={question.correctAnswer === optIndex ? 'text-green-500' : ''}>
                                {option}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground border-t pt-2">
                          <span>{t('quizDetails.questions.type')}: {question.type}</span>
                          <span>{t('quizDetails.questions.points')}: {question.points}</span>
                        </div>
                        {question.explanation && (
                          <div className="mt-2 border-t pt-2">
                            <p className="text-sm font-medium">{t('quizDetails.questions.explanation')}:</p>
                            <p className="text-sm text-muted-foreground">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizDetails;
