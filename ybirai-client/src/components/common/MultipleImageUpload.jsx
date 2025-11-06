import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {LucideImage, X} from 'lucide-react';
import { Button } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { useTranslation } from 'react-i18next';

function MultipleImageUpload({ images, onChange }) {
  const { t } = useTranslation();

  const onDrop = useCallback((acceptedFiles) => {
    const newImages = acceptedFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      alt: file.name
    }));

    onChange([...images, ...newImages]);
  }, [images, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: true
  });

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    URL.revokeObjectURL(images[index].url);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        <LucideImage className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? t('imageUpload.multiple.dropHere')
            : t('imageUpload.multiple.dragOrClick')}
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
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
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
              <Input
                type="text"
                placeholder={t('imageUpload.multiple.altText')}
                className="mt-2"
                value={image.alt}
                onChange={(e) => {
                  const newImages = [...images];
                  newImages[index].alt = e.target.value;
                  onChange(newImages);
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
