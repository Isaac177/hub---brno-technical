import React, { useState } from 'react';
import { useAuth } from "../../contexts/AuthContext";
import { useGetSchools } from '../../hooks/useGetSchools';
import { useGetBatchCoursesBySchool } from '../../hooks/useGetBatchCoursesBySchool';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Loader2, BookOpen, School, Building2, Plus, Clock } from "lucide-react";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";

const AdminQuizzes = ({ view = "courses" }) => {
  const navigate = useNavigate();
  const { user, userSub } = useAuth();
  const { t } = useTranslation();
  const { displayLanguage } = useLanguage();
  const [selectedCourse, setSelectedCourse] = useState(null);

  const { data: schools, isLoading: isLoadingSchools, isError: isSchoolError, error: schoolError } = useGetSchools();

  const userSchools = schools?.filter(school => school.email === user?.email) || [];
  const schoolIds = userSchools.map(school => school.id);

  const {
    data: courses,
    isLoading: isLoadingCourses,
    isError: isCourseError,
    error: courseError
  } = useGetBatchCoursesBySchool(schoolIds, !!user?.email && schoolIds.length > 0);

  if (isLoadingSchools || (schoolIds.length > 0 && isLoadingCourses)) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isSchoolError || isCourseError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{t('adminQuizzes.error')}</AlertTitle>
        <AlertDescription>{schoolError?.message || courseError?.message || 'Unknown error'}</AlertDescription>
      </Alert>
    );
  }

  if (!user?.email || userSchools.length === 0) {
    return (
      <Alert>
        <AlertTitle>{t('adminQuizzes.noSchools')}</AlertTitle>
        <AlertDescription>{t('adminQuizzes.noSchoolsDescription')}</AlertDescription>
      </Alert>
    );
  }

  const coursesArray = Array.isArray(courses) ? courses : [];

  const coursesBySchool = coursesArray.reduce((acc, course) => {
    if (!acc[course.schoolId]) {
      acc[course.schoolId] = [];
    }
    acc[course.schoolId].push(course);
    return acc;
  }, {});

  const schoolsWithCourses = userSchools.filter(school =>
    coursesBySchool[school.id] && coursesBySchool[school.id].length > 0
  );

  if (schoolsWithCourses.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <School className="h-6 w-6" />
            <h1 className="text-2xl font-bold">{t('adminQuizzes.title')}</h1>
          </div>
        </div>
        <Alert>
          <AlertTitle>{t('adminQuizzes.noCourses')}</AlertTitle>
          <AlertDescription>{t('adminQuizzes.noCoursesDescription')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (view === "courses") {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <School className="h-6 w-6" />
            <h1 className="text-2xl font-bold">{t('adminQuizzes.title')}</h1>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {schoolsWithCourses.map((school) => (
            <div key={school.id}>
              <h2 className="text-xl font-semibold mb-4">{school.name}</h2>
              <div className="flex flex-row gap-6 overflow-x-auto pb-4">
                {coursesBySchool[school.id]?.map((course) => (
                  <Sheet key={course.id}>
                    <SheetTrigger asChild>
                      <Card
                        className="hover:shadow-lg transition-shadow cursor-pointer w-[300px] flex-shrink-0"
                        onClick={() => setSelectedCourse(course)}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            {course.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {course.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/${displayLanguage}/${userSub}/admin/education/quizzes/create/${course.id}`, {
                                state: { course }
                              });
                            }}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {t('adminQuizzes.createQuiz')}
                          </Button>
                        </CardContent>
                      </Card>
                    </SheetTrigger>
                    <SheetContent className="w-[400px] sm:w-[540px]">
                      <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          {course.title}
                        </SheetTitle>
                        <SheetDescription>
                          {t('adminQuizzes.sheet.description')}
                        </SheetDescription>
                      </SheetHeader>
                      <ScrollArea className="mt-6 h-[calc(100vh-200px)]">
                        <div className="space-y-6">
                          {course.syllabus?.map((section) => (
                            <div key={section.id} className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">{section.title}</h3>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {section.duration}
                                </div>
                              </div>
                              <div className="space-y-3">
                                {section.topics?.map((topic) => (
                                  <div key={topic.id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="font-medium">{topic.title}</h4>
                                      <div className="flex items-center gap-2">
                                        <div className="text-sm text-muted-foreground">
                                          <Clock className="h-4 w-4 inline mr-1" />
                                          {topic.duration}
                                        </div>
                                        {topic.preview && (
                                          <Badge variant="secondary">{t('adminQuizzes.preview')}</Badge>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {course.quizzes
                                        ?.filter(quiz => quiz.topicId === topic.id)
                                        ?.map(quiz => (
                                          <Badge
                                            key={quiz.id}
                                            variant="outline"
                                            className="cursor-pointer hover:bg-primary/10"
                                          >
                                            {quiz.title} • {quiz.difficultyLevel.toLowerCase()}
                                          </Badge>
                                        ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )) || (
                              <div className="text-center text-muted-foreground">
                                {t('adminQuizzes.noTopics')}
                              </div>
                            )}
                        </div>
                      </ScrollArea>
                    </SheetContent>
                  </Sheet>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default AdminQuizzes;
