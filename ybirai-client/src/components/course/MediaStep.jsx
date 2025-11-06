import React from 'react';
import { Card } from '@nextui-org/react';
import { UploadCloud, Image, AlertCircle, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

const MediaStep = ({ formik }) => {
  const { t } = useTranslation();

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

    // Create URL for preview
    const previewUrl = URL.createObjectURL(file);

    // Clean up old preview URL if it exists
    if (formik.values[`${field}Preview`]) {
      URL.revokeObjectURL(formik.values[`${field}Preview`]);
    }

    formik.setFieldValue(field, file);
    formik.setFieldValue(`${field}Preview`, previewUrl);
    formik.setFieldError(field, undefined);
  };

  const handleRemoveImage = (field) => {
    if (formik.values[`${field}Preview`]) {
      URL.revokeObjectURL(formik.values[`${field}Preview`]);
    }
    formik.setFieldValue(field, null);
    formik.setFieldValue(`${field}Preview`, null);
  };

  // Clean up preview URLs when component unmounts
  React.useEffect(() => {
    return () => {
      ['featuredImageUrl', 'thumbnailUrl'].forEach(field => {
        if (formik.values[`${field}Preview`]) {
          URL.revokeObjectURL(formik.values[`${field}Preview`]);
        }
      });
    };
  }, []);

  const renderDropZone = (field, titleKey, descriptionKey) => {
    const hasError = formik.touched[field] && formik.errors[field];
    const value = formik.values[field];
    const preview = typeof value === 'string' ? value : formik.values[`${field}Preview`];
    const isExistingImage = typeof value === 'string';

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{t(titleKey)}</label>
        <Card
          className={`border-2 border-dashed ${hasError ? 'border-danger' : 'border-gray-300'
            } hover:border-primary cursor-pointer relative overflow-hidden`}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={handleDrop(field)}
          isPressable
          onClick={() => !preview && document.getElementById(field).click()}
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
                className="w-full h-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(field);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 space-y-2">
              <div className="p-3 bg-primary/10 rounded-full">
                <UploadCloud className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">{t(descriptionKey)}</p>
                <p className="text-xs text-gray-500">{t('courseForm.media.upload.description')}</p>
              </div>
            </div>
          )}
        </Card>
        {hasError && (
          <div className="flex items-center space-x-1 text-danger text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{formik.errors[field]}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderDropZone(
        'featuredImageUrl',
        'courseForm.media.featuredImage.title',
        'courseForm.media.featuredImage.description'
      )}

      {renderDropZone(
        'thumbnailUrl',
        'courseForm.media.thumbnail.title',
        'courseForm.media.thumbnail.description'
      )}

      <div className="bg-default-100 p-4 rounded-lg">
        <div className="flex gap-3">
          <Image className="text-primary" size={24} />
          <div>
            <h4 className="text-sm font-medium">{t('courseForm.media.requirements.title')}</h4>
            <ul className="text-sm text-gray-600 list-disc list-inside mt-2">
              <li>{t('courseForm.media.requirements.featuredSize')}</li>
              <li>{t('courseForm.media.requirements.thumbnailSize')}</li>
              <li>{t('courseForm.media.requirements.maxSize')}</li>
              <li>{t('courseForm.media.requirements.formats')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaStep;
