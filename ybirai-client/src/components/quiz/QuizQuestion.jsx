
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

export const QuizQuestion = ({ 
  question, 
  index, 
  selectedAnswer, 
  shortAnswer,
  onAnswerSelect,
  onShortAnswerChange,
  isSubmitting
}) => {
  const { t } = useTranslation();
  
  const isAnswered = question.type === 'MULTIPLE_CHOICE' 
    ? !!selectedAnswer
    : !!shortAnswer?.trim();

  return (
    <Card className={`relative ${!isAnswered ? 'border-red-200' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {t('quiz.student.question', { number: index + 1 })}
            </CardTitle>
            <CardDescription>{question.questionText}</CardDescription>
          </div>
          {!isAnswered && (
            <span className="text-red-500 text-sm">{t('common.required')}</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {question.type === 'MULTIPLE_CHOICE' ? (
          <RadioGroup
            value={selectedAnswer}
            onValueChange={(value) => onAnswerSelect(question.id, value)}
            className="space-y-3"
          >
            {question.options?.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option} 
                  id={`q${question.id}-${optionIndex}`}
                  disabled={isSubmitting}
                />
                <Label htmlFor={`q${question.id}-${optionIndex}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <Input
            value={shortAnswer || ''}
            onChange={(e) => onShortAnswerChange(question.id, e.target.value)}
            placeholder={t('quiz.student.answerPlaceholder')}
            disabled={isSubmitting}
          />
        )}
      </CardContent>
    </Card>
  );
};
