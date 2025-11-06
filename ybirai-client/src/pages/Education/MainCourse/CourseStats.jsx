import React from 'react';
import { Clock, Target, FileText, BookOpen } from "lucide-react";
import { useTranslation } from 'react-i18next';

export const CourseStats = ({ syllabus, level, language, estimatedHours }) => {
  const { t } = useTranslation();

  const stats = [
    {
      icon: Clock,
      label: t('course.sidebar.sectionsCount'),
      value: syllabus?.length || 0,
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Target,
      label: level || t('courseCard.level.notSpecified'),
      value: "",
      color: "from-green-500 to-green-600"
    },
    {
      icon: FileText,
      label: language || t('courseCard.language.notSpecified'),
      value: "",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: BookOpen,
      label: estimatedHours || t('course.sidebar.selfPaced'),
      value: "",
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className="group relative p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg bg-gradient-to-r ${stat.color} transition-all duration-300`}>
                <IconComponent className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {stat.value ? `${stat.label}: ${stat.value}` : stat.label}
                </p>
              </div>
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        );
      })}
    </div>
  );
};

export default CourseStats;