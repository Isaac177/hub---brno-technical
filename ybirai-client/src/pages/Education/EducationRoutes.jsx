import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import SchoolsDashboard from '../Schools/SchoolsDashboard.jsx';
import SchoolDetails from '../Schools/SchoolDetails.jsx';
import SchoolCourses from '../Courses/SchoolCourses.jsx';
import CreateSchoolForm from "../../components/forms/CreateSchoolForm.jsx";
import Education from './index.jsx';
import { useAuth } from "../../contexts/AuthContext.jsx";
import EducationLayout from "../../components/layouts/EducationLayout.jsx";
import StudentsManagementLayout from "../../components/layouts/StudentsManagementLayout.jsx";
import CreateCourseForm from "../../components/forms/CreateCourseForm.jsx";
import UpdateCourseForm from "../../components/forms/UpdateCourseForm.jsx";
import SchoolCoursesManage from "../Courses/SchoolCoursesManage.jsx";
import SchoolStudentCourses from "../Students/SchoolStudentCourses.jsx";
import CourseStudents from "../Students/CourseStudents.jsx";
import EnrolledCourses from "../../components/education/EnrolledCourses.jsx";
import CourseLearningLayout from "../../components/layouts/CourseLearningLayout.jsx";
import CourseLearning from "./CourseLearning.jsx";
import Quizzes from "./Quizzes.jsx";
import AdminQuizzes from "./AdminQuizzes.jsx";
import QuizManagementLayout from "../../components/layouts/QuizManagementLayout.jsx";
import CreateQuiz from "./CreateQuiz.jsx";
import QuizDetails from "./QuizDetails.jsx";
import AllQuizzes from "./AllQuizzes.jsx";
import StudentQuizDetails from "./StudentQuizDetails.jsx"
import CourseProgress from "./CourseProgress.jsx";
import CourseSyllabus from "../../components/education/CourseSyllabus.jsx";
import StudentRequests from '../Students/StudentRequests.jsx';
import { SchoolProvider } from "../../contexts/SchoolContext.jsx";
import CategoryManagement from '../BlogManagement/CategoryManagement.jsx';
import UserManagement from './UserManagement.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import BlogManagementRoutes from '../BlogManagement/BlogManagementRoutes.jsx';
import CourseUpdateOverview from "../../components/course/CourseUpdateOverview.jsx";

export function EducationRoutes({ userRole }) {
  const { userSub } = useAuth();
  const { displayLanguage } = useLanguage();

  if (!userRole || !userSub) {
    return <Navigate to={`/${displayLanguage}/login`} replace />;
  }

  return (
    <SchoolProvider>
      <Routes>
        <Route
          path="admin/education/quizzes/*"
          element={
            <QuizManagementLayout>
              <Outlet />
            </QuizManagementLayout>
          }
        >
          <Route index element={<AdminQuizzes view="courses" />} />
          <Route path="all" element={<AllQuizzes />} />
          <Route path="create" element={<CreateQuiz />} />
          <Route path="create/:courseId" element={<CreateQuiz />} />
          <Route path=":quizId" element={<QuizDetails />} />
        </Route>

        <Route
          element={
            <EducationLayout>
              <Outlet />
            </EducationLayout>
          }
        >
          <Route index element={<Navigate to={
            userRole === 'PLATFORM_ADMIN' ? "super/education" :
              userRole === 'SCHOOL_ADMIN' ? "admin/education/schools" :
                "student/education"
          } replace />} />
          <Route path="admin/education/schools" element={<SchoolsDashboard />} />
          <Route path="admin/education/courses" element={<SchoolCourses />} />
          <Route path="admin/education/student-requests" element={<StudentRequests />} />
          <Route path="admin/education/add-school" element={<CreateSchoolForm />} />
          <Route path="admin/education/add-course" element={<CreateCourseForm />} />
          <Route path="admin/education/update-course/:courseId" element={<CourseUpdateOverview />} />
          <Route path="admin/education/update-course-full/:courseId" element={<UpdateCourseForm />} />
          <Route path="admin/education/courses/manage/:schoolId" element={<SchoolCoursesManage />} />
          <Route path="student/education" element={<Outlet />}>
            <Route index element={<EnrolledCourses />} />
            <Route path="courses" element={<SchoolCourses />} />
          </Route>
          <Route path="super/education" element={<Education />} />
          <Route path="super/education/schools" element={<SchoolsDashboard />} />
          <Route path="super/education/schools/:schoolId" element={<SchoolDetails />} />
          <Route path="super/education/users" element={<UserManagement />} />
          <Route path="super/education/courses" element={<SchoolCourses />} />
          <Route path="super/education/courses/manage/:schoolId" element={<SchoolCoursesManage />} />
          <Route path="super/education/categories" element={<CategoryManagement />} />
          <Route path="admin/education/categories" element={<CategoryManagement />} />
        </Route>

        <Route path="student/education/course/:courseId/*" element={<CourseLearningLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<CourseLearning />} />
          <Route path="syllabus" element={<CourseSyllabus />} />
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="quizzes/:quizId" element={<StudentQuizDetails />} />
          <Route path="progress" element={<CourseProgress />} />
        </Route>

        <Route
          path="admin/education/students/*"
          element={
            <StudentsManagementLayout>
              <Outlet />
            </StudentsManagementLayout>
          }
        >
          <Route index element={<SchoolStudentCourses />} />
          <Route path="schools/:schoolId/courses" element={<SchoolStudentCourses />} />
          <Route path="schools/:schoolId/courses/course/:courseId/students" element={<CourseStudents />} />
        </Route>

        <Route path="platform_admin/blog-management/*" element={<BlogManagementRoutes />} />
        <Route path="super/education/blog-management/*" element={<BlogManagementRoutes />} />

        <Route path="*" element={
          <Navigate to={`/${displayLanguage}/${userSub}/${userRole === 'SCHOOL_ADMIN' ? 'admin' :
            userRole === 'PLATFORM_ADMIN' ? 'super' :
              'student'}/education`} replace />
        } />
      </Routes>
    </SchoolProvider>
  );
}

export default EducationRoutes;