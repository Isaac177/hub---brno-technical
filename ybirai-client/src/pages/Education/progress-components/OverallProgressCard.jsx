import React from 'react';
import { Award, CheckCircle2, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const OverallProgressCard = ({
    overallProgress,
    completedComponents,
    totalComponents,
    videoProgress,
    quizProgress
}) => {
    const { t } = useTranslation();

    const getProgressColor = (progress) => {
        if (progress >= 80) return 'text-green-600 dark:text-green-400';
        if (progress >= 50) return 'text-blue-600 dark:text-blue-400';
        if (progress >= 25) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-gray-600 dark:text-gray-400';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold flex items-center justify-center gap-3">
                        <Award className="h-7 w-7 text-yellow-500" />
                        {t('course.progress.overall')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Progress Circle */}
                    <div className="flex items-center justify-center">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-8 border-gray-200 dark:border-gray-700"></div>
                            <div
                                className="absolute inset-0 w-32 h-32 rounded-full border-8 border-transparent rounded-full"
                                style={{
                                    background: `conic-gradient(from 0deg, rgb(59 130 246) 0deg, rgb(59 130 246) ${overallProgress * 3.6}deg, transparent ${overallProgress * 3.6}deg)`,
                                    mask: 'radial-gradient(circle, transparent 50px, black 52px)',
                                    WebkitMask: 'radial-gradient(circle, transparent 50px, black 52px)'
                                }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-3xl font-bold ${getProgressColor(overallProgress)}`}>
                                    {overallProgress}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-3">
                        <Progress
                            value={overallProgress}
                            className="h-3 bg-gray-200 dark:bg-gray-700"
                        />
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4" />
                                {t('course.progress.completed', {
                                    completed: completedComponents,
                                    total: totalComponents
                                })}
                            </span>
                            <span className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                {totalComponents - completedComponents} remaining
                            </span>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {Object.keys(videoProgress).length}
                            </div>
                            <div className="text-sm text-muted-foreground">Videos Watched</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {Object.keys(quizProgress).length}
                            </div>
                            <div className="text-sm text-muted-foreground">Quizzes Completed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {Math.round(overallProgress)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Overall Progress</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default OverallProgressCard;
