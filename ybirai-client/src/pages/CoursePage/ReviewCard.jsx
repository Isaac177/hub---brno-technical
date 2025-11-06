import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, CardHeader, Avatar, Button } from "@nextui-org/react";
import { Star } from 'lucide-react';

const ReviewCard = ({ review = {} }) => {
    const { t } = useTranslation();
    const {
        avatarUrl = '',
        name = '',
        coursesCount = 0,
        reviewsCount = 0,
        rating = 0,
        content = '',
        date = ''
    } = review;

    return (
        <Card className="border shadow-none">
            <CardHeader className="justify-between">
                <div className="flex gap-5">
                    <Avatar isBordered radius="full" size="md" src={avatarUrl} />
                    <div className="flex flex-col gap-1 items-start justify-center">
                        <h4 className="text-small font-semibold leading-none">{name}</h4>
                        <h5 className="text-small tracking-tight text-gray-500">
                            {coursesCount > 0 && `${coursesCount} ${t('course.reviews.courses')} • `}
                            {reviewsCount > 0 && `${reviewsCount} ${t('course.reviews.reviews')}`}
                        </h5>
                    </div>
                </div>
                <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                    ))}
                </div>
            </CardHeader>
            <CardBody>
                <p className="text-small">{content}</p>
                {date && (
                    <p className="text-tiny text-gray-500 mt-2">{date}</p>
                )}
            </CardBody>
        </Card>
    );
};

const CourseReviews = ({ reviews = [] }) => {
    const { t } = useTranslation();

    if (!reviews || reviews.length === 0) {
        return (
            <div className="p-6 text-primary-900">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{t('course.reviews.title')}</h2>
                </div>
                <p className="text-gray-500">{t('course.reviews.noReviews')}</p>
            </div>
        );
    }

    return (
        <div className="p-6 text-primary-900">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{t('course.reviews.title')}</h2>
            </div>
            <div className="space-y-4">
                {reviews.map((review, index) => (
                    <ReviewCard key={index} review={review} />
                ))}
            </div>
        </div>
    );
};

export default CourseReviews;
