import React from 'react';
import { TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const ProgressHeader = () => {
    const { t } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
        >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
                {t('course.progress.title')}
            </h1>
            <p className="text-muted-foreground">
                Track your learning journey and celebrate your achievements
            </p>
        </motion.div>
    );
};

export default ProgressHeader;
