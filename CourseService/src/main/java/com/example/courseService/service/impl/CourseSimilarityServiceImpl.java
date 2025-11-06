package com.example.courseService.service.impl;

import com.example.courseService.dto.response.CourseDTO;
import com.example.courseService.model.Course;
import com.example.courseService.repository.CourseRepository;
import com.example.courseService.mapper.CourseMapper;
import com.example.courseService.service.CourseSimilarityService;
import com.example.courseService.utils.SimilarityUtils;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseSimilarityServiceImpl implements CourseSimilarityService {

        private final CourseRepository courseRepository;
        private  final CourseMapper courseMapper;
        // Main Method
        @Override
        public Page<CourseDTO> getSimilarCourses(UUID courseId, int page, int size) {
                Course baseCourse = findCourseById(courseId);

                Pageable pageable = PageRequest.of(page, size);
                List<Course> allCourses = getAllCourses(pageable);

                List<CourseDTO> courseDTOs = allCourses.stream()
                        .filter(course -> !course.getId().equals(courseId))
                        .peek(course -> course.setSimilarityScore(calculateOverallSimilarity(baseCourse, course)))
                        .sorted((c1, c2) -> Double.compare(c2.getSimilarityScore(), c1.getSimilarityScore()))
                        .map(courseMapper::toDTO)
                        .collect(Collectors.toList());

                return new PageImpl<>(courseDTOs, pageable, courseDTOs.size());
        }

        // Helper Methods
        private Course findCourseById(UUID courseId) {
                return courseRepository.findById(courseId)
                        .orElseThrow(() -> new IllegalArgumentException("Course with ID " + courseId + " not found."));
        }

        private List<Course> getAllCourses(Pageable pageable) {
                return courseRepository.findAll(pageable).getContent();
        }

        private double calculateOverallSimilarity(Course course1, Course course2) {
                if(course1 == null || course2 == null) {
                        throw new IllegalArgumentException("Course cannot be null");
                }
                return calculateWeightedSimilarity(course1, course2);
        }

        private double calculateWeightedSimilarity(Course course1,
                                                   Course course2) {
                double weightCategory = 0.225, weightInstructors = 0.125, weightTitle = 0.1;
                double weightLearningObjectives = 0.1, weightDescription = 0.05, weightSchoolId = 0.05, weightTags = 0.05;
                double weightPrice = 0.05, weightLongDescription = 0.025, weightRequirements = 0.225;

                double titleSimilarity = calculateSimilarity(course1.getTitle(), course2.getTitle());
                double descriptionSimilarity = calculateSimilarity(course1.getDescription(), course2.getDescription());
                double longDescriptionSimilarity = calculateSimilarity(course1.getLongDescription(), course2.getLongDescription());

                double tagSimilarity = SimilarityUtils.calculateJaccardSimilarity(
                        new HashSet<>(course1.getTags()), new HashSet<>(course2.getTags()));
                double categorySimilarity = course1.getCategoryId().equals(course2.getCategoryId()) ? 1.0 : 0.0;
                double priceSimilarity = SimilarityUtils.calculatePriceSimilarity(course1.getPrice().doubleValue(), course2.getPrice().doubleValue());
                double instructorSimilarity = SimilarityUtils.calculateJaccardSimilarityForUUIDs(course1.getInstructors(), course2.getInstructors());
                double learningObjectivesSimilarity = SimilarityUtils.calculateJaccardSimilarity(
                        new HashSet<>(course1.getLearningObjectives()),
                        new HashSet<>(course2.getLearningObjectives()));
                double requirementsSimilarity = SimilarityUtils.calculateJaccardSimilarity(
                        new HashSet<>(course1.getRequirements()),
                        new HashSet<>(course2.getRequirements()));
                double schoolSimilarity = course1.getSchoolId().equals(course2.getSchoolId()) ? 1.0 : 0.0;

                return (weightTags * tagSimilarity) +
                        (weightTitle * titleSimilarity) +
                        (weightDescription * descriptionSimilarity) +
                        (weightLongDescription * longDescriptionSimilarity) +
                        (weightCategory * categorySimilarity) +
                        (weightPrice * priceSimilarity) +
                        (weightInstructors * instructorSimilarity) +
                        (weightLearningObjectives * learningObjectivesSimilarity) +
                        (weightSchoolId * schoolSimilarity) +
                        (weightRequirements * requirementsSimilarity);
        }

        private double calculateSimilarity(
                                           String text1,
                                           String text2) {
                return  SimilarityUtils.calculateLevenshteinSimilarity(text1, text2);
        }

}
