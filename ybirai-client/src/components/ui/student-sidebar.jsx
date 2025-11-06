import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from "../../lib/utils";
import { ScrollArea } from "./scroll-area";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  GraduationCap,
  Calendar,
  BookMarked,
  MessageSquare,
  Award,
  Clock,
  Settings,
  BarChart2,
  User
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function StudentSidebar() {
  const { userSub } = useParams();
  const { t } = useTranslation();
  const { displayLanguage } = useLanguage();

  const menuItems = [
    {
      title: t('sidebar.student.myCourses'),
      icon: BookOpen,
      href: '/student/education',
      description: 'View your enrolled courses'
    },
    // {
    //   title: t('sidebar.student.learningPath'),
    //   icon: GraduationCap,
    //   href: '/student/education/learning-path',
    //   description: 'Track your learning journey'
    // },
    // {
    //   title: t('sidebar.student.schedule'),
    //   icon: Calendar,
    //   href: '/student/education/schedule',
    //   description: 'View your class schedule'
    // },
    // {
    //   title: t('sidebar.student.assignments'),
    //   icon: BookMarked,
    //   href: '/student/education/assignments',
    //   description: 'Complete your assignments'
    // },
    // {
    //   title: t('sidebar.student.forums'),
    //   icon: MessageSquare,
    //   href: '/student/education/forums',
    //   description: 'Join discussions'
    // },
    // {
    //   title: t('sidebar.student.certificates'),
    //   icon: Award,
    //   href: '/student/education/certificates',
    //   description: 'View your achievements'
    // },
    // {
    //   title: t('sidebar.student.progress'),
    //   icon: BarChart2,
    //   href: '/student/education/progress',
    //   description: 'Monitor your progress'
    // },
    // {
    //   title: t('sidebar.student.history'),
    //   icon: Clock,
    //   href: '/student/education/history',
    //   description: 'View learning history'
    // },
    // {
    //   title: t('sidebar.student.settings'),
    //   icon: Settings,
    //   href: '/student/education/settings',
    //   description: 'Customize your experience'
    // },
  ];

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 w-72 shadow-sm">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {t('sidebar.student.title')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Learning platform
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
            Student Learning System v1.0
          </div>
        </div>
      </div>
    </div>
  );
}
