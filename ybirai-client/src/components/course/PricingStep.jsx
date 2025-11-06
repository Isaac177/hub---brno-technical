import React, { useState } from 'react';
import { DollarSign, Plus, Languages, Tag, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Label } from "../../components/ui/label";

const AVAILABLE_SUBTITLES = [
  { value: 'ENGLISH', label: 'English' },
  { value: 'RUSSIAN', label: 'Russian' },
  { value: 'KAZAKH', label: 'Kazakh' },
];

const PricingStep = ({ formik }) => {
  const { t } = useTranslation();
  const [newTag, setNewTag] = useState('');

  console.log('[PricingStep] Component rendered with formik values:', {
    price: formik.values.price,
    tags: formik.values.tags,
    subtitles: formik.values.subtitles,
    errors: formik.errors,
    touched: formik.touched
  });

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
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('courseForm.pricing.title')}</h3>
        <div className="flex flex-col gap-2">
          <div>
            <Label>{t('courseForm.pricing.price.label')}</Label>
            <div className="relative">
              <Input
                type="number"
                name="price"
                value={formik.values.price}
                onChange={(e) => {
                  console.log('[PricingStep] Price changed to:', e.target.value);
                  formik.handleChange(e);
                }}
                onBlur={(e) => {
                  console.log('[PricingStep] Price blur event');
                  formik.handleBlur(e);
                }}
                className="pl-8"
                placeholder={t('courseForm.pricing.price.placeholder')}
              />
              <DollarSign className="absolute left-2 top-2.5 h-5 w-5 text-gray-500" />
            </div>
            {formik.touched.price && formik.errors.price && (
              <p className="text-sm text-red-500">{formik.errors.price}</p>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {t('courseForm.pricing.price.hint')}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{t('courseForm.pricing.tags.title')}</h3>
          {formik.touched.tags && formik.errors.tags && (
            <span className="text-sm text-danger">{formik.errors.tags}</span>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <Label>{t('courseForm.pricing.tags.label')}</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder={t('courseForm.pricing.tags.placeholder')}
                  className="pl-8"
                />
                <Tag className="absolute left-2 top-2.5 h-5 w-5 text-gray-500" />
              </div>
              <Button
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
                  variant="flat"
                  color="secondary"
                  className="py-1 pr-1 flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <div className="bg-default-100 p-4 rounded-lg">
            <div className="flex gap-3">
              <Tag className="text-secondary" size={24} />
              <div>
                <h4 className="text-sm font-medium">{t('courseForm.pricing.tags.guidelines.title')}</h4>
                <ul className="text-sm text-gray-600 list-disc list-inside mt-2">
                  {t('courseForm.pricing.tags.guidelines.items', { returnObjects: true }).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{t('courseForm.pricing.subtitles.title')}</h3>
          {formik.touched.subtitles && formik.errors.subtitles && (
            <span className="text-sm text-danger">{formik.errors.subtitles}</span>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <Label>{t('courseForm.pricing.subtitles.label')}</Label>
            <div className="flex gap-2">
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
          </div>

          {formik.values.subtitles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formik.values.subtitles.map((subtitle) => (
                <Badge
                  key={subtitle}
                  variant="flat"
                  color="primary"
                  className="py-1"
                >
                  {subtitle}
                  <button
                    onClick={() => handleRemoveSubtitle(subtitle)}
                    className="hover:bg-gray-200 rounded-full p-0.5 ml-1"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <div className="bg-default-100 p-4 rounded-lg">
            <div className="flex gap-3">
              <Languages className="text-primary" size={24} />
              <div>
                <h4 className="text-sm font-medium">{t('courseForm.pricing.subtitles.guidelines.title')}</h4>
                <ul className="text-sm text-gray-600 list-disc list-inside mt-2">
                  {t('courseForm.pricing.subtitles.guidelines.items', { returnObjects: true }).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-default-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">{t('courseForm.pricing.features.title')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formik.values.courseIncludes && formik.values.courseIncludes.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <img
                src={feature.icon}
                alt={feature.type}
                className="w-8 h-8 object-contain"
              />
              <div>
                <p className="text-sm font-medium">
                  {feature.amount ? `${feature.amount} ${feature.type}` : feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingStep;
