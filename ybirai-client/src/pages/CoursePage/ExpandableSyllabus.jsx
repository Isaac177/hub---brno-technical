import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Play, Lock } from 'lucide-react';

const SyllabusSection = ({ section = {} }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { t } = useTranslation();
    const {
        thumbnailUrl = '',
        title = '',
        lectures = 0,
        duration = '0:00',
        topics = [] // Default to empty array if null
    } = section;

    return (
        <div className="bg-primary-100 rounded-lg overflow-hidden mb-4 text-primary-900">
            <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center space-x-4">
                    {thumbnailUrl && (
                        <img
                            src={thumbnailUrl}
                            alt={title}
                            className="w-12 h-12 rounded object-cover"
                        />
                    )}
                    <div>
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <p className="text-sm text-gray-500">{lectures} {t('course.syllabus.lectures')} • {duration}</p>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-6 h-6" />
                ) : (
                    <ChevronDown className="w-6 h-6" />
                )}
            </div>
            {topics && topics.length > 0 && (
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                >
                    <ul className="p-4 space-y-2">
                        {topics.map((topic, index) => (
                            <li key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    {topic.preview ? (
                                        <Play className="w-4 h-4" />
                                    ) : (
                                        <Lock className="w-4 h-4" />
                                    )}
                                    <span>{topic.title}</span>
                                </div>
                                <span className="text-sm text-gray-500">{topic.duration}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const ExpandableSyllabus = ({ syllabus = [] }) => {
    const { t } = useTranslation();

    if (!syllabus || syllabus.length === 0) {
        return null;
    }

    return (
        <div className="p-6 text-primary-900">
            <h2 className="text-2xl font-bold mb-4">{t('course.syllabus.title')}</h2>
            {syllabus.map((section, index) => (
                <SyllabusSection key={index} section={section} />
            ))}
        </div>
    );
};

export default ExpandableSyllabus;
