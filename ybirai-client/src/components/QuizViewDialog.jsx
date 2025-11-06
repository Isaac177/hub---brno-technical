import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "./ui/accordion";
import { Badge } from "./ui/badge";

const QuizViewDialog = ({
    open,
    onOpenChange,
    quiz
}) => {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-7xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{quiz?.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">{t('allQuizzes.dialog.quizDetails')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">{t('allQuizzes.dialog.description')}</p>
                                <p>{quiz?.description}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('allQuizzes.dialog.helpGuidelines')}</p>
                                <p>{quiz?.helpGuidelines}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('allQuizzes.dialog.timeLimit')}</p>
                                <p>{quiz?.timeLimit} {t('allQuizzes.table.minutes')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('allQuizzes.dialog.passingScore')}</p>
                                <p>{quiz?.passingScore}%</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">
                            {t('allQuizzes.dialog.questions')} ({quiz?.questions?.length || 0})
                            {quiz?.questions?.length === 0 && ` - ${t('allQuizzes.dialog.noQuestions')}`}
                        </h3>
                        {quiz?.questions && quiz.questions.length > 0 && (
                            <div className="space-y-4">
                                <Accordion type="single" collapsible className="w-full">
                                    {quiz.questions.map((question, index) => {
                                        return (
                                            <AccordionItem key={question.id} value={`question-${index}`} className="border rounded-lg mb-2">
                                                <AccordionTrigger className="text-left px-4 py-2 hover:bg-gray-50">
                                                    {t('allQuizzes.dialog.question')} {index + 1}: {question.questionText}
                                                </AccordionTrigger>
                                                <AccordionContent className="px-4 py-2">
                                                    <div className="space-y-4">
                                                        <div className="grid gap-2">
                                                            {question.type === 'TRUE_FALSE' || question.type === 'SHORT_ANSWER' ? (
                                                                <div className="flex items-center gap-2 p-2 rounded">
                                                                    <span className="text-green-500 font-medium">
                                                                        {t('allQuizzes.dialog.correctAnswer')}: {question.correctAnswer}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                question.options?.map((option, optIndex) => (
                                                                    <div key={optIndex} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
                                                                        <div className="relative">
                                                                            <Badge
                                                                                variant="outline"
                                                                                className={`w-6 h-6 flex items-center justify-center ${option === question.correctAnswer ? 'border-green-500 text-green-500' : ''
                                                                                    }`}
                                                                            >
                                                                                {String.fromCharCode(65 + optIndex)}
                                                                            </Badge>
                                                                            {option === question.correctAnswer && (
                                                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                                                            )}
                                                                        </div>
                                                                        <span className={option === question.correctAnswer ? 'text-green-500' : ''}>
                                                                            {option}
                                                                        </span>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                        <div className="flex justify-between text-sm text-muted-foreground border-t pt-2">
                                                            <span>{t('allQuizzes.dialog.type')}: {question.type}</span>
                                                            <span>{t('allQuizzes.dialog.points')}: {question.points}</span>
                                                        </div>
                                                        {question.explanation && (
                                                            <div className="mt-2 border-t pt-2">
                                                                <p className="text-sm font-medium">{t('allQuizzes.dialog.explanation')}:</p>
                                                                <p className="text-sm text-muted-foreground">{question.explanation}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        );
                                    })}
                                </Accordion>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default QuizViewDialog;
