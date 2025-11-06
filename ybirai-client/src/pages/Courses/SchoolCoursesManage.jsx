import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useCourse } from '../../contexts/CourseContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { ArrowLeft, Edit, Trash2, ChevronDown } from "lucide-react";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Button } from "../../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import ReactPlayer from 'react-player';
import { getVideoUrl } from '../../utils/getVideoUrl';
import { useLanguage } from '../../contexts/LanguageContext';
const SchoolCoursesManage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { userSub } = useAuth();
  const courses = location.state?.courses || [];
  const [selectedCourse, setSelectedCourse] = useState(null);
  const { setIsCourseEditing, setCourseToEdit } = useCourse();
  const { displayLanguage } = useLanguage();

  const handleEdit = (course) => {
    setIsCourseEditing(true);
    setCourseToEdit(course);
    navigate(`/${displayLanguage}/${userSub}/admin/education/update-course/${course.id}`);
  };

  const handleDelete = (courseId) => {
    console.log('Delete course:', courseId);
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
  };

  const formatDuration = (duration) => {
    const [hours, minutes] = duration.split(':').map(Number);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{t('schoolCoursesManage.title')}</h1>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">{t('schoolCoursesManage.noCourses')}</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="relative cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleCourseClick(course)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{course.title}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(course);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(course.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <p className="text-sm">{t('schoolCoursesManage.courseDetails.price')}: ${course.price}</p>
                    <p className="text-sm">{t('schoolCoursesManage.courseDetails.language')}: {course.language}</p>
                    {course.tags && course.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {course.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      <Sheet open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <SheetContent side="right" className="w-[50vw] max-w-none overflow-y-auto text-dark dark:text-white">
          <SheetHeader className="mb-6">
            <SheetTitle>{selectedCourse?.title}</SheetTitle>
            <SheetDescription>
              {selectedCourse?.description}
            </SheetDescription>
          </SheetHeader>

          <div className="h-full overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                {selectedCourse?.featuredImageUrl && (
                  <div className="relative">
                    <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      {t('schoolCoursesManage.courseDetails.featuredImage')}
                    </div>
                    <img
                      src={selectedCourse.featuredImageUrl}
                      alt={`${selectedCourse.title} - Featured`}
                      className="w-full object-cover rounded-lg"
                    />
                  </div>
                )}
                {selectedCourse?.thumbnailUrl && (
                  <div className="relative">
                    <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      {t('schoolCoursesManage.courseDetails.thumbnailImage')}
                    </div>
                    <img
                      src={selectedCourse.thumbnailUrl}
                      alt={`${selectedCourse.title} - Thumbnail`}
                      className="w-full h-96 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-bold">{selectedCourse?.title}</h2>
                <p className="text-muted-foreground mt-2">{selectedCourse?.description}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('schoolCoursesManage.courseDetails.courseInfo')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('schoolCoursesManage.courseDetails.price')}</p>
                      <p>${selectedCourse?.price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('schoolCoursesManage.courseDetails.language')}</p>
                      <p>{selectedCourse?.language}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('schoolCoursesManage.courseDetails.requirements')}</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedCourse?.requirements.map((req, index) => (
                      <li key={index} className="text-sm">{req}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('schoolCoursesManage.courseDetails.learningObjectives')}</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedCourse?.learningObjectives.map((obj, index) => (
                      <li key={index} className="text-sm">{obj}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('schoolCoursesManage.courseDetails.courseContent')}</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {selectedCourse?.syllabus.map((section) => (
                      <AccordionItem key={section.id} value={section.id}>
                        <AccordionTrigger>
                          <div className="flex flex-col items-start">
                            <span>{section.title}</span>
                            <span className="text-sm text-muted-foreground">
                              {section.topics.length} lectures • {formatDuration(section.duration)}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            {section.topics.map((topic) => {
                              const videoUrl = getVideoUrl(topic.videoUrl);
                              console.log('video url', videoUrl);
                              return (
                                <div key={topic.id} className="p-4 rounded-lg bg-secondary/20">
                                  <h4 className="font-medium mb-2">{topic.title}</h4>
                                  <div className="aspect-video rounded-md overflow-hidden">
                                    {topic.thumbnailUrl && (
                                      <img
                                        src={topic.thumbnailUrl}
                                        alt={`Thumbnail for ${topic.title}`}
                                        className="w-full h-auto object-cover"
                                      />
                                    )}
                                    <ReactPlayer
                                      url={videoUrl}
                                      controls
                                      width="100%"
                                      height="auto"
                                      config={{
                                        file: {
                                          attributes: {
                                            crossOrigin: "anonymous",
                                            controlsList: "nodownload",
                                          },
                                          forceVideo: true,
                                        },
                                      }}
                                    />
                                  </div>
                                  <div className="mt-2 text-sm text-muted-foreground">
                                    {t('schoolCoursesManage.courseDetails.duration')}: {formatDuration(topic.duration)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('schoolCoursesManage.courseDetails.aboutCourse')}</h3>
                  <div
                    className="prose prose-sm max-w-none text-sm text-gray-600"
                    dangerouslySetInnerHTML={{ __html: selectedCourse?.longDescription }}
                  />
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SchoolCoursesManage;
