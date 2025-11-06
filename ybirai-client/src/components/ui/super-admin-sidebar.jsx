import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  FileText,
  Shield,
  FolderTree
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { useUserData } from '../../contexts/UserContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';

export function SuperAdminSidebar() {
  const location = useLocation();
  const { userSub } = useAuth();
  const { t } = useTranslation();
  const { displayLanguage } = useLanguage();
  const { userData } = useUserData();

  const menuItems = [
    {
      title: t('sidebar.superAdmin.dashboard'),
      icon: LayoutDashboard,
      href: `/${displayLanguage}/${userSub}/super/education`,
    },
    {
      title: t('sidebar.superAdmin.schoolsManagement'),
      icon: Building2,
      href: `/${displayLanguage}/${userSub}/super/education/schools`,
    },
    {
      title: t('sidebar.superAdmin.userManagement'),
      icon: Users,
      href: `/${displayLanguage}/${userSub}/super/education/users`,
    },
    {
      title: t('sidebar.superAdmin.courseManagement'),
      icon: GraduationCap,
      href: `/${displayLanguage}/${userSub}/super/education/courses`,
    },
    {
      title: t('sidebar.superAdmin.categories'),
      icon: FolderTree,
      href: `/${displayLanguage}/${userSub}/super/education/categories`,
    },
    {
      title: t('common.blogManagement'),
      icon: FileText,
      href: `/${displayLanguage}/${userSub}/super/education/blog-management`,
    },
  ];

  const coreItems = menuItems.slice(0, 5);
  const contentItems = menuItems.slice(5, 7);
  const systemItems = menuItems.slice(7);

  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t('sidebar.superAdmin.title')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              System Administrator
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-3">
              Core Management
            </h3>
            <div className="space-y-1">
              {coreItems.map((item) => (
                <Link key={item.href} to={item.href} className="block">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-10 px-3 text-sm font-medium transition-all duration-200",
                      location.pathname === item.href
                        ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                    )}
                  >
                    <item.icon className={cn(
                      "h-4 w-4 shrink-0",
                      location.pathname === item.href
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-500 dark:text-slate-400"
                    )} />
                    <span className="truncate">{item.title}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-3">
              Content
            </h3>
            <div className="space-y-1">
              {contentItems.map((item) => (
                <Link key={item.href} to={item.href} className="block">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-10 px-3 text-sm font-medium transition-all duration-200",
                      location.pathname === item.href
                        ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                    )}
                  >
                    <item.icon className={cn(
                      "h-4 w-4 shrink-0",
                      location.pathname === item.href
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-500 dark:text-slate-400"
                    )} />
                    <span className="truncate">{item.title}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="space-y-1">
              {systemItems.map((item) => (
                <Link key={item.href} to={item.href} className="block">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-10 px-3 text-sm font-medium transition-all duration-200",
                      location.pathname === item.href
                        ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                    )}
                  >
                    <item.icon className={cn(
                      "h-4 w-4 shrink-0",
                      location.pathname === item.href
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-500 dark:text-slate-400"
                    )} />
                    <span className="truncate">{item.title}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
