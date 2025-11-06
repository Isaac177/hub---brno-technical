import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { cn } from "../../lib/utils";
import { ScrollArea } from "./scroll-area";
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  FileText,
  CheckSquare,
  Video,
  BarChart2,
  GraduationCap
} from 'lucide-react';
import { progressKeys } from '../../hooks/useProgress';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export const CourseSidebar = () => {
  const { schoolId, courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { displayLanguage } = useLanguage();
  const { t } = useTranslation();

  useEffect(() => {
    if (courseId && user?.email) {
      queryClient.prefetchQuery({
        queryKey: progressKeys.detail(courseId, user.email),
      });
    }
  }, [courseId, user?.email, queryClient]);

  const sidebarItems = [
    {
      icon: BookOpen,
      title: 'Course Overview',
      href: `/${displayLanguage}/${schoolId}/course/${courseId}/overview`,
      description: 'General course information and objectives'
    },
    {
      icon: FileText,
      title: 'Syllabus',
      href: `/${displayLanguage}/${schoolId}/course/${courseId}/syllabus`,
      description: 'Course curriculum and structure'
    },
    {
      icon: Video,
      title: 'Lessons',
      href: `/${displayLanguage}/${schoolId}/course/${courseId}/lessons`,
      description: 'Video content and learning materials'
    },
    {
      icon: CheckSquare,
      title: 'Quizzes',
      href: `/${displayLanguage}/${schoolId}/course/${courseId}/quizzes`,
      description: 'Assessments and practice tests'
    },
    {
      icon: BarChart2,
      title: 'Progress',
      href: `/${displayLanguage}/${schoolId}/course/${courseId}/progress`,
      description: 'Track your learning progress'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

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
              Course Menu
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Learning materials
            </p>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <nav className="space-y-2">
            {sidebarItems.map((item, index) => {
              const isActive = location.pathname === item.href ||
                location.pathname.startsWith(item.href + '/');

              return (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "group flex flex-col gap-1 rounded-xl p-4 transition-all duration-200 hover:shadow-md border border-transparent w-full text-left",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
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
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Course Learning Platform
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseSidebar;
