import React, { useCallback } from 'react';
import { Drawer } from 'vaul';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

export const VideoUploadDrawer = ({
  isOpen,
  onOpenChange,
  onUploadComplete
}) => {
  const { t } = useTranslation();

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      onUploadComplete(acceptedFiles[0]);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    maxFiles: 1
  });

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[10px] mt-24 fixed bottom-0 right-0 w-[400px] h-[85vh]">
          <div className="p-4 flex-1 overflow-auto">
            <div className="mx-auto w-full max-w-md">
              <Drawer.Title className="font-medium mb-4">
                {t('courseForm.content.upload.title')}
              </Drawer.Title>
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>{t('courseForm.content.upload.dropHere')}</p>
                ) : (
                  <div>
                    <p>{t('courseForm.content.upload.dragAndDrop')}</p>
                    <p className="text-sm text-gray-500 mt-2">{t('courseForm.content.upload.supportedFormats')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
