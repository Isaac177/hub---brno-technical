import React from "react";
import { CheckCircle, Circle } from "lucide-react";
import { useTranslation } from "react-i18next";

const LearningPath = () => {
  const { t } = useTranslation();

  const roadmap = [
    {
      id: 1,
      title: t('learningPath.steps.basics.title'),
      description: t('learningPath.steps.basics.description'),
      status: "current",
      progress: 75
    },
    {
      id: 2,
      title: t('learningPath.steps.oop.title'),
      description: t('learningPath.steps.oop.description'),
      status: "next"
    },
    {
      id: 3,
      title: t('learningPath.steps.spring.title'),
      description: t('learningPath.steps.spring.description'),
      status: "next"
    },
    {
      id: 4,
      title: t('learningPath.steps.microservices.title'),
      description: t('learningPath.steps.microservices.description'),
      status: "next"
    },
    {
      id: 5,
      title: t('learningPath.steps.finalProject.title'),
      description: t('learningPath.steps.finalProject.description'),
      status: "next"
    },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">{t('learningPath.title')}</h1>
        <p className="text-lg text-gray-500 mt-2">{t('learningPath.subtitle')}</p>
      </div>

      <div className="relative flex flex-wrap items-center justify-center gap-8">
        {roadmap.map((step, index) => (
          <div key={step.id} className="relative flex flex-col items-center text-center">
            <div
              className={`relative w-56 min-h-[260px] p-6 rounded-xl shadow-lg flex flex-col justify-center items-center gap-y-2 ${step.status === "completed"
                ? "bg-gradient-to-r from-green-400 to-green-500 text-white"
                : step.status === "current"
                  ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white animate-pulse"
                  : "bg-gray-100 border border-gray-300 text-gray-800"
                }`}
            >
              <div className="flex items-center justify-center">
                {step.status === "completed" && <CheckCircle className="h-8 w-8 text-white" />}
                {step.status === "current" && <Circle className="h-8 w-8 text-white" />}
                {step.status === "next" && <Circle className="h-8 w-8 text-gray-400" />}
              </div>
              <h3 className="text-lg font-bold">{step.title}</h3>
              <p className="text-sm">{step.description}</p>
              {step.status === "current" && (
                <div className="mt-4 w-full">
                  <div className="w-full bg-gray-200 h-2 rounded-full">
                    <div
                      className="bg-white h-2 rounded-full"
                      style={{ width: `${step.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm mt-2">{t('learningPath.progress', { progress: step.progress })}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="relative flex flex-col items-center text-center">
          <div
            className="w-56 min-h-[260px] p-6 rounded-xl shadow-lg bg-gradient-to-r from-yellow-400 to-yellow-500 text-white flex flex-col justify-center items-center gap-y-2"
          >
            <div className="flex items-center justify-center">
              <Circle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-bold">{t('learningPath.finalStep.title')}</h3>
            <p className="text-sm">{t('learningPath.finalStep.description')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPath;
