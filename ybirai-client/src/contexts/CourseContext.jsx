import React, { createContext, useContext, useState } from 'react';

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [isCourseEditing, setIsCourseEditing] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const value = {
    isCourseEditing,
    setIsCourseEditing,
    courseToEdit,
    setCourseToEdit,
    enrolledCourses,
    setEnrolledCourses,
    selectedCourse,
    setSelectedCourse,
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};
