package com.example.courseService.mapper.impl;

import com.example.courseService.dto.request.CourseRequest;
import com.example.courseService.dto.response.CourseDTO;
import com.example.courseService.dto.response.CourseFullDTO;
import com.example.courseService.dto.response.QuizDTO;
import com.example.courseService.enums.Language;
import com.example.courseService.mapper.CourseMapper;
import com.example.courseService.mapper.ModuleMapper;
import com.example.courseService.model.Course;
import com.example.courseService.model.File;
import com.example.courseService.model.Module;
import com.example.courseService.service.QuizService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CourseMapperImpl implements CourseMapper {

        private final ModuleMapper moduleMapper;
        private final QuizService quizService;

        @Override
        public Course toEntity(CourseRequest dto, UUID id) {
                return Course.builder()
                                .id(id)
                                .schoolId(dto.getSchoolId())
                                .title(dto.getTitle())
                                .description(dto.getDescription())
                                .longDescription(dto.getLongDescription())
                                .categoryId(dto.getCategoryId())
                                .language(dto.getLanguage())
                                .price(dto.getPrice())
                                .featuredImage(dto.getFeaturedImage())
                                .thumbnail(dto.getThumbnail())
                                .tags(dto.getTags())
                                .syllabus(null)//will be set in service
                                .subtitles(dto.getSubtitles())
                                .requirements(dto.getRequirements())
                                .learningObjectives(dto.getLearningObjectives())
                                .build();
        }
        @Override
        public CourseDTO toDTO(Course course) {

                File thumbnail = course.getThumbnail();
                File featuredImage = course.getFeaturedImage();

                List<Module> syllabus = course.getSyllabus();
                List<QuizDTO> quizzes = quizService.getQuizzesByCourseId(course.getId());

                return CourseDTO.builder()
                                .id(course.getId())
                                .schoolId(course.getSchoolId())
                                .categoryId(course.getCategoryId())
                                .title(course.getTitle())
                                .description(course.getDescription())
                                .longDescription(course.getLongDescription())
                                .language(course.getLanguage() != null ? course.getLanguage().toString() : null)
                                .price(course.getPrice())
                                .thumbnailUrl(thumbnail != null ? thumbnail.getUrl() : null)
                                .featuredImageUrl(featuredImage != null ? featuredImage.getUrl() : null)
                                .tags(course.getTags())
                                .requirements(course.getRequirements())
                                .learningObjectives(course.getLearningObjectives())
                                .subtitles(course.getSubtitles() != null
                                        ? course.getSubtitles().stream()
                                                        .map(Language::toString)
                                                        .toList()
                                        : null)
                                .syllabus(syllabus != null
                                        ? syllabus.stream()
                                                        .map(moduleMapper::toDto)
                                                        .toList()
                                        : null)
                                .quizzes(quizzes)
                                .instructorsCount( (course.getInstructors()!= null) ? course.getInstructors().size() : 0)
                                .build();
        }
        @Override
        public CourseDTO toFullDTO(Course course, Object instructors) {

                List<Module> syllabus = course.getSyllabus();
                List<QuizDTO> quizzes = quizService.getQuizzesByCourseId(course.getId());

                File thumbnail = course.getThumbnail();
                File featuredImage = course.getFeaturedImage();

                return CourseFullDTO.builder()
                        .id(course.getId())
                        .schoolId(course.getSchoolId())
                        .title(course.getTitle())
                        .description(course.getDescription())
                        .longDescription(course.getLongDescription())
                        .requirements(course.getRequirements())
                        .categoryId(course.getCategoryId())
                        .language(course.getLanguage().toString())
                        .syllabus(syllabus.stream().map(moduleMapper::toDto).toList())
                        .subtitles(course.getSubtitles().stream().map(Language::toString).toList())
                        .price(course.getPrice())
                        .thumbnailUrl(thumbnail != null ? thumbnail.getUrl() : null)
                        .featuredImageUrl(featuredImage != null ? featuredImage.getUrl() : null)
                        .tags(course.getTags())
                        .learningObjectives(course.getLearningObjectives())
                        .instructors(instructors)
                        .quizzes(quizzes)
                        .build();
        }

}
