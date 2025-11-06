import React from 'react';
import { Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const ErrorState = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-[60vh] w-full flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-md"
            >
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                    {t('course.progress.error.title')}
                </h3>
                <p className="text-muted-foreground">
                    {t('course.progress.error.message')}
                </p>
            </motion.div>
        </div>
    );
};

export default ErrorState;
