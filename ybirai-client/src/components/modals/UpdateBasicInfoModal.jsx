import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { LoaderCircle, X } from 'lucide-react';
import * as Yup from 'yup';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card } from '../ui/card';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useCategories } from '../../hooks/useCategories';
import { useGetSchools } from '../../hooks/useGetSchools';
import { useAuth } from '../../contexts/AuthContext';
import { useCourseUpdate } from '../../hooks/useUpdateCourse';

const UpdateBasicInfoModal = ({ isOpen, onClose, courseData }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        data: categories,
        isLoading: isLoadingCategories,
        isError: isErrorCategories,
        error: categoriesError
    } = useCategories();

    const {
        data: schools,
        isLoading: isLoadingSchools,
        isError: isErrorSchools,
        error: schoolsError
    } = useGetSchools();

    const { updateCourseData, isLoading: isUpdating, error: updateError } = useCourseUpdate();

    console.log('UpdateBasicInfoModal - Hook state:', {
        isUpdating,
        updateError,
        courseData: courseData?.id
    });

    const validationSchema = Yup.object({
        title: Yup.string().required(t('courseForm.basicInfo.validation.titleRequired')),
        description: Yup.string().required(t('courseForm.basicInfo.validation.descriptionRequired')),
        longDescription: Yup.string().required(t('courseForm.basicInfo.validation.longDescriptionRequired')),
        schoolId: Yup.string().required(t('courseForm.basicInfo.validation.schoolRequired')),
        categoryId: Yup.string().required(t('courseForm.basicInfo.validation.categoryRequired')),
        language: Yup.string().required(t('courseForm.basicInfo.validation.languageRequired'))
    });

    const formik = useFormik({
        initialValues: {
            title: courseData?.title || '',
            description: courseData?.description || '',
            longDescription: courseData?.longDescription || '',
            schoolId: courseData?.schoolId || '',
            categoryId: courseData?.categoryId || '',
            language: courseData?.language || ''
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (!courseData?.id) {
                toast.error('Course ID not found');
                return;
            }

            setIsSubmitting(true);
            console.log('Submitting basic info update:', {
                courseId: courseData.id,
                values
            });

            try {
                const updateData = {
                    title: values.title.trim(),
                    description: values.description.trim(),
                    longDescription: values.longDescription.trim(),
                    schoolId: values.schoolId,
                    categoryId: values.categoryId,
                    language: values.language
                };

                console.log('Calling updateCourseData with:', updateData);

                await updateCourseData(courseData.id, updateData);

                console.log('Basic info update successful');
                toast.success('Basic information updated successfully');
                onClose();
            } catch (error) {
                console.error('Error updating basic info:', error);
                toast.error('Failed to update basic information');
            } finally {
                setIsSubmitting(false);
            }
        }
    });

    useEffect(() => {
        if (isOpen && courseData) {
            console.log('Resetting form with course data:', courseData);
            formik.resetForm({
                values: {
                    title: courseData.title || '',
                    description: courseData.description || '',
                    longDescription: courseData.longDescription || '',
                    schoolId: courseData.schoolId || '',
                    categoryId: courseData.categoryId || '',
                    language: courseData.language || ''
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

    if (isLoadingCategories || isLoadingSchools) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-center items-center h-96">
                        <LoaderCircle className="animate-spin w-12 h-12" />
                        <p className="ml-3">
                            Loading {isLoadingCategories ? 'categories' : ''}
                            {isLoadingCategories && isLoadingSchools ? ' and ' : ''}
                            {isLoadingSchools ? 'schools' : ''}...
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (isErrorCategories || isErrorSchools) {
        console.error('Categories Error:', categoriesError);
        console.error('Schools Error:', schoolsError);
        toast.error(`Error loading data: ${categoriesError?.message || schoolsError?.message || 'Unknown error'}`);
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-center items-center h-96">
                        <div className="text-center">
                            <p className="text-red-500 mb-4">Failed to load form data</p>
                            <Button onClick={onClose}>Close</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const filteredSchools = schools?.filter(school => school.email === user.email) || [];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto text-dark dark:text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        {t('courseForm.steps.basicInfo')} - Update
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    <Card className="p-6 border-none shadow-none">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">{t('courseForm.basicInfo.title')}</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder={t('courseForm.basicInfo.titlePlaceholder')}
                                    value={formik.values.title}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.title && formik.errors.title}
                                />
                                {formik.touched.title && formik.errors.title && (
                                    <p className="text-sm text-red-500">{formik.errors.title}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">{t('courseForm.basicInfo.shortDescription')}</Label>
                                <Input
                                    id="description"
                                    name="description"
                                    placeholder={t('courseForm.basicInfo.descriptionPlaceholder')}
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.description && formik.errors.description}
                                />
                                {formik.touched.description && formik.errors.description && (
                                    <p className="text-sm text-red-500">{formik.errors.description}</p>
                                )}
                            </div>

                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="longDescription">{t('courseForm.basicInfo.detailedDescription')}</Label>
                                <ReactQuill
                                    id="longDescription"
                                    theme="snow"
                                    value={formik.values.longDescription}
                                    onChange={(value) => formik.setFieldValue('longDescription', value)}
                                    className="h-[200px] mb-12"
                                    modules={{
                                        toolbar: [
                                            [{ header: [1, 2, 3, 4, 5, 6, false] }],
                                            ["bold", "italic", "underline", "strike"],
                                            [{ list: "ordered" }, { list: "bullet" }],
                                            [{ color: [] }, { background: [] }],
                                            ["link"],
                                            ["clean"],
                                        ],
                                    }}
                                    placeholder={t('courseForm.basicInfo.longDescriptionPlaceholder')}
                                />
                                {formik.touched.longDescription && formik.errors.longDescription && (
                                    <p className="text-sm text-red-500">{formik.errors.longDescription}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="schoolId">{t('courseForm.basicInfo.school')}</Label>
                                <Select
                                    name="schoolId"
                                    value={formik.values.schoolId}
                                    onValueChange={(value) => formik.setFieldValue('schoolId', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('courseForm.basicInfo.selectSchool')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredSchools.map((school) => (
                                            <SelectItem key={school.id} value={school.id}>
                                                {school.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formik.touched.schoolId && formik.errors.schoolId && (
                                    <p className="text-sm text-red-500">{formik.errors.schoolId}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="categoryId">{t('courseForm.basicInfo.category')}</Label>
                                <Select
                                    name="categoryId"
                                    value={formik.values.categoryId}
                                    onValueChange={(value) => formik.setFieldValue('categoryId', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('courseForm.basicInfo.selectCategory')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories?.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formik.touched.categoryId && formik.errors.categoryId && (
                                    <p className="text-sm text-red-500">{formik.errors.categoryId}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="language">{t('courseForm.basicInfo.language')}</Label>
                                <Select
                                    name="language"
                                    value={formik.values.language}
                                    onValueChange={(value) => formik.setFieldValue('language', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('courseForm.basicInfo.selectLanguage')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ENGLISH">English</SelectItem>
                                        <SelectItem value="RUSSIAN">Russian</SelectItem>
                                        <SelectItem value="KAZAKH">Kazakh</SelectItem>
                                    </SelectContent>
                                </Select>
                                {formik.touched.language && formik.errors.language && (
                                    <p className="text-sm text-red-500">{formik.errors.language}</p>
                                )}
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
                                'Update Basic Info'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateBasicInfoModal;
