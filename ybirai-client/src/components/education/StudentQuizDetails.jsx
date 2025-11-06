import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Timer, Trophy } from 'lucide-react';

const StudentQuizDetails = ({ quiz }) => {
  const { t } = useTranslation();
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [shortAnswers, setShortAnswers] = useState({});

  const handleAnswerSelect = (questionId, value) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleShortAnswerChange = (questionId, value) => {
    setShortAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = () => {
    const answers = {
      ...selectedAnswers,
      ...shortAnswers
    };
    // TODO: Add submit logic here
  };

  if (!quiz) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('quiz.student.title')}</CardTitle>
          <CardDescription>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                <span>{t('quiz.student.timeLimit', { minutes: quiz.timeLimit })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span>{t('quiz.student.passingScore', { score: quiz.passingScore })}</span>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {quiz.questions?.map((question, index) => (
              <Card key={question.id} className="border-none shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t('quiz.student.question', { number: index + 1 })}: {question.questionText}
                  </CardTitle>
                  <CardDescription>{t('quiz.student.points', { count: question.points })}</CardDescription>
                </CardHeader>
                <CardContent>
                  {question.type === 'MULTIPLE_CHOICE' ? (
                    <RadioGroup
                      onValueChange={(value) => handleAnswerSelect(question.id, value)}
                      value={selectedAnswers[question.id]}
                    >
                      <div className="space-y-3">
                        {question.options.map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                            <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  ) : (
                    <Input
                      placeholder={t('quiz.student.answerPlaceholder')}
                      value={shortAnswers[question.id] || ''}
                      onChange={(e) => handleShortAnswerChange(question.id, e.target.value)}
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} className="w-full">{t('quiz.student.submit')}</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StudentQuizDetails;
