import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, BookOpen, Image, FileText, DollarSign, LoaderCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useGetCourse } from '../../hooks/useGetCourse';
import { useLanguage } from '../../contexts/LanguageContext';
import UpdateBasicInfoModal from '../modals/UpdateBasicInfoModal';
import UpdateMediaModal from '../modals/UpdateMediaModal';
import UpdateContentModal from '../modals/UpdateContentModal';
import UpdatePricingModal from '../modals/UpdatePricingModal';
import { toast } from 'sonner';

const CourseUpdateOverview = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { courseId } = useParams();
    const { displayLanguage } = useLanguage();

    const [isBasicInfoModalOpen, setIsBasicInfoModalOpen] = useState(false);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [isContentModalOpen, setIsContentModalOpen] = useState(false);
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

    const {
        data: courseData,
        isLoading: isLoadingCourse,
        isError: isErrorCourse,
        error: courseError
    } = useGetCourse(courseId, displayLanguage);

    if (isLoadingCourse) {
        return (
            <div className="container mx-auto py-6 max-w-4xl">
                <Card className="p-6">
                    <div className="flex justify-center items-center h-96">
                        <LoaderCircle className="animate-spin w-12 h-12" />
                        <span className="ml-3 text-lg">Loading course data...</span>
                    </div>
                </Card>
            </div>
        );
    }

    if (isErrorCourse) {
        console.error('Error loading course:', courseError);
        toast.error('Failed to load course data');
        return (
            <div className="container mx-auto py-6 max-w-4xl">
                <Card className="p-6">
                    <div className="text-center">
                        <p className="text-red-500 mb-4">Failed to load course data</p>
                        <Button onClick={() => navigate(-1)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    if (!courseData) {
        return (
            <div className="container mx-auto py-6 max-w-4xl">
                <Card className="p-6">
                    <div className="text-center">
                        <p className="text-muted-foreground mb-4">Course not found</p>
                        <Button onClick={() => navigate(-1)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const updateSteps = [
        {
            id: 'basic-info',
            title: t('courseForm.steps.basicInfo'),
            description: 'Update course title, description, language, and category',
            icon: BookOpen,
            color: 'text-blue-600 bg-blue-100',
            action: () => setIsBasicInfoModalOpen(true)
        },
        {
            id: 'media',
            title: t('courseForm.steps.media'),
            description: 'Update featured image, thumbnail, and course media',
            icon: Image,
            color: 'text-green-600 bg-green-100',
            action: () => setIsMediaModalOpen(true)
        },
        {
            id: 'content',
            title: t('courseForm.steps.content'),
            description: 'Update syllabus, learning objectives, and requirements',
            icon: FileText,
            color: 'text-purple-600 bg-purple-100',
            action: () => setIsContentModalOpen(true)
        },
        {
            id: 'pricing',
            title: t('courseForm.steps.pricing'),
            description: 'Update course pricing, tags, and subtitles',
            icon: DollarSign,
            color: 'text-orange-600 bg-orange-100',
            action: () => setIsPricingModalOpen(true)
        }
    ];

    const handleStepClick = (step) => {
        if (step.action) {
            step.action();
        }
    };

    return (
        <>
            <div className="container mx-auto py-6 max-w-4xl">
                <div className="mb-6">
                    <Button
                        variant="outline"
                        onClick={() => navigate(-1)}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <h1 className="text-3xl font-bold mb-2">Update Course</h1>
                    <p className="text-muted-foreground">
                        Choose which part of "{courseData.title}" you want to update
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {updateSteps.map((step) => {
                        const IconComponent = step.icon;
                        return (
                            <Card
                                key={step.id}
                                className="hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => handleStepClick(step)}
                            >
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-lg ${step.color} flex items-center justify-center mb-3`}>
                                        <IconComponent className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-xl">{step.title}</CardTitle>
                                    <CardDescription className="text-base">
                                        {step.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button className="w-full">
                                        Update {step.title}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            <UpdateBasicInfoModal
                isOpen={isBasicInfoModalOpen}
                onClose={() => setIsBasicInfoModalOpen(false)}
                courseData={courseData}
            />

            <UpdateMediaModal
                isOpen={isMediaModalOpen}
                onClose={() => setIsMediaModalOpen(false)}
                courseData={courseData}
            />

            <UpdateContentModal
                isOpen={isContentModalOpen}
                onClose={() => setIsContentModalOpen(false)}
                courseData={courseData}
            />

            <UpdatePricingModal
                isOpen={isPricingModalOpen}
                onClose={() => setIsPricingModalOpen(false)}
                courseData={courseData}
            />
        </>
    );
};

export default CourseUpdateOverview;
