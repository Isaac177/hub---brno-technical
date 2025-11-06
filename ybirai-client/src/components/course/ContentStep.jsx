import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, GripVertical, Clock } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { Card } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Label } from "../ui/label.jsx";
import { toast } from "sonner";
import { useVideoUpload } from "../../hooks/useVideoUpload.jsx";
import { VideoUploadDrawer } from "../common/VideoUploadDrawer";
import { VideoUploadButton } from "../common/VideoUploadButton";

const formatDuration = (timeString) => {
  if (!timeString) return '00:00:00';
  const parts = timeString.split(':');
  if (parts.length === 3) return timeString;
  const [hours = '00', minutes = '00'] = parts;
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
};

const calculateTotalDuration = (topics) => {
  return topics.reduce((total, topic) => {
    if (!topic.duration) return total;
    const [hours, minutes] = topic.duration.split(':').map(Number);
    return total + hours * 60 + minutes;
  }, 0);
};

const formatTotalDuration = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
};

const ContentStep = ({ formik }) => {
  const { t } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const {
    uploads,
    uploadErrors,
    uploadVideo,
    retryUpload,
    removeUpload,
    clearUploadErrors,
    clearAll
  } = useVideoUpload({
    courseId: formik.values.id,
    onUploadComplete: ({ sectionIndex, topicIndex, finalLocation }) => {
      try {
        const newSyllabus = [...(formik.values.syllabus || [])];
        if (!newSyllabus[sectionIndex]?.topics?.[topicIndex]) {
          throw new Error('Invalid section or topic index');
        }

        newSyllabus[sectionIndex].topics[topicIndex].videoUrl = finalLocation;
        formik.setFieldValue('syllabus', newSyllabus);
        formik.validateField(`syllabus[${sectionIndex}].topics[${topicIndex}].videoUrl`);
        toast.success(t('courseForm.content.upload.success'));
      } catch (error) {
        console.error('Error handling upload complete:', error);
        toast.error(t('courseForm.content.upload.error'));
      }
    },
    formik
  });

  const validateFormRef = useRef(async () => {
    console.log('[ContentStep] Starting validation...');
    let isValid = true;
    let errors = [];

    // Log current form values
    console.log('[ContentStep] Current form values:', {
      requirements: formik.values.requirements,
      learningObjectives: formik.values.learningObjectives,
      syllabus: formik.values.syllabus,
      uploadsCount: Object.keys(uploads).length
    });

    if (Object.keys(uploads).length > 0) {
      console.log('[ContentStep] Validation failed: Uploads still in progress');
      toast.error(t('courseForm.content.syllabus.validation.waitUploads'));
      return false;
    }

    // Validate learning objectives
    if (!formik.values.learningObjectives?.length) {
      console.log('[ContentStep] Validation failed: No learning objectives');
      errors.push(t('courseForm.content.learningObjectives.validation.required'));
      isValid = false;
    } else if (formik.values.learningObjectives.some(obj => !obj?.trim())) {
      console.log('[ContentStep] Validation failed: Empty learning objective found');
      errors.push(t('courseForm.content.learningObjectives.validation.empty'));
      isValid = false;
    }

    // Validate requirements
    if (!formik.values.requirements?.length) {
      console.log('[ContentStep] Validation failed: No requirements');
      errors.push(t('courseForm.content.syllabus.validation.noRequirements'));
      isValid = false;
    } else if (formik.values.requirements.some(req => !req?.trim())) {
      console.log('[ContentStep] Validation failed: Empty requirement found');
      errors.push(t('courseForm.content.syllabus.validation.emptyRequirement'));
      isValid = false;
    }

    // Validate syllabus
    if (!formik.values.syllabus?.length) {
      console.log('[ContentStep] Validation failed: No syllabus sections');
      errors.push(t('courseForm.content.syllabus.validation.noSections'));
      isValid = false;
    } else {
      formik.values.syllabus.forEach((section, sIndex) => {
        console.log(`[ContentStep] Validating section ${sIndex + 1}:`, section);

        if (!section.title?.trim()) {
          console.log(`[ContentStep] Validation failed: Section ${sIndex + 1} has no title`);
          errors.push(t('courseForm.content.syllabus.validation.noTitle', { section: sIndex + 1 }));
          isValid = false;
        }

        if (!section.topics?.length) {
          console.log(`[ContentStep] Validation failed: Section ${sIndex + 1} has no topics`);
          errors.push(t('courseForm.content.syllabus.validation.noTopics', { section: sIndex + 1 }));
          isValid = false;
        } else {
          section.topics.forEach((topic, tIndex) => {
            console.log(`[ContentStep] Validating topic ${tIndex + 1} in section ${sIndex + 1}:`, topic);

            if (!topic.title?.trim()) {
              console.log(`[ContentStep] Validation failed: Topic ${tIndex + 1} in section ${sIndex + 1} has no title`);
              errors.push(t('courseForm.content.syllabus.validation.noTopicTitle', {
                section: sIndex + 1,
                topic: tIndex + 1
              }));
              isValid = false;
            }

            if (!topic.duration) {
              console.log(`[ContentStep] Validation failed: Topic ${tIndex + 1} in section ${sIndex + 1} has no duration`);
              errors.push(t('courseForm.content.syllabus.validation.noDuration', {
                section: sIndex + 1,
                topic: tIndex + 1
              }));
              isValid = false;
            }

            if (!topic.videoUrl) {
              console.log(`[ContentStep] Validation failed: Topic ${tIndex + 1} in section ${sIndex + 1} has no video`);
              errors.push(t('courseForm.content.syllabus.validation.noVideo', {
                section: sIndex + 1,
                topic: tIndex + 1
              }));
              isValid = false;
            }
          });
        }
      });
    }

    console.log('[ContentStep] Validation complete:', { isValid, errorsCount: errors.length, errors });

    if (!isValid) {
      console.log('[ContentStep] Showing first error:', errors[0]);
      toast.error(errors[0]);
    }

    return isValid;
  });

  useEffect(() => {
    const savedValue = formik.values.onStepSubmit;
    formik.setFieldValue('onStepSubmit', async () => validateFormRef.current());

    return () => {
      if (savedValue !== formik.values.onStepSubmit) {
        formik.setFieldValue('onStepSubmit', savedValue);
      }
    };
  }, []);

  const handleSubmitRef = useRef(null);

  const getFieldError = (fieldPath) => {
    return formik.touched[fieldPath] && formik.errors[fieldPath];
  };

  const handleFieldBlur = (fieldPath) => {
    formik.setFieldTouched(fieldPath, true);
    const error = getFieldError(fieldPath);
    if (error && showValidationErrors) {
      toast.error(`${fieldPath}: ${error}`);
    }
  };

  const updateTopicDuration = (sectionIndex, topicIndex, duration) => {
    const newSyllabus = [...formik.values.syllabus];
    const formattedDuration = formatDuration(duration);
    newSyllabus[sectionIndex].topics[topicIndex].duration = formattedDuration;

    const sectionDuration = calculateTotalDuration(newSyllabus[sectionIndex].topics);
    newSyllabus[sectionIndex].duration = formatTotalDuration(sectionDuration);
    newSyllabus[sectionIndex].lectures = newSyllabus[sectionIndex].topics.length;
    formik.setFieldValue('syllabus', newSyllabus);
  };

  const handleFileSelect = async (file, sectionIndex, topicIndex) => {
    try {
      if (!file) {
        throw new Error(t('courseForm.content.upload.noFile'));
      }

      if (!file.type.startsWith('video/')) {
        throw new Error(t('courseForm.content.upload.invalidFile'));
      }

      const topicTitle = formik.values.syllabus[sectionIndex].topics[topicIndex].title ||
        `Topic ${topicIndex + 1} in Section ${sectionIndex + 1}`;

      setIsDrawerOpen(true);

      const newSyllabus = [...formik.values.syllabus];
      newSyllabus[sectionIndex].topics[topicIndex].isEditing = true;
      formik.setFieldValue('syllabus', newSyllabus);

      await uploadVideo(file, sectionIndex, topicIndex, topicTitle);

      const updatedSyllabus = [...formik.values.syllabus];
      updatedSyllabus[sectionIndex].topics[topicIndex].isEditing = false;
      formik.setFieldValue('syllabus', updatedSyllabus);

    } catch (error) {
      const updatedSyllabus = [...formik.values.syllabus];
      updatedSyllabus[sectionIndex].topics[topicIndex].isEditing = false;
      formik.setFieldValue('syllabus', updatedSyllabus);

      toast.error(error.message || t('courseForm.content.upload.error'));
    }
  };

  const renderUploadStatus = () => {
    return (
      <VideoUploadDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        uploads={uploads}
        errors={uploadErrors}
        onRetry={retryUpload}
        onRemove={removeUpload}
        onClearAll={clearAll}
        syllabus={formik.values.syllabus || []}
      />
    );
  };

  const handleAddRequirement = () => {
    const newRequirements = [...formik.values.requirements, ''];
    formik.setFieldValue('requirements', newRequirements);
  };

  const handleRemoveRequirement = (index) => {
    const newRequirements = formik.values.requirements.filter((_, i) => i !== index);
    formik.setFieldValue('requirements', newRequirements);
  };

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...formik.values.requirements];
    newRequirements[index] = value;
    formik.setFieldValue('requirements', newRequirements);

    if (value.length < 10) {
      toast.error(`Requirement must be at least 10 characters long`);
    }
  };

  const addObjective = () => {
    formik.setFieldValue('learningObjectives', [
      ...formik.values.learningObjectives,
      ''
    ]);
  };

  const removeObjective = (index) => {
    const newObjectives = formik.values.learningObjectives.filter((_, i) => i !== index);
    formik.setFieldValue('learningObjectives', newObjectives);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(formik.values.syllabus);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    formik.setFieldValue('syllabus', items);
  };

  const addSection = () => {
    formik.setFieldValue('syllabus', [
      ...formik.values.syllabus,
      {
        title: '',
        lectures: 0,
        duration: '00:00:00',
        thumbnailUrl: '',
        topics: [{ title: '', duration: '00:00:00', isPreview: false, videoUrl: '' }]
      }
    ]);
  };

  const removeSection = (index) => {
    const newSyllabus = formik.values.syllabus.filter((_, i) => i !== index);
    formik.setFieldValue('syllabus', newSyllabus);
  };

  const addTopic = (sectionIndex) => {
    const newSyllabus = [...formik.values.syllabus];
    const newTopic = {
      title: '',
      duration: '00:00:00',
      videoUrl: '',
      isEditing: false,
      uploadProgress: 0,
      uploadError: null
    };
    newSyllabus[sectionIndex].topics.push(newTopic);
    formik.setFieldValue('syllabus', newSyllabus);
  };

  const removeTopic = (sectionIndex, topicIndex) => {
    const newSyllabus = [...formik.values.syllabus];
    newSyllabus[sectionIndex].topics.splice(topicIndex, 1);
    const totalMinutes = calculateTotalDuration(newSyllabus[sectionIndex].topics);
    newSyllabus[sectionIndex].duration = formatTotalDuration(totalMinutes);
    newSyllabus[sectionIndex].lectures = newSyllabus[sectionIndex].topics.length;
    formik.setFieldValue('syllabus', newSyllabus);
  };

  useEffect(() => {
    if (formik.submitCount > 0) {
      setShowValidationErrors(true);
    }
  }, [formik.submitCount]);

  useEffect(() => {
    const hasUploading = Array.from(uploads.values()).some(
      upload => upload.status === 'preparing' || upload.status === 'uploading'
    );
    if (hasUploading || uploadErrors.size > 0) {
      setIsDrawerOpen(true);
    }
  }, [uploads, uploadErrors]);

  return (
    <div className="space-y-8">
      <Card className="p-6 border-none shadow-none">
        <div className="space-y-6">
          <div>
            <Label className="text-lg font-semibold">{t('courseForm.content.learningObjectives.title')}</Label>
            <div className="text-sm text-gray-500 mb-4">
              {t('courseForm.content.learningObjectives.description')}
            </div>
            <div className="space-y-2">
              {formik.values.learningObjectives.map((objective, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={objective}
                      onChange={(e) => {
                        const newObjectives = [...formik.values.learningObjectives];
                        newObjectives[index] = e.target.value;
                        formik.setFieldValue('learningObjectives', newObjectives);
                      }}
                      onBlur={() => handleFieldBlur(`learningObjectives.${index}`)}
                      placeholder={t('courseForm.content.learningObjectives.placeholder')}
                      className={`${objective.length > 0 && objective.length < 10 ? 'border-red-500' : ''}`}
                    />
                    {objective.length > 0 && objective.length < 10 && (
                      <p className="text-red-500 text-sm mt-1">
                        Each learning objective must be at least 10 characters
                      </p>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeObjective(index)}
                    disabled={formik.values.learningObjectives.length <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addObjective}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('courseForm.content.learningObjectives.addButton')}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{t('courseForm.content.requirements.title')}</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRequirement}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('courseForm.content.requirements.addButton')}
              </Button>
            </div>

            <div className="space-y-4">
              {formik.values.requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={requirement}
                      onChange={(e) => handleRequirementChange(index, e.target.value)}
                      onBlur={() => handleFieldBlur(`requirements.${index}`)}
                      className={formik.errors.requirements?.[index] ? "border-red-500" : ""}
                      placeholder={t('courseForm.content.requirements.placeholder')}
                    />
                    {formik.errors.requirements?.[index] && (
                      <p className="text-red-500 text-sm mt-1">{formik.errors.requirements[index]}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveRequirement(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Syllabus Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{t('courseForm.content.syllabus.title')}</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSection}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('courseForm.content.syllabus.addSection')}
              </Button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="syllabus">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {formik.values.syllabus.map((section, sectionIndex) => (
                      <Draggable
                        key={`section-${sectionIndex}`}
                        draggableId={`section-${sectionIndex}`}
                        index={sectionIndex}
                      >
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`p-4 ${formik.errors.syllabus?.[sectionIndex] ? 'border-red-500' : ''}`}
                          >
                            <div className="space-y-4">
                              <div className="flex items-start gap-2">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-5 w-5 text-gray-500" />
                                </div>
                                <div className="flex-1 space-y-4">
                                  <div>
                                    <Input
                                      value={section.title}
                                      onChange={(e) => {
                                        const newSyllabus = [...formik.values.syllabus];
                                        newSyllabus[sectionIndex].title = e.target.value;
                                        formik.setFieldValue('syllabus', newSyllabus);
                                      }}
                                      onBlur={() => handleFieldBlur(`syllabus.${sectionIndex}.title`)}
                                      placeholder={t('courseForm.content.syllabus.sectionTitle')}
                                      className={formik.errors.syllabus?.[sectionIndex]?.title ? 'border-red-500' : ''}
                                    />
                                    {formik.errors.syllabus?.[sectionIndex]?.title && (
                                      <p className="text-red-500 text-sm mt-1">
                                        {formik.errors.syllabus[sectionIndex].title}
                                      </p>
                                    )}
                                  </div>

                                  {/* Topics */}
                                  <div className="space-y-2">
                                    {section.topics.map((topic, topicIndex) => (
                                      <div
                                        key={topicIndex}
                                        className={`flex gap-2 ${formik.errors.syllabus?.[sectionIndex]?.topics?.[topicIndex]
                                          ? 'border-red-500 border rounded-lg p-2'
                                          : ''
                                          }`}
                                      >
                                        <div className="flex-1 space-y-2">
                                          <Input
                                            value={topic.title}
                                            onChange={(e) => {
                                              const newSyllabus = [...formik.values.syllabus];
                                              newSyllabus[sectionIndex].topics[topicIndex].title = e.target.value;
                                              formik.setFieldValue('syllabus', newSyllabus);
                                            }}
                                            onBlur={() => handleFieldBlur(`syllabus.${sectionIndex}.topics.${topicIndex}.title`)}
                                            placeholder={t('courseForm.content.syllabus.topicTitle')}
                                            className={formik.errors.syllabus?.[sectionIndex]?.topics?.[topicIndex]?.title ? 'border-red-500' : ''}
                                          />
                                          {formik.errors.syllabus?.[sectionIndex]?.topics?.[topicIndex]?.title && (
                                            <p className="text-red-500 text-sm">
                                              {formik.errors.syllabus[sectionIndex].topics[topicIndex].title}
                                            </p>
                                          )}

                                          <div className="flex gap-2">
                                            <VideoUploadButton
                                              onFileSelect={(file) => handleFileSelect(file, sectionIndex, topicIndex)}
                                              isUploading={topic.isEditing}
                                              hasVideo={!!topic.videoUrl}
                                              className={`flex-1 ${formik.errors.syllabus?.[sectionIndex]?.topics?.[topicIndex]?.videoUrl ? 'border-red-500' : ''}`}
                                            />
                                            <Input
                                              type="time"
                                              step="1"
                                              value={topic.duration}
                                              onChange={(e) => updateTopicDuration(sectionIndex, topicIndex, e.target.value)}
                                              onBlur={() => handleFieldBlur(`syllabus.${sectionIndex}.topics.${topicIndex}.duration`)}
                                              className={`w-32 ${formik.errors.syllabus?.[sectionIndex]?.topics?.[topicIndex]?.duration ? 'border-red-500' : ''}`}
                                            />
                                          </div>
                                        </div>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="icon"
                                          onClick={() => removeTopic(sectionIndex, topicIndex)}
                                        >
                                          <Minus className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => addTopic(sectionIndex)}
                                      className="w-full"
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      {t('courseForm.content.syllabus.addTopic')}
                                    </Button>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => removeSection(sectionIndex)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </Card>
      {renderUploadStatus()}
    </div>
  );
};

export default ContentStep;
