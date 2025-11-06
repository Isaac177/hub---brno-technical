import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetCourse } from '../../hooks/useGetCourse';
import { useGetEnrollmentsByCourseId } from '../../hooks/useEnrollment';
import { Info, CheckCircle2, PlayCircle } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { DataTable } from "../../components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";

const dateFormatter = new Intl.DateTimeFormat('ru-KZ', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const formatDate = (date) => {
  return dateFormatter.format(new Date(date));
};

const ProgressBadge = ({ value, label }) => (
  <Badge 
    variant={value >= 100 ? "success" : value >= 50 ? "default" : "warning"}
    className="mr-2"
  >
    {label}: {Math.round(value)}%
  </Badge>
);

const ProgressSection = ({ title, items, renderItem }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-medium">{title}</h4>
    <div className="space-y-4">
      {Object.entries(items || {}).map(([id, item]) => renderItem(id, item))}
    </div>
  </div>
);

const VideoProgress = ({ id, video, t }) => (
  <div key={id} className="space-y-2">
    <div className="flex items-center space-x-2">
      <PlayCircle className="h-4 w-4" />
      <span className="text-sm font-medium">
        {t('courseStudents.progress.video')} {video.completed && <CheckCircle2 className="h-4 w-4 text-green-500 inline ml-2" />}
      </span>
    </div>
    <Progress value={video.progress} />
    <span className="text-sm text-muted-foreground">
      {t('courseStudents.progress.lastWatched')} {formatDate(video.lastUpdated)}
    </span>
  </div>
);

const QuizProgress = ({ id, quiz, t }) => (
  <div key={id} className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">
        {t('courseStudents.progress.quizScore')} {quiz.score}/{quiz.totalPossibleScore}
        {quiz.completed && <CheckCircle2 className="h-4 w-4 text-green-500 inline ml-2" />}
      </span>
    </div>
    <span className="text-sm text-muted-foreground">
      {t('courseStudents.progress.lastAttempt')} {formatDate(quiz.lastUpdated)}
    </span>
  </div>
);

export default function CourseStudents() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useGetCourse(courseId);

  const {
    data: enrollmentData,
    isLoading,
    error
  } = useGetEnrollmentsByCourseId(courseId);

  const students = enrollmentData?.enrollments || [];

  const columns = [
    {
      accessorKey: "user.firstName",
      header: t('courseStudents.table.name'),
      cell: ({ row }) => {
        const user = row.original.user;
        return user ? `${user.firstName} ${user.lastName}` : 'N/A';
      }
    },
    {
      accessorKey: "user.email",
      header: t('courseStudents.table.email'),
      cell: ({ row }) => row.original.user?.email || row.original.userEmail || 'N/A'
    },
    {
      accessorKey: "status",
      header: t('courseStudents.table.status'),
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'COMPLETED' ? 'success' : 'default'}>
          {row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: "progress",
      header: t('courseStudents.table.progress'),
      cell: ({ row }) => {
        const enrollment = row.original;
        const videosProgress = (enrollment.componentProgress?.videos?.completed / enrollment.componentProgress?.videos?.total) * 100 || 0;
        const quizzesProgress = (enrollment.componentProgress?.quizzes?.completed / enrollment.componentProgress?.quizzes?.total) * 100 || 0;
        
        return (
          <div className="flex flex-wrap gap-2">
            <ProgressBadge value={enrollment.progress} label={t('courseStudents.progress.overall')} />
            <ProgressBadge value={videosProgress} label={t('courseStudents.progress.videos')} />
            <ProgressBadge value={quizzesProgress} label={t('courseStudents.progress.quizzes')} />
          </div>
        );
      }
    },
    {
      accessorKey: "enrolledAt",
      header: t('courseStudents.table.enrolledAt'),
      cell: ({ row }) => formatDate(row.original.enrolledAt)
    },
    {
      accessorKey: "lastAccessedAt",
      header: t('courseStudents.table.lastAccessed'),
      cell: ({ row }) => formatDate(row.original.lastAccessedAt)
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Info className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[825px]">
            <DialogHeader>
              <DialogTitle>{t('courseStudents.dialog.title')}</DialogTitle>
              <DialogDescription>
                {t('courseStudents.dialog.description', { email: row.original.user?.email })}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('courseStudents.dialog.overallProgress')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress 
                    value={(row.original.completedComponents / row.original.totalComponents) * 100} 
                    className="mb-2"
                  />
                  <p className="text-sm text-muted-foreground">
                    {t('courseStudents.dialog.componentsCompleted', { 
                      completed: row.original.completedComponents, 
                      total: row.original.totalComponents 
                    })}
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('courseStudents.dialog.videosProgress')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgressSection 
                      title={t('courseStudents.dialog.videos')}
                      items={row.original.componentProgress?.videos?.byId}
                      renderItem={(id, video) => <VideoProgress key={id} id={id} video={video} t={t} />}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('courseStudents.dialog.quizzesProgress')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgressSection 
                      title={t('courseStudents.dialog.quizzes')}
                      items={row.original.componentProgress?.quizzes?.byId}
                      renderItem={(id, quiz) => <QuizProgress key={id} id={id} quiz={quiz} t={t} />}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {}}>
                {t('courseStudents.dialog.close')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
    }
  ];

  if (isLoading || courseLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error || courseError) {
    return (
      <div className="text-red-500">
        {error?.message || courseError?.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('courseStudents.title')}</CardTitle>
          <CardDescription>
            {t('courseStudents.description', { courseTitle: course?.title })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns}
            data={students}
          />
        </CardContent>
      </Card>
    </div>
  );
}
