import React from 'react'
import { useTranslation } from 'react-i18next'
import DOMPurify from 'dompurify'

const CourseLongDescription = ({ description = '' }) => {
    const { t } = useTranslation();

    if (!description) {
        return null;
    }

    const sanitizedHtml = DOMPurify.sanitize(description)

    return (
        <div className="p-6 text-primary-900">
            <h2 className="text-2xl font-bold mb-4">{t('course.description.title')}</h2>
            <div
                className="course-description"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
        </div>
    )
}

export default CourseLongDescription
