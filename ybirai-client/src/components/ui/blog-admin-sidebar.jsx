import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext.jsx";
import {
  BarChart3,
  FileText,
  MessageSquare,
  Tags,
  ThumbsUp,
  Eye,
  Settings,
} from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';

export default function BlogAdminSidebar() {
  const location = useLocation();
  const { userSub } = useAuth();
  const { t } = useTranslation();
  const { displayLanguage } = useLanguage();

  const basePath = `/${displayLanguage}/${userSub}/platform_admin/blog-management`;

  const menuItems = [
    {
      title: t('admin.blog.sidebar.overview'),
      icon: BarChart3,
      href: basePath,
    },
    {
      title: t('admin.blog.sidebar.posts'),
      icon: FileText,
      href: `${basePath}/posts`,
    },
    {
      title: t('admin.blog.sidebar.categories'),
      icon: Tags,
      href: `${basePath}/categories`,
    },
    {
      title: t('admin.blog.sidebar.comments'),
      icon: MessageSquare,
      href: `${basePath}/comments`,
    },
    {
      title: t('admin.blog.sidebar.tags'),
      icon: Tags,
      href: `${basePath}/tags`,
    },
    {
      title: t('admin.blog.sidebar.likes'),
      icon: ThumbsUp,
      href: `${basePath}/likes`,
    },
    {
      title: t('admin.blog.sidebar.views'),
      icon: Eye,
      href: `${basePath}/views`,
    },
    {
      title: t('admin.blog.sidebar.settings'),
      icon: Settings,
      href: `${basePath}/settings`,
    },
  ];

  return (
    <div className="pb-12 w-64">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  location.pathname === item.href ? "bg-accent" : "transparent"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
