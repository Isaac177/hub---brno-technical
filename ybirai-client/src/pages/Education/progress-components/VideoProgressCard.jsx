import React from 'react';
import { VideoIcon, PlayCircle, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { Badge } from '../../../components/ui/badge';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const VideoProgressCard = ({ videoProgress, formatDate }) => {
    const { t } = useTranslation();

    const getProgressColor = (progress) => {
        if (progress >= 80) return 'text-green-600 dark:text-green-400';
        if (progress >= 50) return 'text-blue-600 dark:text-blue-400';
        if (progress >= 25) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-gray-600 dark:text-gray-400';
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
        >
            <Card className="h-full border-0 shadow-lg">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <VideoIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        {t('course.progress.videos')}
                        <Badge variant="secondary" className="ml-auto">
                            {Object.keys(videoProgress).length}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {Object.keys(videoProgress).length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <PlayCircle className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                {t('course.progress.noVideos')}
                            </p>
                        </motion.div>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {Object.values(videoProgress).map((video, index) => (
                                <motion.div
                                    key={video.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                >
                                    <Card className="border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant={video.completed ? "default" : "secondary"}
                                                        className={video.completed ? "bg-green-500 hover:bg-green-600" : ""}
                                                    >
                                                        {video.completed ? (
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        ) : (
                                                            <Clock className="h-3 w-3 mr-1" />
                                                        )}
                                                        {video.completed ?
                                                            t('course.progress.status.completed') :
                                                            t('course.progress.status.inProgress')
                                                        }
                                                    </Badge>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(video.lastUpdated)}
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium">
                                                        {t('course.progress.progressPercent', {
                                                            percent: Math.round(video.progress || 0)
                                                        })}
                                                    </span>
                                                    <span className={`text-sm font-bold ${getProgressColor(video.progress || 0)}`}>
                                                        {Math.round(video.progress || 0)}%
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={video.progress || 0}
                                                    className="h-2"
                                                />
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

export default VideoProgressCard;
