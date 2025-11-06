import React from 'react';
import { Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const NoDataState = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-[60vh] w-full flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-md"
            >
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                    {t('course.progress.noData.title')}
                </h3>
                <p className="text-muted-foreground text-center">
                    {t('course.progress.noData.message')}
                </p>
            </motion.div>
        </div>
    );
};

export default NoDataState;
