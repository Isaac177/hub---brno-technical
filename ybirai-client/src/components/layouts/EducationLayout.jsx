import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SuperAdminSidebar } from '../ui/super-admin-sidebar';
import { SchoolAdminSidebar } from '../ui/school-admin-sidebar';
import { StudentSidebar } from '../ui/student-sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../contexts/UserContext';
import { Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from "../../lib/utils";

const EducationLayout = () => {
  const { userSub } = useAuth();
  const { userData } = useUserData();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const renderSidebar = () => {
    const role = userData?.role;
    const pathname = location.pathname;

    const coursePageMatch = pathname.match(/\/course\/([^\/]+)/);
    if (coursePageMatch) {
      return null;
    }

    if (pathname.includes('/admin/education/schools') || role === 'SCHOOL_ADMIN') {
      return <SchoolAdminSidebar />;
    } else if (pathname.includes('/super/education') || role === 'PLATFORM_ADMIN') {
      return <SuperAdminSidebar />;
    } else if (pathname.includes('/student/education') || role === 'STUDENT') {
      return <StudentSidebar />;
    }

    return null;
  };

  const sidebar = renderSidebar();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      {sidebar && (
        <>
          <Button
            variant="ghost"
            className="fixed top-4 left-4 z-50 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <aside
            className={cn(
              "fixed md:relative md:block top-0 left-0 z-10 w-fit h-screen",
              isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}
          >
            <div className="h-full overflow-y-auto">
              {sidebar}
            </div>
          </aside>
        </>
      )}

      <main className={cn(
        "flex-1 overflow-x-hidden",
        sidebar ? "px-4" : "px-0"
      )}>
        <div className={cn(
          sidebar ? "py-6" : "py-0"
        )}>
          <Outlet />
        </div>
      </main>

      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default EducationLayout;
