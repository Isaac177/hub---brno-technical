import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { AlertTriangle, Send, X, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const QuizQuestions = ({
  quiz,
  selectedAnswers,
  shortAnswers,
  onAnswerSelect,
  onShortAnswerChange,
  onSubmit,
  onCancel,
  isSubmitting,
  unansweredQuestions
}) => {
  const { t } = useTranslation();

  const renderQuestion = (question, index) => {
    const isUnanswered = unansweredQuestions.some(q => q.id === question.id);

    return (
      <AccordionItem
        key={question.id}
        value={`question-${question.id}`}
        className={`border border-slate-200 dark:border-slate-700 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden ${isUnanswered ? 'ring-2 ring-red-300 dark:ring-red-600' : ''
          }`}
      >
        <AccordionTrigger className="px-6 py-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 hover:no-underline">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
              <div className="text-left">
                <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  {t('quiz.student.question', { number: index + 1 })}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {question.text.length > 100 ? `${question.text.substring(0, 100)}...` : question.text}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                {t('quiz.student.points', { count: question.points })}
              </Badge>
              {isUnanswered && (
                <Badge variant="destructive" className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Unanswered
                </Badge>
              )}
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="px-6 pb-6">
          <div className="space-y-6 pt-2">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-xl border border-blue-100 dark:border-slate-600">
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {question.text}
              </p>
            </div>

            {question.type === 'MULTIPLE_CHOICE' && (
              <RadioGroup
                value={selectedAnswers[question.id] || ''}
                onValueChange={(value) => onAnswerSelect(question.id, value)}
              >
                <div className="space-y-3">
                  {question.options?.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className="group relative bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 p-4"
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem
                          value={option}
                          id={`${question.id}-${optionIndex}`}
                          className="text-blue-500"
                        />
                        <Label
                          htmlFor={`${question.id}-${optionIndex}`}
                          className="flex-1 text-slate-700 dark:text-slate-300 cursor-pointer font-medium"
                        >
                          {option}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {question.type === 'TRUE_FALSE' && (
              <RadioGroup
                value={selectedAnswers[question.id] || ''}
                onValueChange={(value) => onAnswerSelect(question.id, value)}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="group relative bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-600 hover:border-green-300 dark:hover:border-green-500 transition-all duration-300 p-4">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value="true"
                        id={`${question.id}-true`}
                        className="text-green-500"
                      />
                      <Label
                        htmlFor={`${question.id}-true`}
                        className="flex-1 text-slate-700 dark:text-slate-300 cursor-pointer font-medium"
                      >
                        {t('createQuiz.questions.correctAnswer.true')}
                      </Label>
                    </div>
                  </div>
                  <div className="group relative bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-600 hover:border-red-300 dark:hover:border-red-500 transition-all duration-300 p-4">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value="false"
                        id={`${question.id}-false`}
                        className="text-red-500"
                      />
                      <Label
                        htmlFor={`${question.id}-false`}
                        className="flex-1 text-slate-700 dark:text-slate-300 cursor-pointer font-medium"
                      >
                        {t('createQuiz.questions.correctAnswer.false')}
                      </Label>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            )}

            {question.type === 'SHORT_ANSWER' && (
              <div className="space-y-2">
                <Textarea
                  value={shortAnswers[question.id] || ''}
                  onChange={(e) => onShortAnswerChange(question.id, e.target.value)}
                  placeholder={t('quiz.student.answerPlaceholder')}
                  className="min-h-[120px] border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm"
                />
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-6xl mx-auto space-y-8"
    >
      {/* Quiz Header */}
      <Card className="border-0 bg-white/90 backdrop-blur-sm dark:bg-slate-800/90 overflow-hidden w-full">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 border-b border-slate-200 dark:border-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <HelpCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {quiz.title}
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">
                  {quiz.timeLimit && `${t('quiz.student.timeLimit', { minutes: quiz.timeLimit })} • `}
                  {t('quiz.student.passingScore', { score: quiz.passingScore })}
                </CardDescription>
              </div>
            </div>
            {unansweredQuestions.length > 0 && (
              <Badge variant="destructive" className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
                {unansweredQuestions.length} Unanswered
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Questions in Accordion */}
      <Accordion type="multiple" className="w-full space-y-4">
        {quiz.questions?.map((question, index) => renderQuestion(question, index))}
      </Accordion>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-8 w-full">
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-6"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel Quiz
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          size="lg"
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 px-8 disabled:opacity-50"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Submitting...' : t('quiz.student.submit')}
        </Button>
      </div>
    </motion.div>
  );
};
