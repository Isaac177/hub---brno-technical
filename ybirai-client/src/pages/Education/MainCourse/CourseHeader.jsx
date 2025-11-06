import React from 'react';
import { ArrowLeft } from "lucide-react";
import { Button } from '../../../components/ui/button';
import { useTranslation } from 'react-i18next';

export const CourseHeader = ({ title, description, onBack }) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Button variant="ghost" className="gap-2" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" /> {t('course.backToCourses')}
      </Button>
    </div>
  );
};

export default CourseHeader;