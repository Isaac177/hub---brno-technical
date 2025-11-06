import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image as LucideImage, X } from 'lucide-react';
import { Button } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { useTranslation } from 'react-i18next';

export function SingleImageUpload({ image, onChange }) {
  const { t } = useTranslation();
  
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (image?.url) {
        URL.revokeObjectURL(image.url);
      }

      onChange({
        file,
        url: URL.createObjectURL(file),
        alt: file.name
      });
    }
  }, [image, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: false
  });

  const removeImage = () => {
    if (image?.url) {
      URL.revokeObjectURL(image.url);
    }
    onChange(null);
  };

  return (
    <div className="space-y-4">
      {!image ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}
        >
          <input {...getInputProps()} />
          <LucideImage className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive
              ? t('imageUpload.single.dropHere')
              : t('imageUpload.single.dragOrClick')}
          </p>
        </div>
      ) : (
        <div className="relative group">
          <img
            src={image.url}
            alt={image.alt}
            className="w-full h-40 object-cover rounded-lg"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 hidden group-hover:flex"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
          <Input
            type="text"
            placeholder={t('imageUpload.single.altText')}
            className="mt-2"
            value={image.alt}
            onChange={(e) => {
              onChange({ ...image, alt: e.target.value });
            }}
          />
        </div>
      )}
    </div>
  );
}
