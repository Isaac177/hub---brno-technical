// components/VideoUploadButton.jsx
import { useState, useRef, useCallback } from 'react';
import { Upload, FileVideo, AlertCircle, CheckCircle, Video, Maximize2 } from 'lucide-react';
import { Button } from "../ui/button.jsx";
import { VideoUploadDrawer } from "./VideoUploadDrawer.jsx";
import { Badge } from "../ui/badge.jsx";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export const VideoUploadButton = ({
  onFileSelect,
  isUploading,
  hasVideo,
  className
}) => {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const inputRef = useRef(null);

  const validateFile = useCallback((file) => {
    if (!file) {
      toast.error(t('courseForm.content.upload.noFile'));
      return false;
    }

    if (!file.type.startsWith('video/')) {
      toast.error(t('courseForm.content.upload.invalidFile'));
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(t('media.upload.maxSizeExceeded', { size: '500MB' }));
      return false;
    }

    return true;
  }, [t]);

  const handleFileSelection = useCallback(async (file) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  }, [onFileSelect, validateFile]);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  }, [handleFileSelection]);

  const handleClick = useCallback(() => {
    if (!isUploading) {
      inputRef.current?.click();
    }
  }, [isUploading]);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  }, [handleFileSelection]);

  const handleOpenDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  return (
    <div 
      className={`relative ${className}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="video/*"
        className="hidden"
      />
      
      <Button
        type="button"
        variant={hasVideo ? "secondary" : "outline"}
        className={`w-full h-24 flex flex-col items-center justify-center gap-2 ${
          dragActive ? 'border-primary' : ''
        }`}
        onClick={handleClick}
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <Upload className="h-6 w-6 animate-bounce" />
            <span>{t('courseForm.content.upload.uploading')}</span>
          </>
        ) : hasVideo ? (
          <>
            <FileVideo className="h-6 w-6" />
            <span>{t('courseForm.content.upload.videoUploaded')}</span>
            <Badge variant="secondary">{t('media.upload.replaceImage')}</Badge>
          </>
        ) : (
          <>
            <Video className="h-6 w-6" />
            <span>{t('courseForm.content.syllabus.uploadVideo')}</span>
            <span className="text-xs text-gray-500">{t('media.upload.dragOrClick')}</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default VideoUploadButton;
