import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from "../../lib/utils";
import { ScrollArea } from "./scroll-area";
import { useTranslation } from 'react-i18next';
import {
  School,
  BookOpen,
  Users,
  UserPlus,
  PlusCircle,
  Settings,
  LayoutDashboard,
  Calendar,
  MessageSquare,
  FolderTree,
  GraduationCap
} from 'lucide-react';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useLanguage } from '../../contexts/LanguageContext.jsx';

export function SchoolAdminSidebar() {
  const { userSub } = useParams();
  const { t } = useTranslation();
  const { displayLanguage } = useLanguage();

  const menuItems = [
    {
      title: t('sidebar.schoolAdmin.schools'),
      icon: School,
      href: '/admin/education/schools',
      description: t('sidebar.schoolAdmin.descriptions.schools')
    },
    {
      title: t('sidebar.schoolAdmin.courses'),
      icon: BookOpen,
      href: '/admin/education/courses',
      description: t('sidebar.schoolAdmin.descriptions.courses')
    },
    {
      title: t('sidebar.schoolAdmin.quizzes'),
      icon: BookOpen,
      href: '/admin/education/quizzes',
      description: t('sidebar.schoolAdmin.descriptions.quizzes')
    },
    {
      title: t('sidebar.schoolAdmin.students'),
      icon: Users,
      href: '/admin/education/students',
      description: t('sidebar.schoolAdmin.descriptions.students')
    },
    {
      title: t('sidebar.schoolAdmin.studentRequests'),
      icon: UserPlus,
      href: '/admin/education/student-requests',
      description: t('sidebar.schoolAdmin.descriptions.studentRequests')
    },
    {
      title: t('sidebar.schoolAdmin.addSchool'),
      icon: PlusCircle,
      href: '/admin/education/add-school',
      description: t('sidebar.schoolAdmin.descriptions.addSchool')
    },
    {
      title: t('sidebar.schoolAdmin.createCourse'),
      icon: PlusCircle,
      href: '/admin/education/add-course',
      description: t('sidebar.schoolAdmin.descriptions.createCourse')
    },

  ];

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 w-72">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {t('sidebar.schoolAdmin.title')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Education platform
            </p>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <nav className="space-y-2">
            {menuItems.map((item, index) => {
              const fullPath = `/${displayLanguage}/${userSub}${item.href}`;
              const isActive = location.pathname === fullPath ||
                location.pathname.startsWith(fullPath + '/');

              return (
                <NavLink
                  key={item.href}
                  to={fullPath}
                  end
                  className={({ isActive }) =>
                    cn(
                      "group flex flex-col gap-1 rounded-xl p-4 transition-all duration-200 hover:shadow-md border border-transparent",
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    )
                  }
                >
                  {({ isActive }) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg transition-colors",
                          isActive
                            ? "bg-blue-100 dark:bg-blue-800/30"
                            : "bg-slate-100 dark:bg-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-600"
                        )}>
                          <item.icon className={cn(
                            "h-5 w-5 transition-colors",
                            isActive
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-600 dark:text-slate-300"
                          )} />
                        </div>
                        <div className="flex-1">
                          <div className={cn(
                            "font-semibold text-sm transition-colors",
                            isActive
                              ? "text-blue-900 dark:text-blue-100"
                              : "text-slate-900 dark:text-slate-100"
                          )}>
                            {item.title}
                          </div>
                        </div>
                      </div>
                      <p className={cn(
                        "text-xs ml-11 transition-colors",
                        isActive
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-slate-500 dark:text-slate-400"
                      )}>
                        {item.description}
                      </p>
                    </motion.div>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
            School Management System v1.0
          </div>
        </div>
      </div>
    </div>
  );
}
