package com.example.courseService.repository;

import java.util.List;

public interface CourseRepositoryCustom {
    
    /**
     * Count courses grouped by school ID
     * @return List of Object arrays where Object[0] is schoolId and Object[1] is count
     */
    List<Object[]> countCoursesBySchool();
    
    /**
     * Count courses grouped by language
     * @return List of Object arrays where Object[0] is language and Object[1] is count
     */
    List<Object[]> countCoursesByLanguage();
}