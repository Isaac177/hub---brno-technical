import React from "react";
import { NavLink, useParams } from "react-router-dom";
import { cn } from "../../lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { GraduationCap, BookOpen, PlusCircle, Brain } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTranslation } from "react-i18next";

const QuizSidebar = () => {
  const { userSub } = useParams();
  const { displayLanguage } = useLanguage();
  const { t } = useTranslation();

  const navItems = [
    {
      title: t('quizSidebar.myCourses'),
      icon: GraduationCap,
      href: `/${displayLanguage}/${userSub}/admin/education/quizzes`,
      description: t('quizSidebar.myCoursesDesc'),
    },
    {
      title: t('quizSidebar.allQuizzes'),
      icon: BookOpen,
      href: `/${displayLanguage}/${userSub}/admin/education/quizzes/all`,
      description: t('quizSidebar.allQuizzesDesc'),
    },
  ];

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 w-72 shadow-sm">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {t('quizSidebar.title')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('quizSidebar.subtitle')}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <nav className="space-y-2">
            {navItems.map((item, index) => (
              <NavLink
                key={item.href}
                to={item.href}
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
                  <>
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
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
            {t('quizSidebar.footer')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizSidebar;
