import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useGetSchools } from '../../hooks/useGetSchools';
import { useGetBatchCoursesBySchool } from '../../hooks/useGetBatchCoursesBySchool';
import { useGetEnrollmentByBatchCourseId } from '../../hooks/useEnrollment';
import { useEnrollmentActivation } from '../../hooks/useEnrollmentActivation';
import { Loader2, BookOpen, User, Clock, Filter } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../../components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const logger = (component, action, data) => {
  console.log(`[${component}] ${action}:`, data);
};

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'enrollment.status.all' },
  { value: 'ON_HOLD', label: 'enrollment.status.onHold' },
  { value: 'ACTIVE', label: 'enrollment.status.active' },
  { value: 'COMPLETED', label: 'enrollment.status.completed' },
  { value: 'VALIDATED', label: 'enrollment.status.validated' },
];

export default function StudentRequests() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const { data: schools, isLoading: isLoadingSchools, error: schoolsError } = useGetSchools();

  const userSchools = useMemo(() => {
    const filtered = schools.filter(school => school.email === user.email);
    return filtered;
  }, [schools, user?.email]);

  const schoolIds = useMemo(() => {
    const ids = userSchools.map(school => school.id);
    return ids;
  }, [userSchools]);

  const {
    data: coursesData,
    isLoading: isLoadingCourses,
    error: coursesError
  } = useGetBatchCoursesBySchool(schoolIds, {
    enabled: schoolIds.length > 0
  });

  const courses = coursesData || [];

  const courseIds = useMemo(() => {
    const ids = courses.map(course => course.id);
    return ids;
  }, [courses]);

  const {
    data: enrollmentsResponse,
    isLoading: isLoadingEnrollments,
    error: enrollmentsError
  } = useGetEnrollmentByBatchCourseId(courseIds, {
    enabled: courseIds.length > 0
  });

  const allRequests = useMemo(() => {
    if (!enrollmentsResponse?.success || !enrollmentsResponse?.enrollments?.length || !courses?.length) {
      return [];
    }

    const combined = enrollmentsResponse.enrollments.map(enrollment => {
      const course = courses.find(c => c.id === enrollment.courseId);
      return {
        ...enrollment,
        course
      };
    });

    return combined;
  }, [enrollmentsResponse, courses]);

  const filteredRequests = useMemo(() => {
    if (selectedStatus === 'ALL') return allRequests;
    const filtered = allRequests.filter(request => request.status === selectedStatus);
    return filtered;
  }, [allRequests, selectedStatus]);

  const { mutate: activateEnrollment, isLoading: isActivating } = useEnrollmentActivation({
    onSuccess: () => {
      toast.success(t('enrollment.activation.success'));
      setIsDialogOpen(false);
    },
    onError: (error) => {
      logger('StudentRequests', 'Enrollment activation error', {
        error: error?.message || 'Unknown error',
        status: error?.response?.status,
        data: error?.response?.data
      });
      toast.error(error?.message || t('enrollment.activation.error'));
    }
  });

  const handleActivate = (request) => {
    activateEnrollment(request.id);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'ON_HOLD':
        return 'waiting';
      case 'ACTIVE':
        return 'success';
      case 'COMPLETED':
        return 'completed';
      case 'VALIDATED':
        return 'validated';
      default:
        return 'secondary';
    }
  };

  const isLoading = isLoadingSchools || isLoadingCourses || isLoadingEnrollments;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isLoadingSchools && 'Loading schools...'}
            {isLoadingCourses && 'Loading courses...'}
            {isLoadingEnrollments && 'Loading enrollments...'}
          </p>
        </div>
      </div>
    );
  }

  if (schoolsError && !schools) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Failed to load schools</h3>
          <p className="text-muted-foreground">{schoolsError.message}</p>
          <Button
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!userSchools.length) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No schools found</h3>
          <p className="text-muted-foreground">
            You don't have any schools associated with your account ({user?.email}).
          </p>
        </div>
      </div>
    );
  }

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('enrollment.title')}</h1>
          <p className="text-muted-foreground">
            {t('enrollment.subtitle')}
          </p>
          {/* Debug info */}
          <div className="text-xs text-muted-foreground mt-2">
            Schools: {userSchools.length} | Courses: {courses.length} | Requests: {allRequests.length}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedStatus}
            onValueChange={setSelectedStatus}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('enrollment.status.filterPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{t('enrollment.status.label')}</SelectLabel>
                {STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.value === 'ALL' ? (
                      t(option.label)
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(option.value)}>
                          {t(option.label)}
                        </Badge>
                      </div>
                    )}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">
            {selectedStatus === 'ALL'
              ? t('enrollment.empty.all')
              : t('enrollment.empty.filtered', { status: t(`enrollment.status.${selectedStatus.toLowerCase()}`) })
            }
          </h3>
          <p className="text-muted-foreground">
            {selectedStatus === 'ALL'
              ? t('enrollment.empty.allDescription')
              : t('enrollment.empty.filteredDescription', { status: t(`enrollment.status.${selectedStatus.toLowerCase()}`) })
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request) => (
            <Card
              key={request.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant={getStatusBadgeVariant(request.status)}>
                    {t(`enrollment.status.${request.status.toLowerCase()}`)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(request.enrolledAt).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <BookOpen className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <h3 className="font-semibold">{request.course?.title || t('enrollment.course.notFound')}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {request.course?.description || t('enrollment.course.noDescription')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {request.user?.email || request.userEmail}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {request.user?.role || t('enrollment.user.student')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleRequestClick(request)}
                >
                  {t('enrollment.action.viewDetails')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle>{t('enrollment.dialog.title')}</DialogTitle>
                <DialogDescription>
                  {t('enrollment.dialog.description')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium">{t('enrollment.dialog.courseInfo')}</h4>
                  <div className="rounded-lg border p-4">
                    <h5 className="font-semibold">{selectedRequest.course?.title}</h5>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedRequest.course?.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">{t('enrollment.dialog.studentInfo')}</h4>
                  <div className="rounded-lg border p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t('enrollment.dialog.email')}</span>
                        <span className="font-medium">{selectedRequest.user?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t('enrollment.dialog.role')}</span>
                        <span className="font-medium">{selectedRequest.user?.role}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t('enrollment.dialog.status')}</span>
                        <span className="font-medium">{t(`enrollment.status.${selectedRequest.status.toLowerCase()}`)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isActivating}
                >
                  {t('enrollment.dialog.cancel')}
                </Button>
                <Button
                  onClick={() => handleActivate(selectedRequest)}
                  disabled={isActivating}
                >
                  {isActivating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('enrollment.dialog.approving')}
                    </>
                  ) : (
                    t('enrollment.dialog.approve')
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}