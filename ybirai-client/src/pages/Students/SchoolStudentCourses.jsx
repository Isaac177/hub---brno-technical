import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetBatchCoursesBySchool } from '../../hooks/useGetBatchCoursesBySchool';
import { useGetSchoolStudents } from '../../hooks/useEnrollment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ScrollArea } from "../../components/ui/scroll-area";
import { ArrowLeft, BookOpen, Users, Loader2 } from 'lucide-react';

export default function SchoolStudentCourses() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { schoolId } = useParams();

  const hasSchoolId = Boolean(schoolId);

  const { data: courses = [], isLoading: isLoadingCourses, error: coursesError } = useGetBatchCoursesBySchool(
    hasSchoolId ? [schoolId] : [],
    hasSchoolId
  );

  const { data: schoolStudentsData, isLoading: isLoadingStudents, error } = useGetSchoolStudents(schoolId, {
    limit: 1000,
    page: 1,
    enabled: hasSchoolId
  });

  const enrollmentCounts = useMemo(() => {
    if (!schoolStudentsData?.data) {
      return {};
    }

    const counts = schoolStudentsData.data.reduce((acc, student) => {
      const courseId = student.courseId;
      acc[courseId] = (acc[courseId] || 0) + 1;
      return acc;
    }, {});

    return counts;
  }, [schoolStudentsData]);

  const handleCourseClick = (courseId) => {
    navigate(`course/${courseId}/students`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          {hasSchoolId ? t('schoolStudentCourses.title') : t('schoolStudentCourses.studentsManagement')}
        </h1>
      </div>

      {isLoadingCourses ? (
        <div className="text-center py-10">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{t('schoolStudentCourses.loading')}</p>
        </div>
      ) : coursesError ? (
        <div className="text-center py-10">
          <p className="text-red-500">{t('schoolStudentCourses.error', { message: coursesError.message })}</p>
        </div>
      ) : !hasSchoolId ? (
        <div className="text-center py-10">
          <p className="text-gray-500">{t('schoolStudentCourses.noSchoolSelected')}</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">{t('schoolStudentCourses.noCourses')}</p>
          <p className="text-sm text-gray-400 mt-2">{t('schoolStudentCourses.schoolId', { schoolId })}</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const enrollmentCount = enrollmentCounts[course.id] || 0;
              return (
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
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
