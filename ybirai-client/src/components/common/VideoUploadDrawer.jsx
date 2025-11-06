import React from 'react';
import { AlertCircle, RefreshCcw, X, CheckCircle2, Trash2 } from 'lucide-react';
import { Progress } from "../ui/progress.jsx";
import { ScrollArea } from "../ui/scroll-area.jsx";
import { Button } from "../ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../ui/sheet";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

export const VideoUploadDrawer = ({
  isOpen,
  onClose,
  uploads = new Map(),
  errors = new Map(),
  onRetry,
  onRemove,
  onClearAll,
  syllabus = [],
}) => {
  const { t } = useTranslation();
  // Group uploads by status
  const groupedUploads = React.useMemo(() => {
    const groups = {
      uploading: [],
      completed: [],
      error: []
    };
    
    Array.from(uploads.entries()).forEach(([key, upload]) => {
      if (errors.has(key)) {
        groups.error.push({ ...upload, key });
      } else if (upload.status === 'completed') {
        groups.completed.push({ ...upload, key });
      } else if (upload.status === 'uploading') {
        groups.uploading.push({ ...upload, key });
      }
    });
    
    return groups;
  }, [uploads, errors]);

  const getTopicName = (sectionIndex, topicIndex) => {
    try {
      return syllabus[sectionIndex]?.topics[topicIndex]?.title || t('courseForm.content.syllabus.unknownTopic');
    } catch (e) {
      return t('courseForm.content.syllabus.unknownTopic');
    }
  };

  const renderUploadCard = (upload, error, key) => {
    if (!upload) return null;
    
    const topicName = upload.topicTitle || getTopicName(upload.sectionIndex, upload.topicIndex);
    
    return (
      <Card key={key || upload.id} className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span className="font-semibold">{topicName}</span>
            {upload.progress > 0 && upload.status === 'uploading' && (
              <span className="text-sm text-blue-600 font-medium">{upload.progress}%</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="space-y-2">
              <div className="flex items-center text-destructive">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  {error.message || (typeof error === 'string' ? error : t('courseForm.content.upload.error'))}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    onRetry(key);
                    toast.info(t('courseForm.content.upload.retrying', { topic: topicName }));
                  }}
                  disabled={upload.status === 'uploading'}
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  {t('courseForm.messages.retry')}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    onRemove(key);
                    toast.info(t('courseForm.content.upload.removed', { topic: topicName }));
                  }}
                  disabled={upload.status === 'uploading'}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('blogManagement.comments.actions.delete')}
                </Button>
              </div>
            </div>
          ) : upload.status === 'uploading' ? (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                {upload.fileName || upload.file?.name}
              </div>
              <Progress 
                value={upload.progress} 
                className="w-full"
                indicatorClassName="bg-blue-500"
              />
            </div>
          ) : upload.status === 'completed' ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center text-green-600">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                <span className="text-sm">{t('courseForm.content.upload.success')}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onRemove(key);
                  if (uploads.size === 1) {
                    onClose();
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  };

  // Only show drawer if there are any uploads or errors
  if (!isOpen || (uploads.size === 0 && errors.size === 0)) {
    return null;
  }

  const hasActiveUploads = groupedUploads.uploading.length > 0;
  const hasCompletedUploads = groupedUploads.completed.length > 0;
  const hasErrors = groupedUploads.error.length > 0;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
        <SheetHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>{t('courseForm.content.upload.videoUploads')}</SheetTitle>
              <SheetDescription>
                {hasActiveUploads
                  ? t('courseForm.content.upload.uploadingVideos', { count: groupedUploads.uploading.length })
                  : hasErrors
                  ? t('courseForm.content.upload.uploadsFailed', { count: groupedUploads.error.length })
                  : hasCompletedUploads
                  ? t('courseForm.content.upload.uploadsCompleted', { count: groupedUploads.completed.length })
                  : t('courseForm.content.upload.noActiveUploads')}
              </SheetDescription>
            </div>
            {(hasCompletedUploads || hasErrors) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClearAll();
                  onClose();
                  toast.success(t('courseForm.content.upload.listCleared'));
                }}
              >
                {t('filter.resetFilters')}
              </Button>
            )}
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] px-6">
          <div className="space-y-4 py-4">
            {/* Active Uploads */}
            {groupedUploads.uploading.map((upload) => 
              renderUploadCard(upload, null, upload.key)
            )}
            
            {/* Failed Uploads */}
            {groupedUploads.error.map((upload) => 
              renderUploadCard(upload, errors.get(upload.key), upload.key)
            )}
            
            {/* Completed Uploads */}
            {hasCompletedUploads && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-4">
                  {t('courseForm.content.upload.completedUploads', { count: groupedUploads.completed.length })}
                </h3>
                {groupedUploads.completed.map((upload) => 
                  renderUploadCard(upload, null, upload.key)
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};