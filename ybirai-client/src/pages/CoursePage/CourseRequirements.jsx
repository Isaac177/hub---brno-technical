import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';

const CourseRequirements = ({ requirements = [] }) => {
    const { t } = useTranslation();

    if (!requirements || requirements.length === 0) {
        return null;
    }

    return (
        <div className="p-6 text-primary-900">
            <h2 className="text-2xl font-bold mb-4">{t('course.requirements.title')}</h2>
            <ul className="space-y-3">
                {requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 mr-2 mt-1 flex-shrink-0" />
                        <span className="">{requirement}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CourseRequirements;
