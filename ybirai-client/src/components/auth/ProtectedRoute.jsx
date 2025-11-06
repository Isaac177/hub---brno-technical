import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../contexts/UserContext';
import { LoaderCircle } from "lucide-react";
import { useLanguage } from '../../contexts/LanguageContext';

export const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoading: authLoading, userSub } = useAuth();
  const { userData, isLoading: userDataLoading } = useUserData();
  const location = useLocation();
  const { displayLanguage } = useLanguage();

  if (authLoading || userDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderCircle className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  if (!isSignedIn || !userSub) {
    sessionStorage.setItem('redirectPath', location.pathname);
    return <Navigate to={`/${displayLanguage}/login`} state={{ from: location }} replace />;
  }

  if (!userData || !userData.role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderCircle className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  const role = userData.role.toUpperCase();
  const currentPath = location.pathname;
  const rolePrefix = role === 'SCHOOL_ADMIN' ? 'admin' :
    role === 'PLATFORM_ADMIN' ? 'platform_admin' : 'student';

  const expectedBasePath = `/${displayLanguage}/${userSub}/${rolePrefix}`;

  if (role === 'PLATFORM_ADMIN') {
    const validPaths = [
      `/${displayLanguage}/${userSub}/platform_admin`,
      `/${displayLanguage}/${userSub}/platform_admin/blog-management`,
      `/${displayLanguage}/${userSub}/super/education`,
      `/${displayLanguage}/${userSub}/super/education/schools`,
      `/${displayLanguage}/${userSub}/super/education/users`,
      `/${displayLanguage}/${userSub}/super/education/courses`,
      `/${displayLanguage}/${userSub}/super/education/categories`,
      `/${displayLanguage}/${userSub}/super/education/content`,
      `/${displayLanguage}/${userSub}/super/education/analytics`,
      `/${displayLanguage}/${userSub}/super/education/settings`,
      `/${displayLanguage}/${userSub}/super/education/security`,
      `/${displayLanguage}/${userSub}/super/education/notifications`,
      `/${displayLanguage}/${userSub}/super/education/support`
    ];

    const isValidPath = validPaths.some(path => currentPath.startsWith(path));
    if (isValidPath) {
      return children;
    }

    if (currentPath === `/${displayLanguage}/${userSub}/education`) {
      return <Navigate to={`/${displayLanguage}/${userSub}/super/education`} replace />;
    }
  }

  const validPaths = [
    expectedBasePath,
    `${expectedBasePath}/education`
  ];

  const isValidPath = validPaths.some(path => currentPath.startsWith(path));
  if (isValidPath) {
    return children;
  }

  return <Navigate to={`${expectedBasePath}/education/schools`} replace />;
};
