import React from 'react';
import { BrainCircuitIcon, BookOpen, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { Badge } from '../../../components/ui/badge';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const QuizProgressCard = ({ quizProgress, formatDate }) => {
    const { t } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
        >
            <Card className="h-full border-0 shadow-lg">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <BrainCircuitIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        {t('course.progress.quizzes')}
                        <Badge variant="secondary" className="ml-auto">
                            {Object.keys(quizProgress).length}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {Object.keys(quizProgress).length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <BookOpen className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                {t('course.progress.noQuizzes')}
                            </p>
                        </motion.div>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {Object.values(quizProgress).map((quiz, index) => (
                                <motion.div
                                    key={quiz.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                >
                                    <Card className="border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                                    <Trophy className="h-3 w-3 mr-1" />
                                                    {t('course.progress.status.completed')}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(quiz.lastUpdated)}
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium">
                                                        {t('course.progress.score')}
                                                    </span>
                                                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                                        {quiz.score || 0} / {quiz.totalPossibleScore || 0}
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={quiz.totalPossibleScore ? (quiz.score / quiz.totalPossibleScore) * 100 : 0}
                                                    className="h-2"
                                                />
                                                <div className="text-xs text-muted-foreground">
                                                    Score: {quiz.totalPossibleScore ? Math.round((quiz.score / quiz.totalPossibleScore) * 100) : 0}%
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default QuizProgressCard;
