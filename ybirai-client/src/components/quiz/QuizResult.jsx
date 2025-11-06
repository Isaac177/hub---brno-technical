import React from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Trophy, Target, ArrowLeft, CheckCircle2, XCircle, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const QuizResult = ({
  isOpen,
  onClose,
  isSuccess,
  quizResult,
  quiz,
  user,
  onReturn,
  canClose,
  courseData
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const isPassed = quizResult?.passed;
  const score = quizResult?.score || 0;
  const totalPoints = quizResult?.totalPoints || quiz?.totalPoints || 0;
  const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={canClose ? onClose : undefined}>
      <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-md dark:bg-slate-900/95 border-0 p-0 overflow-hidden">
        <div className="relative">
          {/* Header */}
          <DialogHeader className={`p-6 bg-gradient-to-r ${isPassed
              ? 'from-green-50 via-emerald-50 to-green-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-green-900/20'
              : 'from-red-50 via-orange-50 to-red-50 dark:from-red-900/20 dark:via-orange-900/20 dark:to-red-900/20'
            } border-b border-slate-200 dark:border-slate-600`}>
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="mx-auto"
              >
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center bg-gradient-to-r ${isPassed
                    ? 'from-green-500 to-emerald-500'
                    : 'from-red-500 to-orange-500'
                  }`}>
                  {isPassed ? (
                    <Trophy className="h-10 w-10 text-white" />
                  ) : (
                    <Target className="h-10 w-10 text-white" />
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className={`text-3xl font-bold ${isPassed
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                  }`}>
                  {isPassed ? t('quiz.result.congratulations') : 'Quiz Complete'}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mt-2">
                  {isPassed
                    ? t('quiz.result.passedMessage', { score, total: totalPoints })
                    : t('quiz.result.failedMessage', { score, total: totalPoints })
                  }
                </p>
              </motion.div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="p-6 space-y-6">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-6"
              >
                {/* Score Card */}
                <Card className="border-0 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600">
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-3">
                      <Award className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-slate-800 dark:text-slate-200">Your Results</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-600">
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                          {score}/{totalPoints}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Points Earned
                        </div>
                      </div>
                      <div className="text-center p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-600">
                        <div className={`text-2xl font-bold ${isPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                          {percentage}%
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Percentage
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Badge className={`px-4 py-2 text-white border-0 ${isPassed
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-red-500 to-orange-500'
                        }`}>
                        {isPassed ? (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        {isPassed ? 'Passed' : 'Failed'}
                        {` (Required: ${quiz.passingScore}%)`}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Quiz Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-600">
                    <div className="text-sm text-slate-600 dark:text-slate-400">Quiz</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{quiz.title}</div>
                  </div>
                  <div className="p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-600">
                    <div className="text-sm text-slate-600 dark:text-slate-400">Course</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{courseData?.title}</div>
                  </div>
                </div>

                {/* Attempt Info */}
                {quizResult?.attemptNumber && (
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-xl border border-blue-100 dark:border-slate-600">
                    <Badge variant="outline" className="bg-white/80 dark:bg-slate-800/80">
                      {t('quiz.result.attempt', { number: quizResult.attemptNumber })}
                    </Badge>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    {t('quiz.result.submitting')}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    {t('quiz.result.gradingMessage')}
                  </div>
                </div>
              </div>
            )}

            {/* Return Button */}
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex justify-center pt-4"
              >
                <Button
                  onClick={onReturn}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 px-8"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('quiz.result.returnButton')}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};