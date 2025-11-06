import React, { useEffect, useMemo } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from "../../lib/utils";
import CourseSidebar from '../education/CourseSidebar';
import { VideoPlayerProvider } from '../../contexts/VideoPlayerContext';
import { useCourse } from '../../contexts/CourseContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useGetEnrolledCourses } from '../../hooks/useGetEnrolledCourses';

const CourseLearningLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { courseId } = useParams();
  const { isConnected, joinRoom, leaveRoom } = useWebSocket();
  const { data: enrollmentData, isLoading: enrollmentLoading } = useGetEnrolledCourses();
  const { selectedCourse: course } = useCourse();

  const enrollmentId = useMemo(() => {
    if (!enrollmentData?.enrollments || !courseId) return null;
    const enrollment = enrollmentData.enrollments.find(e => e.courseId === courseId);
    return enrollment?.id || null;
  }, [enrollmentData?.enrollments, courseId]);

  useEffect(() => {
    if (!isConnected || !courseId || enrollmentLoading || !enrollmentId) {
      return;
    }

    return () => {
      leaveRoom();
    };
  }, [isConnected, courseId, enrollmentId, enrollmentLoading, joinRoom, leaveRoom]);

  if (enrollmentLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!enrollmentId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">No enrollment found</h2>
          <p className="text-gray-600">You are not enrolled in this course.</p>
        </div>
      </div>
    );
  }

  if (!courseId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Invalid course</h2>
          <p className="text-gray-600">Course ID is missing or invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <VideoPlayerProvider courseId={courseId} enrollmentId={enrollmentId}>
      <div className="min-h-screen bg-background">
        <div className="flex min-h-screen relative">
          <Button
            variant="ghost"
            className="fixed bottom-12 left-4 z-50 md:hidden p-4 rounded-full shadow-lg hover:bg-gray-100 transition-colors bg-blue-500 to indigo-500 text-white"
            aria-label="Toggle Menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <aside
            className={cn(
              "fixed md:relative md:block top-0 left-0 h-screen bg-background z-10",
              isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}
          >
            <div className="h-full overflow-y-auto">
              <CourseSidebar />
            </div>
          </aside>

          <main className="flex-1 overflow-x-hidden">
            <Outlet />
          </main>

          {isMenuOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
          )}
        </div>
      </div>
    </VideoPlayerProvider>
  );
};

export default CourseLearningLayout;