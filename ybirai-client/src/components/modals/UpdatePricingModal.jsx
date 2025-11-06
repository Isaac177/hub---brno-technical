import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { LoaderCircle, DollarSign, Plus, Tag, X } from 'lucide-react';
import * as Yup from 'yup';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { useCourseUpdate } from '../../hooks/useUpdateCourse';

const AVAILABLE_SUBTITLES = [
    { value: 'ENGLISH', label: 'English' },
    { value: 'RUSSIAN', label: 'Russian' },
    { value: 'KAZAKH', label: 'Kazakh' },
];

const UpdatePricingModal = ({ isOpen, onClose, courseData }) => {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newTag, setNewTag] = useState('');

    const { updateCourseData, isLoading: isUpdating, error: updateError } = useCourseUpdate();

    const validationSchema = Yup.object({
        price: Yup.number()
            .required(t('courseForm.pricing.validation.priceRequired'))
            .min(0, t('courseForm.pricing.validation.priceMin')),
        tags: Yup.array().of(Yup.string()),
        subtitles: Yup.array().of(Yup.string())
    });

    const formik = useFormik({
        initialValues: {
            price: courseData?.price || '',
            tags: courseData?.tags || [],
            subtitles: courseData?.subtitles || []
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (!courseData?.id) {
                toast.error('Course ID not found');
                return;
            }

            setIsSubmitting(true);
            console.log('Submitting pricing update:', {
                courseId: courseData.id,
                values
            });

            try {
                const updateData = {
                    price: Number(values.price),
                    tags: values.tags.filter(Boolean),
                    subtitles: values.subtitles.filter(Boolean)
                };

                await updateCourseData(courseData.id, updateData);

                toast.success('Pricing information updated successfully');
                onClose();
            } catch (error) {
                console.error('Error updating pricing:', error);
                toast.error('Failed to update pricing information');
            } finally {
                setIsSubmitting(false);
            }
        }
    });

    useEffect(() => {
        if (isOpen && courseData) {
            formik.resetForm({
                values: {
                    price: courseData.price || '',
                    tags: courseData.tags || [],
                    subtitles: courseData.subtitles || []
                }
            });
        }
    }, [isOpen, courseData]);

    useEffect(() => {
        if (updateError) {
            console.error('Update hook error:', updateError);
            toast.error(`Update failed: ${updateError.message}`);
        }
    }, [updateError]);

    const handleAddSubtitle = (selectedValue) => {
        if (selectedValue && !formik.values.subtitles.includes(selectedValue)) {
            const currentSubtitles = Array.isArray(formik.values.subtitles) ? formik.values.subtitles : [];
            const newSubtitles = [...currentSubtitles.filter(s => s), selectedValue];
            formik.setFieldValue('subtitles', newSubtitles);
            formik.setFieldTouched('subtitles', true, false);
        }
    };

    const handleRemoveSubtitle = (subtitleToRemove) => {
        const newSubtitles = formik.values.subtitles.filter(
            subtitle => subtitle && subtitle !== subtitleToRemove
        );
        formik.setFieldValue('subtitles', newSubtitles);
        formik.setFieldTouched('subtitles', true, false);
    };

    const handleAddTag = (e) => {
        e.preventDefault();
        const tagValue = newTag.trim().toLowerCase();

        const currentTags = formik.values.tags || [];

        if (tagValue && !currentTags.includes(tagValue)) {
            const newTags = [...currentTags, tagValue];
            formik.setFieldValue('tags', newTags);
            formik.setFieldTouched('tags', true, false);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        const newTags = formik.values.tags.filter(tag => tag !== tagToRemove);
        formik.setFieldValue('tags', newTags);
        formik.setFieldTouched('tags', true, false);
    };

    const handleTagKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag(e);
        }
    };

    const availableSubtitles = AVAILABLE_SUBTITLES.filter(
        subtitle => !formik.values.subtitles.includes(subtitle.value)
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto text-dark dark:text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        {t('courseForm.steps.pricing')} - Update
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    <Card className="p-6 border-none shadow-none">
                        <div className="space-y-6">
                            {/* Price Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">{t('courseForm.pricing.title')}</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="price">{t('courseForm.pricing.price.label')}</Label>
                                    <div className="relative">
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            placeholder={t('courseForm.pricing.price.placeholder')}
                                            value={formik.values.price}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className="pl-8"
                                        />
                                        <DollarSign className="absolute left-2 top-2.5 h-5 w-5 text-gray-500" />
                                    </div>
                                    {formik.touched.price && formik.errors.price && (
                                        <p className="text-sm text-red-500">{formik.errors.price}</p>
                                    )}
                                    <p className="text-sm text-gray-500">
                                        {t('courseForm.pricing.price.hint')}
                                    </p>
                                </div>
                            </div>

                            {/* Tags Section */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">{t('courseForm.pricing.tags.title')}</h3>
                                    {formik.touched.tags && formik.errors.tags && (
                                        <span className="text-sm text-red-500">{formik.errors.tags}</span>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label>{t('courseForm.pricing.tags.label')}</Label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Input
                                                    type="text"
                                                    value={newTag}
                                                    onChange={(e) => setNewTag(e.target.value)}
                                                    onKeyPress={handleTagKeyPress}
                                                    placeholder={t('courseForm.pricing.tags.placeholder')}
                                                    className="pl-8"
                                                />
                                                <Tag className="absolute left-2 top-2.5 h-5 w-5 text-gray-500" />
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={handleAddTag}
                                                size="icon"
                                                variant="outline"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {(formik.values.tags || []).length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {formik.values.tags.map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="secondary"
                                                    className="py-1 pr-1 flex items-center gap-1"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="hover:bg-gray-200 rounded-full p-0.5"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Subtitles Section */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">{t('courseForm.pricing.subtitles.title')}</h3>
                                    {formik.touched.subtitles && formik.errors.subtitles && (
                                        <span className="text-sm text-red-500">{formik.errors.subtitles}</span>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label>{t('courseForm.pricing.subtitles.label')}</Label>
                                        <Select onValueChange={handleAddSubtitle}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('courseForm.pricing.subtitles.placeholder')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableSubtitles.map((subtitle) => (
                                                    <SelectItem
                                                        key={subtitle.value}
                                                        value={subtitle.value}
                                                    >
                                                        {subtitle.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {formik.values.subtitles.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {formik.values.subtitles.map((subtitle) => (
                                                <Badge
                                                    key={subtitle}
                                                    variant="default"
                                                    className="py-1 pr-1 flex items-center gap-1"
                                                >
                                                    {subtitle}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveSubtitle(subtitle)}
                                                        className="hover:bg-gray-200 rounded-full p-0.5"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
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
                                'Update Pricing'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UpdatePricingModal;
