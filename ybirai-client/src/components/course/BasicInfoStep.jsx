import React from 'react';
import { Book, Globe } from 'lucide-react';
import { useTranslation } from "react-i18next";
import { useGetCategories } from "../../hooks/useGetCategories.js";
import { useGetSchools } from "../../hooks/useGetSchools.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useCategories } from '../../hooks/useCategories.js';

const BasicInfoStep = ({ formik }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isErrorCategories
  } = useCategories();

  const {
    data: schools,
    isLoading: isLoadingSchools,
    isError: isErrorSchools
  } = useGetSchools();

  if (isLoadingCategories || isLoadingSchools) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoaderCircle className='animate-spin w-12 h-12' />
      </div>
    );
  }

  if (isErrorCategories || isErrorSchools) {
    toast.error(t('courseForm.messages.error'));
    return null;
  }

  const filteredSchools = schools?.filter(school => school.email === user.email) || [];

  return (
    <div className="space-y-6">
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
              <p className="text-sm text-red-500">{t('courseForm.basicInfo.validation.titleRequired')}</p>
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
              <p className="text-sm text-red-500">{t('courseForm.basicInfo.validation.descriptionRequired')}</p>
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
              <p className="text-sm text-red-500">{t('courseForm.basicInfo.validation.longDescriptionRequired')}</p>
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
              <p className="text-sm text-red-500">{t('courseForm.basicInfo.validation.schoolRequired')}</p>
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
              <p className="text-sm text-red-500">{t('courseForm.basicInfo.validation.categoryRequired')}</p>
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
              <p className="text-sm text-red-500">{t('courseForm.basicInfo.validation.languageRequired')}</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BasicInfoStep;
