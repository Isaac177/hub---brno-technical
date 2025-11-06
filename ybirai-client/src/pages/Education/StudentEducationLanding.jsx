import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetEnrolledCourses } from '../../hooks/useGetEnrolledCourses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { ScrollArea } from "../../components/ui/scroll-area";
import { BookOpen, Users, Clock } from 'lucide-react';
import { Badge } from "../../components/ui/badge";
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';

export default function StudentEducationLanding() {
  const navigate = useNavigate();
  const { schoolId } = useParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { displayLanguage } = useLanguage();
  const { data: courses = [], isLoading, isError } = useGetEnrolledCourses();

  const handleCourseClick = (courseId) => {
    navigate(`/${displayLanguage}/schools/${schoolId}/courses/course/${courseId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <p>{t('education.error.fetchingCourses')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <BookOpen className="mr-3 h-8 w-8" /> {t('enrolledCourses.title')}
      </h1>

      {courses.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">{t('education.noCourses.description')}</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="relative cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleCourseClick(course.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {course.title}
                  </CardTitle>
                  <CardDescription>
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{course.enrolledStudents || 0} {t('enrolledCourses.enrolled', { count: course.enrolledStudents || 0 })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration || t('course.duration.notSpecified')}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <Badge variant="secondary">{course.language}</Badge>
                      <Badge variant="outline">{t('courseCard.price')}: {course.price} KZT</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
