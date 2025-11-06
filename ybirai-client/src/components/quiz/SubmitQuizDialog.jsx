import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Send, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const SubmitQuizDialog = ({ isOpen, onClose, onConfirm, isSubmitting }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={!isSubmitting ? onClose : undefined}>
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-md dark:bg-slate-900/95 border-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 -m-6 mb-6 border-b border-green-200 dark:border-green-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-green-600 dark:text-green-400">
                Submit Quiz
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <DialogDescription className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Are you sure you want to submit your quiz? Once submitted, you cannot make any changes to your answers.
          </DialogDescription>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Review Answers
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};