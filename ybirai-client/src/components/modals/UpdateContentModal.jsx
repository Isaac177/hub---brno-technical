import React, { useState, useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { LoaderCircle, Plus, Minus, GripVertical } from 'lucide-react';
import * as Yup from 'yup';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { VideoUploadButton } from '../common/VideoUploadButton';
import { VideoUploadDrawerUpdate } from '../common/VideoUploadDrawerUpdate';
import { useCourseUpdate } from '../../hooks/useUpdateCourse';
import { useVideoUploadUpdate } from '../../hooks/useVideoUploadUpdate';

const formatDuration = (timeString) => {
    if (!timeString) return '00:00:00';
    const parts = timeString.split(':');
    if (parts.length === 3) return timeString;
    const [hours = '00', minutes = '00'] = parts;
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
};

const calculateTotalDuration = (topics) => {
    return topics.reduce((total, topic) => {
        if (!topic.duration) return total;
        const [hours, minutes] = topic.duration.split(':').map(Number);
        return total + hours * 60 + minutes;
    }, 0);
};

const formatTotalDuration = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
};

const UpdateContentModal = ({ isOpen, onClose, courseData }) => {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const { updateCourseData, isLoading: isUpdating, error: updateError } = useCourseUpdate();

    const {
        uploads,
        uploadErrors,
        uploadVideo,
        retryUpload,
        removeUpload,
        clearAll
    } = useVideoUploadUpdate({
        courseId: courseData?.id,
        onUploadComplete: ({ sectionIndex, topicIndex, finalLocation }) => {
            try {
                const newSyllabus = [...(formik.values.syllabus || [])];
                if (!newSyllabus[sectionIndex]?.topics?.[topicIndex]) {
                    throw new Error('Invalid section or topic index');
                }

                newSyllabus[sectionIndex].topics[topicIndex].videoUrl = finalLocation;
                formik.setFieldValue('syllabus', newSyllabus);
                toast.success(t('courseForm.content.upload.updateSuccess'));
            } catch (error) {
                console.error('Error handling upload complete:', error);
                toast.error(t('courseForm.content.upload.error'));
            }
        }
    });

    console.log('UpdateContentModal - Hook state:', {
        isUpdating,
        updateError,
        courseData: courseData?.id
    });

    const validationSchema = Yup.object({
        requirements: Yup.array().of(
            Yup.string().min(10, 'Requirement must be at least 10 characters')
        ).min(1, 'At least one requirement is needed'),
        learningObjectives: Yup.array().of(
            Yup.string().min(10, 'Learning objective must be at least 10 characters')
        ).min(1, 'At least one learning objective is needed'),
        syllabus: Yup.array().of(
            Yup.object({
                title: Yup.string().required('Section title is required'),
                topics: Yup.array().of(
                    Yup.object({
                        title: Yup.string().required('Topic title is required'),
                        duration: Yup.string().required('Duration is required'),
                        videoUrl: Yup.string().required('Video is required')
                    })
                ).min(1, 'At least one topic is required')
            })
        ).min(1, 'At least one section is required')
    });

    const formik = useFormik({
        initialValues: {
            requirements: courseData?.requirements || [''],
            learningObjectives: courseData?.learningObjectives || [''],
            syllabus: courseData?.syllabus || []
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (!courseData?.id) {
                toast.error('Course ID not found');
                return;
            }

            // Check for active uploads
            const hasActiveUploads = Array.from(uploads.values()).some(
                upload => upload.status === 'uploading'
            );

            if (hasActiveUploads) {
                toast.error('Please wait for all video uploads to complete');
                return;
            }

            setIsSubmitting(true);
            console.log('Submitting content update:', {
                courseId: courseData.id,
                values
            });

            try {
                const updateData = {
                    requirements: values.requirements.filter(req => req?.trim()),
                    learningObjectives: values.learningObjectives.filter(obj => obj?.trim()),
                    syllabus: values.syllabus.map(section => ({
                        ...section,
                        duration: formatTotalDuration(calculateTotalDuration(section.topics)),
                        lectures: section.topics.length,
                        topics: section.topics.map(topic => ({
                            ...topic,
                            duration: formatDuration(topic.duration)
                        }))
                    }))
                };

                console.log('Calling updateCourseData with:', updateData);

                await updateCourseData(courseData.id, updateData);

                console.log('Content update successful');
                toast.success('Course content updated successfully');
                onClose();
            } catch (error) {
                console.error('Error updating content:', error);
                toast.error('Failed to update course content');
            } finally {
                setIsSubmitting(false);
            }
        }
    });

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen && courseData) {
            console.log('Resetting form with course data:', courseData);
            formik.resetForm({
                values: {
                    requirements: courseData.requirements?.length ? courseData.requirements : [''],
                    learningObjectives: courseData.learningObjectives?.length ? courseData.learningObjectives : [''],
                    syllabus: courseData.syllabus || []
                }
            });
        }
    }, [isOpen, courseData]);

    // Show error if update hook has an error
    useEffect(() => {
        if (updateError) {
            console.error('Update hook error:', updateError);
            toast.error(`Update failed: ${updateError.message}`);
        }
    }, [updateError]);

    // Auto-open drawer when uploads start
    useEffect(() => {
        const hasUploading = Array.from(uploads.values()).some(
            upload => upload.status === 'uploading'
        );
        if (hasUploading || uploadErrors.size > 0) {
            setIsDrawerOpen(true);
        }
    }, [uploads, uploadErrors]);

    const handleFileSelect = async (file, sectionIndex, topicIndex) => {
        try {
            if (!file) {
                throw new Error(t('courseForm.content.upload.noFile'));
            }

            if (!file.type.startsWith('video/')) {
                throw new Error(t('courseForm.content.upload.invalidFile'));
            }

            const topicTitle = formik.values.syllabus[sectionIndex].topics[topicIndex].title ||
                `Topic ${topicIndex + 1} in Section ${sectionIndex + 1}`;

            setIsDrawerOpen(true);

            await uploadVideo(file, sectionIndex, topicIndex, topicTitle);

        } catch (error) {
            toast.error(error.message || t('courseForm.content.upload.error'));
        }
    };

    const updateTopicDuration = (sectionIndex, topicIndex, duration) => {
        const newSyllabus = [...formik.values.syllabus];
        const formattedDuration = formatDuration(duration);
        newSyllabus[sectionIndex].topics[topicIndex].duration = formattedDuration;

        const sectionDuration = calculateTotalDuration(newSyllabus[sectionIndex].topics);
        newSyllabus[sectionIndex].duration = formatTotalDuration(sectionDuration);
        newSyllabus[sectionIndex].lectures = newSyllabus[sectionIndex].topics.length;
        formik.setFieldValue('syllabus', newSyllabus);
    };

    const handleAddRequirement = () => {
        const newRequirements = [...formik.values.requirements, ''];
        formik.setFieldValue('requirements', newRequirements);
    };

    const handleRemoveRequirement = (index) => {
        const newRequirements = formik.values.requirements.filter((_, i) => i !== index);
        formik.setFieldValue('requirements', newRequirements);
    };

    const addObjective = () => {
        formik.setFieldValue('learningObjectives', [
            ...formik.values.learningObjectives,
            ''
        ]);
    };

    const removeObjective = (index) => {
        const newObjectives = formik.values.learningObjectives.filter((_, i) => i !== index);
        formik.setFieldValue('learningObjectives', newObjectives);
    };

    const addSection = () => {
        formik.setFieldValue('syllabus', [
            ...formik.values.syllabus,
            {
                title: '',
                lectures: 0,
                duration: '00:00:00',
                topics: [{ title: '', duration: '00:00:00', videoUrl: '' }]
            }
        ]);
    };

    const removeSection = (index) => {
        const newSyllabus = formik.values.syllabus.filter((_, i) => i !== index);
        formik.setFieldValue('syllabus', newSyllabus);
    };

    const addTopic = (sectionIndex) => {
        const newSyllabus = [...formik.values.syllabus];
        const newTopic = {
            title: '',
            duration: '00:00:00',
            videoUrl: ''
        };
        newSyllabus[sectionIndex].topics.push(newTopic);
        formik.setFieldValue('syllabus', newSyllabus);
    };

    const removeTopic = (sectionIndex, topicIndex) => {
        const newSyllabus = [...formik.values.syllabus];
        newSyllabus[sectionIndex].topics.splice(topicIndex, 1);
        const totalMinutes = calculateTotalDuration(newSyllabus[sectionIndex].topics);
        newSyllabus[sectionIndex].duration = formatTotalDuration(totalMinutes);
        newSyllabus[sectionIndex].lectures = newSyllabus[sectionIndex].topics.length;
        formik.setFieldValue('syllabus', newSyllabus);
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(formik.values.syllabus);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        formik.setFieldValue('syllabus', items);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto text-dark dark:text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            {t('courseForm.steps.content')} - Update
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        <Card className="p-6 border-none shadow-none">
                            <div className="space-y-8">
                                {/* Learning Objectives */}
                                <div>
                                    <Label className="text-lg font-semibold">{t('courseForm.content.learningObjectives.title')}</Label>
                                    <div className="text-sm text-gray-500 mb-4">
                                        {t('courseForm.content.learningObjectives.description')}
                                    </div>
                                    <div className="space-y-2">
                                        {formik.values.learningObjectives.map((objective, index) => (
                                            <div key={index} className="flex gap-2">
                                                <div className="flex-1">
                                                    <Input
                                                        value={objective}
                                                        onChange={(e) => {
                                                            const newObjectives = [...formik.values.learningObjectives];
                                                            newObjectives[index] = e.target.value;
                                                            formik.setFieldValue('learningObjectives', newObjectives);
                                                        }}
                                                        placeholder={t('courseForm.content.learningObjectives.placeholder')}
                                                        className={objective.length > 0 && objective.length < 10 ? 'border-red-500' : ''}
                                                    />
                                                    {objective.length > 0 && objective.length < 10 && (
                                                        <p className="text-red-500 text-sm mt-1">
                                                            Each learning objective must be at least 10 characters
                                                        </p>
                                                    )}
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => removeObjective(index)}
                                                    disabled={formik.values.learningObjectives.length <= 1}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addObjective}
                                            className="w-full"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            {t('courseForm.content.learningObjectives.addButton')}
                                        </Button>
                                    </div>
                                </div>

                                {/* Requirements */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold">{t('courseForm.content.requirements.title')}</h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddRequirement}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            {t('courseForm.content.requirements.addButton')}
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {formik.values.requirements.map((requirement, index) => (
                                            <div key={index} className="flex gap-2">
                                                <div className="flex-1">
                                                    <Input
                                                        value={requirement}
                                                        onChange={(e) => {
                                                            const newRequirements = [...formik.values.requirements];
                                                            newRequirements[index] = e.target.value;
                                                            formik.setFieldValue('requirements', newRequirements);
                                                        }}
                                                        placeholder={t('courseForm.content.requirements.placeholder')}
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleRemoveRequirement(index)}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Syllabus */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">{t('courseForm.content.syllabus.title')}</h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addSection}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            {t('courseForm.content.syllabus.addSection')}
                                        </Button>
                                    </div>

                                    <DragDropContext onDragEnd={handleDragEnd}>
                                        <Droppable droppableId="syllabus">
                                            {(provided) => (
                                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                                    {formik.values.syllabus.map((section, sectionIndex) => (
                                                        <Draggable
                                                            key={`section-${sectionIndex}`}
                                                            draggableId={`section-${sectionIndex}`}
                                                            index={sectionIndex}
                                                        >
                                                            {(provided) => (
                                                                <Card
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    className="p-4"
                                                                >
                                                                    <div className="space-y-4">
                                                                        <div className="flex items-start gap-2">
                                                                            <div {...provided.dragHandleProps}>
                                                                                <GripVertical className="h-5 w-5 text-gray-500" />
                                                                            </div>
                                                                            <div className="flex-1 space-y-4">
                                                                                <div>
                                                                                    <Input
                                                                                        value={section.title}
                                                                                        onChange={(e) => {
                                                                                            const newSyllabus = [...formik.values.syllabus];
                                                                                            newSyllabus[sectionIndex].title = e.target.value;
                                                                                            formik.setFieldValue('syllabus', newSyllabus);
                                                                                        }}
                                                                                        placeholder={t('courseForm.content.syllabus.sectionTitle')}
                                                                                    />
                                                                                </div>

                                                                                {/* Topics */}
                                                                                <div className="space-y-2">
                                                                                    {section.topics.map((topic, topicIndex) => (
                                                                                        <div key={topicIndex} className="flex gap-2">
                                                                                            <div className="flex-1 space-y-2">
                                                                                                <Input
                                                                                                    value={topic.title}
                                                                                                    onChange={(e) => {
                                                                                                        const newSyllabus = [...formik.values.syllabus];
                                                                                                        newSyllabus[sectionIndex].topics[topicIndex].title = e.target.value;
                                                                                                        formik.setFieldValue('syllabus', newSyllabus);
                                                                                                    }}
                                                                                                    placeholder={t('courseForm.content.syllabus.topicTitle')}
                                                                                                />

                                                                                                <div className="flex gap-2">
                                                                                                    <VideoUploadButton
                                                                                                        onFileSelect={(file) => handleFileSelect(file, sectionIndex, topicIndex)}
                                                                                                        hasVideo={!!topic.videoUrl}
                                                                                                        className="flex-1"
                                                                                                    />
                                                                                                    <Input
                                                                                                        type="time"
                                                                                                        step="1"
                                                                                                        value={topic.duration}
                                                                                                        onChange={(e) => updateTopicDuration(sectionIndex, topicIndex, e.target.value)}
                                                                                                        className="w-32"
                                                                                                    />
                                                                                                </div>
                                                                                            </div>
                                                                                            <Button
                                                                                                type="button"
                                                                                                variant="outline"
                                                                                                size="icon"
                                                                                                onClick={() => removeTopic(sectionIndex, topicIndex)}
                                                                                            >
                                                                                                <Minus className="h-4 w-4" />
                                                                                            </Button>
                                                                                        </div>
                                                                                    ))}
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="outline"
                                                                                        size="sm"
                                                                                        onClick={() => addTopic(sectionIndex)}
                                                                                        className="w-full"
                                                                                    >
                                                                                        <Plus className="h-4 w-4 mr-2" />
                                                                                        {t('courseForm.content.syllabus.addTopic')}
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                size="icon"
                                                                                onClick={() => removeSection(sectionIndex)}
                                                                            >
                                                                                <Minus className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </Card>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                </div>
                            </div>
                        </Card>

                        <div className="flex justify-end gap-4 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSubmitting || isUpdating}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || isUpdating}
                            >
                                {(isSubmitting || isUpdating) ? (
                                    <>
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Content'
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <VideoUploadDrawerUpdate
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                uploads={uploads}
                errors={uploadErrors}
                onRetry={retryUpload}
                onRemove={removeUpload}
                onClearAll={clearAll}
                syllabus={formik.values.syllabus || []}
                courseTitle={courseData?.title}
            />
        </>
    );
};

export default UpdateContentModal;
