import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Timer, HelpCircle, Target, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { useTranslation } from 'react-i18next';

export const QuizIntro = ({ quiz, termsAccepted, onTermsChange, onStartQuiz, onBack }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-6xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('quiz.intro.backToQuizzes')}
        </Button>
      </div>

      <Card className="border-0 bg-white/90 backdrop-blur-sm dark:bg-slate-800/90 overflow-hidden w-full">
        <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {quiz.title}
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300 mt-2">
                {quiz.description}
              </CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
              {quiz.difficultyLevel}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-8 w-full">
          {/* Quiz Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6 border border-blue-100 dark:border-slate-600 w-full">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                  <Timer className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {t('quiz.intro.timeLimit')}
                  </div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    {quiz.timeLimit ? `${quiz.timeLimit} ${t('quiz.intro.timeLimit', { minutes: quiz.timeLimit })}` : 'Unlimited'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6 border border-purple-100 dark:border-slate-600 w-full">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                  <HelpCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {t('quiz.intro.questions')}
                  </div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    {quiz.questions?.length || 0}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6 border border-green-100 dark:border-slate-600 w-full">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {t('quiz.intro.passingScore')}
                  </div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    {quiz.passingScore}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Help Guidelines */}
          {quiz.helpGuidelines && (
            <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-700 dark:to-slate-600 rounded-xl border border-amber-100 dark:border-slate-600 w-full">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                  <HelpCircle className="h-5 w-5 text-white" />
                </div>
                <div className="w-full">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Guidelines</h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{quiz.helpGuidelines}</p>
                </div>
              </div>
            </div>
          )}

          {/* Terms Agreement */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6 border border-slate-200 dark:border-slate-600 w-full">
            <div className="flex items-start gap-4">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={onTermsChange}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="terms" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer leading-relaxed">
                  {t('quiz.intro.termsAgreement')}
                </label>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="flex justify-center pt-4 w-full">
            <Button
              onClick={onStartQuiz}
              disabled={!termsAccepted}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 px-8 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              {t('quiz.intro.startQuiz')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
