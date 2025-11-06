import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetEnrolledCourses } from '../../hooks/useGetEnrolledCourses';
import { useTranslation } from 'react-i18next';
import {
  Loader2,
  Clock,
  Target,
  Globe,
  Users
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../ui/alert";
import {
  Card,
  CardContent,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from '../../contexts/LanguageContext';

const EnrolledCourses = () => {
  const navigate = useNavigate();
  const { userSub } = useAuth();
  const { t } = useTranslation();
  const { displayLanguage } = useLanguage();

  const {
    data: courses,
    isLoading,
    isError,
    error
  } = useGetEnrolledCourses();


  const getStatusBadge = (status) => {
    switch (status) {
      case 'ON_HOLD':
        return {
          variant: 'destructive',
          text: t('enrollment.status.onHold')
        };
      case 'ACTIVE':
        return {
          variant: 'success',
          text: t('enrollment.status.active')
        };
      case 'COMPLETED':
        return {
          variant: 'completed',
          text: t('enrollment.status.completed')
        };
      default:
        return {
          variant: 'secondary',
          text: status
        };
    }
  };

  const handleCourseClick = (course) => {
    navigate(`/${displayLanguage}/${userSub}/student/education/course/${course.id}/overview`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>{t('common.error')}</AlertTitle>
          <AlertDescription>
            {t('enrolledCourses.error.loadingFailed')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!courses?.courses?.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <AlertTitle>{t('enrolledCourses.noCourses.title')}</AlertTitle>
          <AlertDescription>
            {t('enrolledCourses.noCourses.description')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses?.courses?.map((course) => {
          const enrollment = courses.enrollments.find(e => e.courseId === course.id);
          const isOnHold = enrollment?.status === 'ON_HOLD';
          const statusBadge = getStatusBadge(enrollment?.status);

          return (
            <Card
              key={course.id}
              className={`group transition-all duration-300 overflow-hidden border-0 shadow-md ${isOnHold
                  ? 'opacity-60 cursor-not-allowed'
                  : 'cursor-pointer hover:shadow-xl hover:-translate-y-1'
                }`}
              onClick={() => !isOnHold && handleCourseClick(course)}
            >
              {/* Course Image */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={course.featuredImageUrl || course.thumbnailUrl}
                  alt={course.title}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
                {/* Status Badge Overlay */}
                <div className="absolute top-3 left-3">
                  <Badge variant={statusBadge.variant} className="shadow-sm">
                    {statusBadge.text}
                  </Badge>
                </div>
                {isOnHold && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center text-white">
                      <Clock className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">
                        {t('enrollment.status.onHold')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <CardContent className="p-4 space-y-3">
                {/* Course Title */}
                <div>
                  <h3 className="font-semibold text-lg leading-tight line-clamp-2 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>
                </div>

                {/* Course Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{course.estimatedHours ? `${course.estimatedHours}h` : t('enrolledCourses.selfPaced')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3 text-muted-foreground" />
                      <span>{course.level || t('enrolledCourses.allLevels')}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3 text-muted-foreground" />
                      <span>{course.language}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>{course.enrollmentCount || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default EnrolledCourses;
