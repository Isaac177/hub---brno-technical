import { Route, Routes, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';

import Register from "./components/auth/Register.jsx";
import Navbar from "./components/header/Navbar.jsx";
import Footer from "./components/header/Footer.jsx";
import useDarkMode from "./components/hooks/useDarkMode.js";
import Forum from "./pages/Forum/";
import ForumDetailed from "./pages/ForumDetailed/";
import ForumMain from "./pages/Forum/ForumMain.jsx";
import Home from "./pages/Home/Home.jsx";
import News from "./pages/News/News.jsx";
import PostDetail from "./pages/News/PostDetail.jsx";
import NewsArticle from "./pages/News/NewsArticle.jsx";
import Catalog from "./pages/Catalog/Catalog.jsx";
import Profile from "./pages/Profile/";
import EditProfile from "./pages/EditProfile/index.jsx";
import Tests from "./pages/Tests/index.jsx";
import TestPage from "./pages/Test/index.jsx";
import Orders from "./pages/Orders/index.jsx";
import Help from "./pages/Help/index.jsx";
import { Login } from "./components/auth/Login.jsx";
import VerifyEmail from "./components/auth/VerifyEmail.jsx";
import ForgotPassword from "./components/auth/ForgotPassword.jsx";
import Course from "./pages/Course/index.jsx";
import Single from "./pages/CoursePage/Single.jsx";
import Courses from "./pages/Courses/index.jsx";
import Students from "./pages/Students/index.jsx";
import AddSchools from "./pages/AddSchools/index.jsx";
import AddCourse from "./pages/AddCourse/index.jsx";
import AddCourseModule from "./pages/EditCourseModule/index.jsx";
import EditCourseModule from "./pages/EditCourseModule/index.jsx";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.jsx";
import { useAuth } from "./contexts/AuthContext.jsx";
import { LoaderCircle } from "lucide-react";
import EducationRoutes from "./pages/Education/EducationRoutes.jsx";
import BlogManagementRoutes from "./pages/BlogManagement/BlogManagementRoutes.jsx";
import { useUserData } from "./contexts/UserContext.jsx";

function App() {
  const darkMode = useDarkMode();
  const { t } = useTranslation();

  const { isLoading, userSub } = useAuth();

  const { userData } = useUserData();

  if (isLoading) {
    return (
      <div
        className={`${darkMode.value ? "dark" : ""
          } min-h-screen flex items-center justify-center bg-gradient-to-br from-light-from to-light-to dark:from-dark-from dark:to-dark-to`}
      >
        <LoaderCircle className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  const supportedLanguages = ['en', 'kz', 'ru'];

  return (
    <main
      className={`${darkMode.value ? "dark" : ""
        } text-foreground bg-background transition-all duration-300`}
    >
      <Navbar />
      <AnimatePresence wait>
        <Routes>
          {/* Language redirect */}
          <Route path="/" element={<Navigate to="/ru" replace />} />

          {/* Localized routes */}
          {supportedLanguages.map((lang) => (
            <Route key={`${lang}-home`} path={`/${lang}`} element={<Home />} />
          ))}
          {supportedLanguages.map((lang) => (
            <Route key={`${lang}-news`} path={`/${lang}/news`} element={<News />} />
          ))}
          {supportedLanguages.map((lang) => (
            <Route key={`${lang}-news-slug`} path={`/${lang}/news/:slug`} element={<NewsArticle />} />
          ))}
          {supportedLanguages.map((lang) => (
            <Route key={`${lang}-news-id`} path={`/${lang}/news/:id`} element={<PostDetail />} />
          ))}
          {supportedLanguages.map((lang) => (
            <Route key={`${lang}-login`} path={`/${lang}/login`} element={<Login />} />
          ))}
          {supportedLanguages.map((lang) => (
            <Route key={`${lang}-register`} path={`/${lang}/register`} element={<Register />} />
          ))}
          {supportedLanguages.map((lang) => (
            <Route key={`${lang}-verify`} path={`/${lang}/verify-email`} element={<VerifyEmail />} />
          ))}
          {supportedLanguages.map((lang) => (
            <Route key={`${lang}-forgot`} path={`/${lang}/forgot-password`} element={<ForgotPassword />} />
          ))}
          {supportedLanguages.map((lang) => (
            <Route key={`${lang}-forum-new`} path={`/${lang}/forum/new`} element={<ForumMain />} />
          ))}
          {supportedLanguages.map((lang) => (
            <Route key={`${lang}-forum`} path={`/${lang}/forum`} element={<ForumMain />} />
          ))}
          {supportedLanguages.map((lang) => (
            <Route key={`${lang}-single`} path={`/${lang}/single`} element={<Single />} />
          ))}
          {supportedLanguages.map((lang) => (
            <Route key={`${lang}-catalog`} path={`/${lang}/catalog`} element={<Catalog />} />
          ))}
          {supportedLanguages.map((lang) => (
            <Route key={`${lang}-catalog-id`} path={`/${lang}/catalog/:id`} element={<Single />} />
          ))}

          {/* Protected routes with language prefix */}
          {supportedLanguages.map((lang) => (
            <Route
              key={`${lang}-blog-management`}
              path={`/${lang}/:userSub/platform_admin/blog-management/*`}
              element={
                <ProtectedRoute>
                  <BlogManagementRoutes />
                </ProtectedRoute>
              }
            />
          ))}

          {supportedLanguages.map((lang) => (
            <Route
              key={`${lang}-education`}
              path={`/${lang}/:userSub/*`}
              element={
                <ProtectedRoute>
                  <EducationRoutes userRole={userData?.role} />
                </ProtectedRoute>
              }
            />
          ))}

          {supportedLanguages.map((lang) => (
            <Route
              key={`${lang}-profile`}
              path={`/${lang}/${userSub}/profile`}
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          ))}

          {supportedLanguages.map((lang) => (
            <Route
              key={`${lang}-profile-edit`}
              path={`/${lang}/${userSub}/profile/edit`}
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
          ))}

          {supportedLanguages.map((lang) => (
            <Route
              key={`${lang}-course`}
              path={`/${lang}/course/:id`}
              element={
                <ProtectedRoute>
                  <Course />
                </ProtectedRoute>
              }
            />
          ))}

          {supportedLanguages.map((lang) => (
            <Route
              key={`${lang}-tests`}
              path={`/${lang}/tests`}
              element={
                <ProtectedRoute>
                  <Tests />
                </ProtectedRoute>
              }
            />
          ))}

          {supportedLanguages.map((lang) => (
            <Route
              key={`${lang}-test-id`}
              path={`/${lang}/tests/:id`}
              element={
                <ProtectedRoute>
                  <TestPage />
                </ProtectedRoute>
              }
            />
          ))}

          {supportedLanguages.map((lang) => (
            <Route
              key={`${lang}-orders`}
              path={`/${lang}/orders`}
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
          ))}

          {supportedLanguages.map((lang) => (
            <Route
              key={`${lang}-help`}
              path={`/${lang}/help`}
              element={
                <ProtectedRoute>
                  <Help />
                </ProtectedRoute>
              }
            />
          ))}

          {/* Moderator routes with language prefix */}
          {supportedLanguages.map((lang) => (
            <Route
              key={`${lang}-mod-schools-add`}
              path={`/${lang}/moderator/schools/add`}
              element={<AddSchools />}
            />
          ))}

          {supportedLanguages.map((lang) => (
            <Route
              key={`${lang}-mod-courses`}
              path={`/${lang}/moderator/courses`}
              element={<Courses />}
            />
          ))}

          {supportedLanguages.map((lang) => (
            <Route
              key={`${lang}-mod-courses-add`}
              path={`/${lang}/moderator/courses/add`}
              element={<AddCourse />}
            />
          ))}

          {supportedLanguages.map((lang) => (
            <Route
              key={`${lang}-mod-courses-add-id`}
              path={`/${lang}/moderator/courses/add/:courseid`}
              element={<AddCourseModule />}
            />
          ))}

          {supportedLanguages.map((lang) => (
            <Route
              key={`${lang}-mod-courses-module`}
              path={`/${lang}/moderator/courses/add/:courseid/module/:moduleid`}
              element={<EditCourseModule />}
            />
          ))}

          {supportedLanguages.map((lang) => (
            <Route
              key={`${lang}-mod-students`}
              path={`/${lang}/moderator/students`}
              element={<Students />}
            />
          ))}

          {supportedLanguages.map((lang) => (
            <Route
              key={`${lang}-education-routes`}
              path={`/${lang}/education/*`}
              element={<EducationRoutes />}
            />
          ))}

          {/* Catch all redirect to language prefix */}
          <Route path="*" element={<Navigate to="/ru" replace />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </main>
  );
}

export default App;
