import React from "react";
import { Clock, Calendar, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

const Schedule = () => {
  const { t } = useTranslation();

  // Моковые данные
  const lessons = [
    {
      id: 1,
      title: t('learningPath.steps.basics.title'),
      duration: t('schedule.duration', { hours: 2 }),
      daysToMaster: 3,
      difficulty: t('schedule.difficulty.easy'),
      status: "completed"
    },
    {
      id: 2,
      title: t('learningPath.steps.oop.title'),
      duration: t('schedule.duration', { hours: 3 }),
      daysToMaster: 5,
      difficulty: t('schedule.difficulty.medium'),
      status: "upcoming"
    },
    {
      id: 3,
      title: t('learningPath.steps.spring.title'),
      duration: t('schedule.duration', { hours: 4 }),
      daysToMaster: 7,
      difficulty: t('schedule.difficulty.hard'),
      status: "upcoming"
    },
    {
      id: 4,
      title: t('learningPath.steps.microservices.title'),
      duration: t('schedule.duration', { hours: 3 }),
      daysToMaster: 6,
      difficulty: t('schedule.difficulty.medium'),
      status: "upcoming"
    },
    {
      id: 5,
      title: t('learningPath.steps.finalProject.title'),
      duration: t('schedule.duration', { hours: 6 }),
      daysToMaster: 10,
      difficulty: t('schedule.difficulty.hard'),
      status: "upcoming"
    },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">{t('schedule.title')}</h1>
        <p className="text-lg text-gray-500 mt-2">{t('schedule.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className={`relative p-6 rounded-xl shadow-lg flex flex-col items-center text-center ${lesson.status === "completed"
              ? "bg-gradient-to-r from-green-400 to-green-500 text-white"
              : "bg-gradient-to-r from-blue-400 to-blue-500 text-white"
              }`}
          >
            <div className="flex items-center justify-center mb-4">
              <Calendar className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-lg font-bold">{lesson.title}</h3>
            <p className="text-sm mt-2">
              <Clock className="inline h-5 w-5 mr-1 text-white" /> {lesson.duration}
            </p>
            <p className="text-sm mt-2">
              <Star className="inline h-5 w-5 mr-1 text-white" /> {t('schedule.difficulty.label')}: {lesson.difficulty}
            </p>
            <p className="text-sm mt-2">
              <Calendar className="inline h-5 w-5 mr-1 text-white" /> {t('schedule.mastery')}: {t('schedule.days', { count: lesson.daysToMaster })}
            </p>
            <div
              className={`mt-4 px-4 py-2 rounded-full ${lesson.status === "completed" ? "bg-green-700" : "bg-blue-700"
                }`}
            >
              {lesson.status === "completed" ? t('schedule.status.inProgress') : t('schedule.status.upcoming')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;
