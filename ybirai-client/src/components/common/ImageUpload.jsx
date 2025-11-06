import { useDropzone } from 'react-dropzone';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const ImageUpload = ({ value, onChange }) => {
    const { t } = useTranslation();
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png']
        },
        maxSize: 5242880,
        onDrop: (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    onChange(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        }
    });

    const handleRemoveImage = (e) => {
        e.stopPropagation();
        onChange('');
    };

    if (value) {
        return (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <img
                    src={value}
                    alt={t('media.upload.preview')}
                    className="w-full h-full object-cover"
                />
                <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                    <X className="w-4 h-4" />
                </button>
                <div
                    {...getRootProps()}
                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                >
                    <input {...getInputProps()} />
                    <p className="text-white text-center">
                        {t('media.upload.replaceImage')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
            }`}
        >
            <input {...getInputProps()} />
            <p className="text-sm text-gray-600">
                {isDragActive ? (
                    t('media.upload.dropHere')
                ) : (
                    t('media.upload.dragOrClick')
                )}
            </p>
            <p className="text-xs text-gray-500 mt-2">
                {t('media.upload.supportedFormats')}
            </p>
        </div>
    );
};
