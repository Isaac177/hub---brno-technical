import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCourse } from "../../contexts/CourseContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";
import { ClipboardList, Timer, Award, ArrowRight, BookOpen, Target, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case "beginner":
      return "bg-gradient-to-r from-green-500 to-green-600 text-white border-0";
    case "intermediate":
      return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0";
    case "advanced":
      return "bg-gradient-to-r from-red-500 to-red-600 text-white border-0";
    default:
      return "bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0";
  }
};

const Quizzes = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { selectedCourse: course } = useCourse();
  const { t } = useTranslation();

  const handleStartQuiz = (quiz) => {
    navigate(`/student/education/course/${courseId}/quiz/${quiz.id}`, {
      state: { quiz }
    });
  };

  if (!course?.quizzes?.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
          <Card className="max-w-md text-center border-0 bg-white/90 backdrop-blur-sm dark:bg-slate-800/90">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 border-b border-slate-200 dark:border-slate-600">
              <div className="flex items-center justify-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                  <ClipboardList className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  {t('course.quizzes.noQuizzes.title')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <CardDescription className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('course.quizzes.noQuizzes.description')}
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {t('course.quizzes.title')}
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Test your knowledge with these quizzes designed to reinforce your learning
          </p>
        </div>

        {/* Quizzes in Accordion */}
        <div className="w-full">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {course.quizzes.map((quiz, index) => (
              <AccordionItem
                key={quiz.id}
                value={`quiz-${quiz.id}`}
                className="border border-slate-200 dark:border-slate-700 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-5 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="text-left">
                        <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                          {quiz.title}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {quiz.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(quiz.difficultyLevel)}>
                        {t(`course.quizzes.difficulty.${quiz.difficultyLevel?.toLowerCase()}`)}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6 pt-2">
                    {/* Quiz Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-xl border border-blue-100 dark:border-slate-600">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Questions</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                          {quiz.questions?.length || 0}
                        </div>
                      </div>

                      <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600 rounded-xl border border-green-100 dark:border-slate-600">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Timer className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Time Limit</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                          {quiz.timeLimit ? `${quiz.timeLimit}m` : '∞'}
                        </div>
                      </div>

                      <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-slate-700 dark:to-slate-600 rounded-xl border border-yellow-100 dark:border-slate-600">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Passing Score</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                          {quiz.passingScore}%
                        </div>
                      </div>
                    </div>

                    {/* Help Guidelines */}
                    {quiz.helpGuidelines && (
                      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-700 dark:to-slate-600 rounded-xl border border-amber-100 dark:border-slate-600 w-full">
                        <div className="flex items-start gap-3">
                          <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Guidelines</h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                              {quiz.helpGuidelines}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quiz Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <div className="p-4 bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-600">
                        <div className="text-sm text-slate-600 dark:text-slate-400">Total Points</div>
                        <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                          {quiz.totalPoints || 'Not specified'}
                        </div>
                      </div>
                      <div className="p-4 bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-600">
                        <div className="text-sm text-slate-600 dark:text-slate-400">Visibility</div>
                        <div className="text-lg font-bold text-slate-800 dark:text-slate-200 capitalize">
                          {quiz.visibility || 'Public'}
                        </div>
                      </div>
                    </div>

                    {/* Start Quiz Button */}
                    <div className="flex justify-center pt-4">
                      <Button
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 transition-all duration-300 px-8 py-3 text-lg font-semibold"
                        onClick={() => handleStartQuiz(quiz)}
                      >
                        <BookOpen className="mr-2 h-5 w-5" />
                        {t('course.quizzes.startQuiz')}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Summary Stats */}
        <div className="flex justify-center mt-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-100 to-blue-50 dark:from-slate-700 dark:to-slate-600 rounded-full border border-slate-200 dark:border-slate-600">
            <ClipboardList className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {course.quizzes.length} {course.quizzes.length === 1 ? 'Quiz' : 'Quizzes'} Available
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quizzes;
