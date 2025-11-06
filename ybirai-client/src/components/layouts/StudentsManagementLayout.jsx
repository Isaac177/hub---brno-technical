import React from 'react';
import { Outlet } from 'react-router-dom';
import { StudentsManagementSidebar } from '../ui/students-management-sidebar';
import { Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from "../../lib/utils";

const StudentsManagementLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen">
      <div className="mx-auto w-full flex">
        {/* Sidebar */}
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
              "fixed md:relative md:block top-0 left-0 z-10 w-[280px] h-screen border-r",
              isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}
          >
            <div className="h-full overflow-y-auto py-4">
              <StudentsManagementSidebar />
            </div>
          </aside>
        </>

        <main className={cn(
          "flex-1 overflow-x-hidden px-4",
        )}>
          <div className="py-6">
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
    </div>
  );
};

export default StudentsManagementLayout;
