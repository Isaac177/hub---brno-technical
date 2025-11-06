import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const LoadingState = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-[60vh] w-full flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
            >
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">{t('course.progress.loading')}</p>
            </motion.div>
        </div>
    );
};

export default LoadingState;
