import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { AlertTriangle, ArrowLeft, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const CancelQuizDialog = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-md dark:bg-slate-900/95 border-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-6 -m-6 mb-6 border-b border-red-200 dark:border-red-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-red-600 dark:text-red-400">
                {t('quiz.cancel.title')}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <DialogDescription className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {t('quiz.cancel.description')}
          </DialogDescription>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('quiz.cancel.continueButton')}
            </Button>
            <Button
              onClick={onConfirm}
              variant="destructive"
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0"
            >
              <X className="h-4 w-4 mr-2" />
              {t('quiz.cancel.cancelButton')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
