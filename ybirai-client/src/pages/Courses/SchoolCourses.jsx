import React from 'react';
import { useAuth } from "../../contexts/AuthContext";
import { useUserData } from '../../contexts/UserContext';
import { useGetSchools } from '../../hooks/useGetSchools';
import { useGetBatchCoursesBySchool } from '../../hooks/useGetBatchCoursesBySchool';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Loader2, BookOpen, School, Building2, Globe, MapPin } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";

const SchoolCourses = () => {
  const navigate = useNavigate();
  const { user, userSub } = useAuth();
  const { userData } = useUserData();
  const { t } = useTranslation();
  const { displayLanguage } = useLanguage();
  const { data: schools, isLoading: isLoadingSchools, isError: isSchoolError, error: schoolError } = useGetSchools(displayLanguage, user?.token);

  console.log('[SchoolCourses] Schools data:', schools);
  console.log('[SchoolCourses] User email:', user?.email);
  console.log('[SchoolCourses] User role:', userData?.role);

  const userSchools = userData?.role === 'PLATFORM_ADMIN'
    ? schools || []
    : schools?.filter(school => school.primaryContactUserEmail === user?.email) || [];

  const schoolIds = userSchools.map(school => school.id);

  const {
    data: courses,
    isLoading: isLoadingCourses,
    isError: isCourseError,
    error: courseError
  } = useGetBatchCoursesBySchool(schoolIds);

  if (isLoadingSchools || isLoadingCourses) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isSchoolError || isCourseError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{t('schoolManagement.error')}</AlertTitle>
        <AlertDescription>{schoolError || courseError}</AlertDescription>
      </Alert>
    );
  }

  const coursesArray = Array.isArray(courses)
    ? courses
    : (courses?.courses && Array.isArray(courses.courses))
      ? courses.courses
      : [];

  const coursesBySchool = coursesArray.reduce((acc, course) => {
    if (!acc[course.schoolId]) {
      acc[course.schoolId] = [];
    }
    acc[course.schoolId].push(course);
    return acc;
  }, {});

  if (userSchools.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <School className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{t('schoolManagement.mySchools')}</h1>
        </div>
        <Alert>
          <AlertTitle>{t('schoolManagement.noSchools')}</AlertTitle>
          <AlertDescription>{t('schoolManagement.noSchoolsDescription')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <School className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{t('schoolManagement.mySchools')}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userSchools.map((school) => (
          <Card
            key={school.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              const basePath = userData?.role === 'PLATFORM_ADMIN' ? 'super' : 'admin';
              navigate(`/${displayLanguage}/${userSub}/${basePath}/education/courses/manage/${school.id}`, {
                state: { courses: coursesBySchool[school.id] || [] }
              });
            }}
          >
            <CardHeader>
              <div className="w-full h-40 mb-4 relative rounded-lg overflow-hidden bg-gray-100">
                {school.logoUrl ? (
                  <img
                    src={school.logoUrl}
                    alt={school.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="h-20 w-20 text-gray-400" />
                  </div>
                )}
              </div>
              <CardTitle className="flex items-center gap-2">
                {school.name}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {school.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">{school.website || t('schoolManagement.noWebsite')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">{school.location || t('schoolManagement.noLocation')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {coursesBySchool[school.id]?.length || 0} {t('schoolManagement.courses')}
                    </Badge>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SchoolCourses;
