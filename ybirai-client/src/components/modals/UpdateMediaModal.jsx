import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { LoaderCircle, UploadCloud, Image, AlertCircle, X } from 'lucide-react';
import * as Yup from 'yup';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { useCourseUpdate } from '../../hooks/useUpdateCourse';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

const UpdateMediaModal = ({ isOpen, onClose, courseData }) => {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { updateCourseData, isLoading: isUpdating, error: updateError } = useCourseUpdate();

    console.log('UpdateMediaModal - Hook state:', {
        isUpdating,
        updateError,
        courseData: courseData?.id
    });

    console.log('UpdateMediaModal - Course media data:', {
        featuredImageUrl: courseData?.featuredImageUrl,
        thumbnailUrl: courseData?.thumbnailUrl
    });

    const validateFile = (file) => {
        if (!file) return null;
        if (typeof file === 'string') return null; // Skip validation for existing URLs

        if (!ALLOWED_TYPES.includes(file.type)) {
            return t('courseForm.media.validation.invalidType');
        }

        if (file.size > MAX_FILE_SIZE) {
            return t('courseForm.media.validation.tooLarge');
        }

        return null;
    };

    const validationSchema = Yup.object({
        featuredImageUrl: Yup.mixed().test(
            'file-validation',
            'Invalid file',
            function (value) {
                const error = validateFile(value);
                return !error;
            }
        ),
        thumbnailUrl: Yup.mixed().test(
            'file-validation',
            'Invalid file',
            function (value) {
                const error = validateFile(value);
                return !error;
            }
        )
    });

    // Helper function to get the preview URL for display
    const getPreviewUrl = (value, existingUrl, isRemoved) => {
        if (isRemoved) {
            return null; // Don't show anything if explicitly removed
        }
        if (value instanceof File) {
            // For new file uploads, create object URL
            return URL.createObjectURL(value);
        } else if (existingUrl && typeof existingUrl === 'string') {
            // For existing URLs from the server
            return existingUrl;
        }
        return null;
    };

    const formik = useFormik({
        initialValues: {
            featuredImageUrl: null, // Will store File object for new uploads
            thumbnailUrl: null, // Will store File object for new uploads
            featuredImageRemoved: false, // Track if existing image was removed
            thumbnailRemoved: false, // Track if existing image was removed
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (!courseData?.id) {
                toast.error('Course ID not found');
                return;
            }

            setIsSubmitting(true);
            console.log('Submitting media update:', {
                courseId: courseData.id,
                values
            });

            try {
                const updateData = {};

                // Add files to update data if they are File objects (new uploads)
                if (values.featuredImageUrl instanceof File) {
                    updateData.featuredImageUrl = values.featuredImageUrl;
                }

                if (values.thumbnailUrl instanceof File) {
                    updateData.thumbnailUrl = values.thumbnailUrl;
                }

                // Only proceed if there are files to update
                if (Object.keys(updateData).length === 0) {
                    toast.info('No media changes to update');
                    onClose();
                    return;
                }

                console.log('Calling updateCourseData with:', updateData);

                await updateCourseData(courseData.id, updateData);

                console.log('Media update successful');
                toast.success('Course media updated successfully');
                onClose();
            } catch (error) {
                console.error('Error updating media:', error);
                toast.error('Failed to update course media');
            } finally {
                setIsSubmitting(false);
            }
        }
    });

    const handleDrop = (field) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            const error = validateFile(file);

            if (error) {
                formik.setFieldError(field, error);
                formik.setFieldTouched(field, true, false);
                return;
            }

            handleFileChange(field)(file);
        }
    };

    const handleFileChange = (field) => (file) => {
        if (!file) return;

        const error = validateFile(file);
        if (error) {
            formik.setFieldError(field, error);
            formik.setFieldTouched(field, true, false);
            return;
        }

        // Clean up old preview URL if it exists
        const currentValue = formik.values[field];
        if (currentValue instanceof File) {
            const objectUrl = URL.createObjectURL(currentValue);
            URL.revokeObjectURL(objectUrl);
        }

        // Set the new file and mark as not removed
        formik.setFieldValue(field, file);
        formik.setFieldValue(`${field.replace('Url', '')}Removed`, false);
        formik.setFieldError(field, undefined);
    };

    const handleRemoveImage = (field) => {
        // Clean up object URL if it exists
        const currentValue = formik.values[field];
        if (currentValue instanceof File) {
            const objectUrl = URL.createObjectURL(currentValue);
            URL.revokeObjectURL(objectUrl);
        }

        // Set file to null and mark as removed
        formik.setFieldValue(field, null);
        formik.setFieldValue(`${field.replace('Url', '')}Removed`, true);
    };

    const handleClickToUpload = (field) => {
        // Only trigger file input if there's no preview or user explicitly wants to change
        const fileInput = document.getElementById(field);
        if (fileInput) {
            fileInput.click();
        }
    };

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen && courseData) {
            console.log('Resetting form with course data:', courseData);
            formik.resetForm({
                values: {
                    featuredImageUrl: null, // Reset to null, we'll show existing images via courseData
                    thumbnailUrl: null, // Reset to null, we'll show existing images via courseData
                    featuredImageRemoved: false,
                    thumbnailRemoved: false,
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

    // Clean up preview URLs when component unmounts
    useEffect(() => {
        return () => {
            ['featuredImageUrl', 'thumbnailUrl'].forEach(field => {
                const value = formik.values[field];
                if (value instanceof File) {
                    const objectUrl = URL.createObjectURL(value);
                    URL.revokeObjectURL(objectUrl);
                }
            });
        };
    }, []);

    const renderDropZone = (field, titleKey, descriptionKey, existingUrl) => {
        const hasError = formik.touched[field] && formik.errors[field];
        const value = formik.values[field];
        const isRemoved = formik.values[`${field.replace('Url', '')}Removed`];
        const preview = getPreviewUrl(value, existingUrl, isRemoved);
        const hasNewUpload = value instanceof File;
        const hasExistingImage = existingUrl && !hasNewUpload && !isRemoved;

        return (
            <div className="space-y-2">
                <Label className="text-sm font-medium">{t(titleKey)}</Label>
                <Card
                    className={`border-2 border-dashed ${hasError ? 'border-red-500' : 'border-gray-300'
                        } hover:border-primary cursor-pointer relative overflow-hidden transition-colors`}
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onDrop={handleDrop(field)}
                    onClick={() => handleClickToUpload(field)}
                >
                    <input
                        id={field}
                        type="file"
                        className="hidden"
                        accept={ALLOWED_TYPES.join(',')}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                handleFileChange(field)(file);
                            }
                        }}
                    />

                    {preview ? (
                        <div className="relative w-full h-48">
                            <img
                                src={preview}
                                alt={t(titleKey)}
                                className="w-full h-full object-cover rounded"
                            />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 rounded-full h-8 w-8"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveImage(field);
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                                {hasNewUpload ? 'New upload' : 'Current image'}
                            </div>
                            {hasNewUpload && (
                                <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs">
                                    Ready to upload
                                </div>
                            )}
                            {hasExistingImage && !hasNewUpload && (
                                <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                                    Click to replace
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 space-y-2 h-48">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <UploadCloud className="w-6 h-6 text-primary" />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-sm font-medium">{t(descriptionKey)}</p>
                                <p className="text-xs text-gray-500">{t('courseForm.media.upload.description')}</p>
                                {isRemoved && (
                                    <p className="text-xs text-orange-500">Image removed - click to add new</p>
                                )}
                            </div>
                        </div>
                    )}
                </Card>
                {hasError && (
                    <div className="flex items-center space-x-1 text-red-500 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{formik.errors[field]}</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto text-dark dark:text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        {t('courseForm.steps.media')} - Update
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    <Card className="p-6 border-none shadow-none">
                        <div className="space-y-8">
                            {renderDropZone(
                                'featuredImageUrl',
                                'courseForm.media.featuredImage.title',
                                'courseForm.media.featuredImage.description',
                                courseData?.featuredImageUrl
                            )}

                            {renderDropZone(
                                'thumbnailUrl',
                                'courseForm.media.thumbnail.title',
                                'courseForm.media.thumbnail.description',
                                courseData?.thumbnailUrl
                            )}

                            <div className="bg-muted p-4 rounded-lg">
                                <div className="flex gap-3">
                                    <Image className="text-primary" size={24} />
                                    <div>
                                        <h4 className="text-sm font-medium">{t('courseForm.media.requirements.title')}</h4>
                                        <ul className="text-sm text-muted-foreground list-disc list-inside mt-2">
                                            <li>{t('courseForm.media.requirements.featuredSize')}</li>
                                            <li>{t('courseForm.media.requirements.thumbnailSize')}</li>
                                            <li>{t('courseForm.media.requirements.maxSize')}</li>
                                            <li>{t('courseForm.media.requirements.formats')}</li>
                                        </ul>
                                    </div>
                                </div>
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
                                'Update Media'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateMediaModal;
