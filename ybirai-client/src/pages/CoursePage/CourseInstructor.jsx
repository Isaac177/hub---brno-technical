import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Chip } from "@nextui-org/react";
import { Star, Users, BookOpen } from 'lucide-react';

const CourseInstructor = ({ instructor = {} }) => {
    const { t } = useTranslation();

    if (!instructor) {
        return null;
    }

    const {
        avatarUrl = '',
        name = 'Instructor Name',
        title = '',
        bio = '',
        rating = 0,
        studentCount = 0,
        courseCount = 0,
        reviewCount = 0
    } = instructor;

    return (
        <Card className="border shadow-none text-primary-900">
            <CardBody>
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-full md:w-1/3">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={name}
                                className="size-full object-cover rounded-lg"
                                style={{ aspectRatio: '1 / 1' }}
                            />
                        ) : (
                            <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400 text-4xl">{name.charAt(0)}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col flex-grow">
                        <h2 className="text-2xl font-bold">{name}</h2>
                        {title && <p className="text-lg text-gray-500 mb-2">{title}</p>}
                        <div className="flex flex-wrap flex-col gap-2 mb-3">
                            <Chip
                                startContent={<Star className="w-4 h-4" />}
                                variant="flat"
                                color="warning"
                            >
                                {rating} {t('course.instructor.rating')}
                            </Chip>
                            <Chip
                                startContent={<Users className="w-4 h-4" />}
                                variant="flat"
                                color="secondary"
                            >
                                {studentCount.toLocaleString()} {t('course.instructor.students')}
                            </Chip>
                            <Chip
                                startContent={<BookOpen className="w-4 h-4" />}
                                variant="flat"
                                color="secondary"
                            >
                                {courseCount} {t('course.instructor.courses')}
                            </Chip>
                        </div>
                        <p className="text-sm mb-3">
                            {reviewCount.toLocaleString()} {t('course.instructor.reviews')}
                        </p>
                    </div>
                </div>
                {bio && <p className="text-sm">{bio}</p>}
            </CardBody>
        </Card>
    );
};

export default CourseInstructor;
