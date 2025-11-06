package com.example.courseService.service.impl;

import com.example.courseService.dto.request.ModuleRequest;
import com.example.courseService.dto.request.TopicRequest;
import com.example.courseService.event.CourseCreatedEvent;
import com.example.courseService.mapper.ModuleMapper;
import com.example.courseService.mapper.impl.TopicMapperImpl;
import com.example.courseService.model.Module;
import com.example.courseService.model.Topic;
import com.example.courseService.repository.ModuleRepository;
import com.example.courseService.repository.TopicRepository;
import com.example.courseService.service.CourseService;
import com.example.courseService.service.StorageService;
import com.example.courseService.service.messaging.RabbitMQProducer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.courseService.exception.implementation.NoChangesException;
import com.example.courseService.exception.implementation.ResourceNotFoundException;
import com.example.courseService.mapper.CourseMapper;
import lombok.RequiredArgsConstructor;

import com.example.courseService.dto.request.CourseRequest;
import com.example.courseService.dto.request.UpdateCourseRequest;
import com.example.courseService.dto.response.BatchCourseResponse;
import com.example.courseService.dto.response.CourseDTO;
import com.example.courseService.model.Course;
import com.example.courseService.model.File;
import com.example.courseService.repository.CourseRepository;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import com.example.courseService.dto.response.StudyStatisticsResponse;
import com.example.courseService.event.StudyStatisticsRequestEvent;
import com.example.courseService.service.messaging.StudyStatisticsResponseListener;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {
    private final RabbitMQProducer rabbitMQProducer;
    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;
    private final StorageService storageService;
    private final MessageSource messageSource;
    private final ModuleMapper moduleMapper;
    private final TopicMapperImpl topicMapperImpl;
    private final TopicRepository topicRepository;
    private final ModuleRepository moduleRepository;
    private final StudyStatisticsResponseListener responseListener;

    @Override
    public CourseDTO createCourse(CourseRequest courseRequest, MultipartFile featuredImage, MultipartFile thumbnail)
            throws IOException {
        File featuredImage2save = featuredImage != null ? storageService.uploadFile(featuredImage) : null;
        File thumbnail2save = thumbnail != null ? storageService.uploadFile(thumbnail) : null;

        courseRequest.setThumbnail(thumbnail2save);
        courseRequest.setFeaturedImage(featuredImage2save);

        UUID uuid = UUID.randomUUID();
        Course course = courseMapper.toEntity(courseRequest, uuid);

        List<Module> syllabus = handleSyllabus(courseRequest.getSyllabus(), course);
        course.setSyllabus(syllabus);

        rabbitMQProducer.publishCourseCreatedEvent(new CourseCreatedEvent(
                course.getId(),
                course.getCategoryId(),
                course.getTitle(),
                course.getDescription()));

        return courseMapper.toDTO(courseRepository.save(course));
    }

    @Override
    public CourseDTO updateCourse(UUID id, UpdateCourseRequest updateCourseRequest, MultipartFile newFeaturedImage,
            MultipartFile newThumbnail) {
        Locale locale = LocaleContextHolder.getLocale();
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id " + id));

        log.info("Updating course {} with request: {}", id, updateCourseRequest);
        log.info("Media files - featuredImage: {}, thumbnail: {}",
                newFeaturedImage != null ? newFeaturedImage.getOriginalFilename() : "null",
                newThumbnail != null ? newThumbnail.getOriginalFilename() : "null");

        boolean hasChanges = false;

        if (updateCourseRequest.hasBasicInfoUpdates()) {
            log.info("Updating basic info for course {}", id);
            hasChanges |= updateBasicInfo(course, updateCourseRequest);
        }

        if (newFeaturedImage != null || newThumbnail != null) {
            log.info("Updating media for course {}", id);
            hasChanges |= updateMedia(course, newFeaturedImage, newThumbnail);
        }

        if (updateCourseRequest.hasContentUpdates()) {
            log.info("Updating content for course {}", id);
            hasChanges |= updateContent(course, updateCourseRequest);
        }

        if (updateCourseRequest.hasPricingUpdates()) {
            log.info("Updating pricing for course {}", id);
            hasChanges |= updatePricing(course, updateCourseRequest);
        }

        if (!hasChanges) {
            log.info("No changes detected for course {}", id);
            throw new NoChangesException(messageSource, locale);
        }

        Course savedCourse = courseRepository.save(course);
        log.info("Successfully updated course {}", id);

        return courseMapper.toDTO(savedCourse);
    }

    private boolean updateBasicInfo(Course course, UpdateCourseRequest request) {
        boolean changed = false;

        if (request.getTitle() != null && !request.getTitle().equals(course.getTitle())) {
            course.setTitle(request.getTitle());
            changed = true;
        }

        if (request.getDescription() != null && !request.getDescription().equals(course.getDescription())) {
            course.setDescription(request.getDescription());
            changed = true;
        }

        if (request.getLongDescription() != null && !request.getLongDescription().equals(course.getLongDescription())) {
            course.setLongDescription(request.getLongDescription());
            changed = true;
        }

        if (request.getSchoolId() != null && !request.getSchoolId().equals(course.getSchoolId())) {
            course.setSchoolId(request.getSchoolId());
            changed = true;
        }

        if (request.getCategoryId() != null && !request.getCategoryId().equals(course.getCategoryId())) {
            course.setCategoryId(request.getCategoryId());
            changed = true;
        }

        if (request.getLanguage() != null && !request.getLanguage().equals(course.getLanguage())) {
            course.setLanguage(request.getLanguage());
            changed = true;
        }

        return changed;
    }

    private boolean updateMedia(Course course, MultipartFile newFeaturedImage, MultipartFile newThumbnail) {
        boolean changed = false;

        try {
            if (newFeaturedImage != null) {
                log.info("Processing featured image update for course {}", course.getId());
                File oldFeaturedImage = course.getFeaturedImage();
                File newFeaturedImageFile = storageService.uploadFile(newFeaturedImage);

                if (oldFeaturedImage != null && oldFeaturedImage.getName() != null) {
                    try {
                        storageService.deleteFile(oldFeaturedImage.getName());
                        log.info("Deleted old featured image: {}", oldFeaturedImage.getName());
                    } catch (Exception e) {
                        log.warn("Failed to delete old featured image: {}", e.getMessage());
                    }
                }

                course.setFeaturedImage(newFeaturedImageFile);
                changed = true;
                log.info("Updated featured image for course {}", course.getId());
            }

            if (newThumbnail != null) {
                log.info("Processing thumbnail update for course {}", course.getId());
                File oldThumbnail = course.getThumbnail();
                File newThumbnailFile = storageService.uploadFile(newThumbnail);

                if (oldThumbnail != null && oldThumbnail.getName() != null) {
                    try {
                        storageService.deleteFile(oldThumbnail.getName());
                        log.info("Deleted old thumbnail: {}", oldThumbnail.getName());
                    } catch (Exception e) {
                        log.warn("Failed to delete old thumbnail: {}", e.getMessage());
                    }
                }

                course.setThumbnail(newThumbnailFile);
                changed = true;
                log.info("Updated thumbnail for course {}", course.getId());
            }

        } catch (IOException e) {
            log.error("Error updating media for course {}: {}", course.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to update course media", e);
        }

        return changed;
    }

    private boolean updateContent(Course course, UpdateCourseRequest request) {
        boolean changed = false;

        if (request.getRequirements() != null && !request.getRequirements().equals(course.getRequirements())) {
            course.setRequirements(request.getRequirements());
            changed = true;
        }

        if (request.getLearningObjectives() != null
                && !request.getLearningObjectives().equals(course.getLearningObjectives())) {
            course.setLearningObjectives(request.getLearningObjectives());
            changed = true;
        }

        if (request.getSyllabus() != null) {
            // Delete old video files from existing syllabus before replacing
            deleteTopicMedia(course);

            List<Module> newSyllabus = handleSyllabus(request.getSyllabus(), course);
            // Simple comparison - in production you might want more sophisticated
            // comparison
            if (!Objects.equals(course.getSyllabus(), newSyllabus)) {
                course.setSyllabus(newSyllabus);
                changed = true;
            }
        }

        return changed;
    }

    private boolean updatePricing(Course course, UpdateCourseRequest request) {
        boolean changed = false;

        if (request.getPrice() != null && !request.getPrice().equals(course.getPrice())) {
            course.setPrice(request.getPrice());
            changed = true;
        }

        if (request.getTags() != null && !request.getTags().equals(course.getTags())) {
            course.setTags(request.getTags());
            changed = true;
        }

        if (request.getSubtitles() != null && !request.getSubtitles().equals(course.getSubtitles())) {
            course.setSubtitles(request.getSubtitles());
            changed = true;
        }

        return changed;
    }

    @Override
    public Course getCourseById(UUID id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id " + id));
    }

    @Override
    public CourseDTO getCourseDTObyId(UUID id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id " + id));
        Object instructorDetails = null;
        if (course.getInstructors() != null && !course.getInstructors().isEmpty()) {
            instructorDetails = rabbitMQProducer.getInstructorDetails(course.getInstructors());
        }

        return courseMapper.toFullDTO(course, instructorDetails);
    }

    @Override
    public Page<CourseDTO> getAllCourses(int page, int size) {
        Page<Course> courses = courseRepository.findAllSortedByCreatedAtDesc(PageRequest.of(page, size));
        return courses.map(courseMapper::toDTO);
    }

    @Override
    @Transactional
    public void deleteCourse(UUID id) {
        Course course = getCourseById(id);

        deleteCourseFeaturedMedia(course);
        deleteModuleMedia(course);
        deleteTopicMedia(course);

        courseRepository.delete(course);
    }

    private void deleteCourseFeaturedMedia(Course course) {
        if (course.getFeaturedImage() != null && course.getFeaturedImage().getName() != null) {
            try {
                storageService.deleteFile(course.getFeaturedImage().getName());
                log.info("Deleted featured image for course: {}", course.getId());
            } catch (Exception e) {
                log.error("Error deleting featured image for course {}: {}", course.getId(), e.getMessage());
            }
        }

        if (course.getThumbnail() != null && course.getThumbnail().getName() != null) {
            try {
                storageService.deleteFile(course.getThumbnail().getName());
                log.info("Deleted thumbnail for course: {}", course.getId());
            } catch (Exception e) {
                log.error("Error deleting thumbnail for course {}: {}", course.getId(), e.getMessage());
            }
        }
    }

    private void deleteModuleMedia(Course course) {
        if (course.getSyllabus() != null) {
            course.getSyllabus().forEach(module -> {
                if (module != null && module.getThumbnailUrl() != null) {
                    try {
                        storageService.deleteFile(extractFileNameFromUrl(module.getThumbnailUrl()));
                        log.info("Deleted module thumbnail for module: {} in course: {}", module.getId(),
                                course.getId());
                    } catch (Exception e) {
                        log.error("Error deleting module thumbnail for module {} in course {}: {}",
                                module.getId(), course.getId(), e.getMessage());
                    }
                }
            });
        }
    }

    private void deleteTopicMedia(Course course) {
        if (course.getSyllabus() != null) {
            course.getSyllabus().forEach(module -> {
                if (module != null && module.getTopics() != null) {
                    module.getTopics().forEach(topic -> {
                        if (topic != null && topic.getVideoUrl() != null) {
                            try {
                                storageService.deleteFile(extractFileNameFromUrl(topic.getVideoUrl()));
                                log.info("Deleted topic video for topic: {} in module: {} in course: {}",
                                        topic.getId(), module.getId(), course.getId());
                            } catch (Exception e) {
                                log.error("Error deleting topic video for topic {} in module {} in course {}: {}",
                                        topic.getId(), module.getId(), course.getId(), e.getMessage());
                            }
                        }
                    });
                }
            });
        }
    }

    private String extractFileNameFromUrl(String url) {
        if (url == null)
            return null;
        // Extract filename from S3 URL
        // Example URL: https://bucket.s3.region.amazonaws.com/filename.ext
        // or: https://bucket.s3.region.amazonaws.com/path/to/filename.ext
        return url.substring(url.lastIndexOf('/') + 1);
    }

    @Override
    @Transactional
    public void deleteAllCoursesBySchoolId(UUID schoolId) {
        log.info("Starting deletion of all courses for school: {}", schoolId);
        List<Course> courses = courseRepository.findAllBySchoolId(schoolId);

        log.info("Found {} courses to delete for school: {}", courses.size(), schoolId);
        courses.forEach(course -> {
            try {
                deleteCourse(course.getId());
                log.info("Successfully deleted course: {}", course.getId());
            } catch (Exception e) {
                log.error("Error deleting course {}: {}", course.getId(), e.getMessage());
                throw e;
            }
        });

        log.info("Completed deletion of all courses for school: {}", schoolId);
    }

    @Override
    public Page<CourseDTO> getCheapestCourses(Pageable pageable) {
        Page<Course> cheapestCourses = courseRepository.findAllByOrderByPriceAsc(pageable);
        return cheapestCourses.map(courseMapper::toDTO);
    }

    @Override
    public Page<CourseDTO> getPopularCourses(Pageable pageable) {
        return null;
        // Page<Course> popularCourses =
        // courseRepository.findAllByOrderByEnrollmentCountDesc(pageable);
        // return popularCourses.map(courseMapper::toDTO);
    }

    @Override
    public Page<CourseDTO> getShortestCourses(Pageable pageable) {
        return null;
        // Page<Course> shortestCourses =
        // courseRepository.findAllByOrderByDurationInWeeksAsc(pageable);
        // return shortestCourses.map(courseMapper::toDTO);
    }

    @Override
    public long countCoursesByInstructorId(UUID instructorId) {
        return courseRepository.countCoursesByInstructorId(instructorId);
    }

    @Override
    public BatchCourseResponse getBatchCourses(List<UUID> courseIds) {
        if (courseIds == null || courseIds.isEmpty()) {
            return BatchCourseResponse.builder()
                    .success(true)
                    .courses(Collections.emptyList())
                    .errors(Collections.emptyMap())
                    .build();
        }

        List<Course> courses = courseRepository.findAllById(courseIds);
        Map<UUID, String> errors = new HashMap<>();

        courseIds.forEach(id -> {
            if (courses.stream().noneMatch(course -> course.getId().equals(id))) {
                errors.put(id, "Course not found");
            }
        });

        List<CourseDTO> courseDTOs = courses.stream()
                .map(courseMapper::toDTO)
                .collect(Collectors.toList());

        return BatchCourseResponse.builder()
                .success(!courseDTOs.isEmpty())
                .courses(courseDTOs)
                .errors(errors)
                .build();
    }

    @Override
    public BatchCourseResponse getBatchCoursesBySchool(List<UUID> schoolIds) {
        if (schoolIds == null || schoolIds.isEmpty()) {
            return BatchCourseResponse.builder()
                    .success(true)
                    .courses(Collections.emptyList())
                    .errors(Collections.emptyMap())
                    .build();
        }

        List<Course> courses = courseRepository.findBySchoolIdIn(schoolIds);
        List<CourseDTO> courseDTOs = courses.stream()
                .map(courseMapper::toDTO)
                .collect(Collectors.toList());

        return BatchCourseResponse.builder()
                .success(true)
                .courses(courseDTOs)
                .errors(Collections.emptyMap())
                .build();
    }

    @Override
    public boolean hasCoursesForSchool(UUID schoolId) {
        log.info("Checking if school {} has courses", schoolId);
        return courseRepository.existsBySchoolId(schoolId);
    }

    @Override
    public List<Map<String, Object>> getCoursesBySchoolId(UUID schoolId) {
        log.info("Getting courses for school {}", schoolId);
        List<Course> courses = courseRepository.findAllBySchoolId(schoolId);
        
        return courses.stream().map(course -> {
            Map<String, Object> courseData = new HashMap<>();
            courseData.put("courseId", course.getId().toString());
            courseData.put("title", course.getTitle());
            courseData.put("description", course.getDescription());
            courseData.put("price", course.getPrice());
            courseData.put("enrollmentCount", 0); // Default enrollment count since Course model doesn't have this field
            courseData.put("status", "ACTIVE"); // Default status since Course model doesn't have this field
            courseData.put("createdAt", course.getCreatedAt() != null ? course.getCreatedAt().toString() : null);
            return courseData;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getCoursesBySchoolIdWithDetails(UUID schoolId) {
        log.info("Getting detailed courses for school {}", schoolId);
        List<Course> courses = courseRepository.findAllBySchoolId(schoolId);
        
        return courses.stream().map(course -> {
            Map<String, Object> courseData = new HashMap<>();
            courseData.put("courseId", course.getId().toString());
            courseData.put("title", course.getTitle());
            courseData.put("description", course.getDescription());
            courseData.put("longDescription", course.getLongDescription());
            courseData.put("price", course.getPrice());
            courseData.put("durationInWeeks", course.getDurationInWeeks());
            courseData.put("language", course.getLanguage() != null ? course.getLanguage().toString() : null);
            courseData.put("subtitles", course.getSubtitles());
            courseData.put("tags", course.getTags());
            courseData.put("requirements", course.getRequirements());
            courseData.put("learningObjectives", course.getLearningObjectives());
            courseData.put("instructors", course.getInstructors() != null ? 
                course.getInstructors().stream().map(UUID::toString).collect(Collectors.toList()) : new ArrayList<>());
            courseData.put("categoryId", course.getCategoryId() != null ? course.getCategoryId().toString() : null);
            courseData.put("enrollmentCount", 0); // Default enrollment count since Course model doesn't have this field
            courseData.put("status", "ACTIVE"); // Default status since Course model doesn't have this field
            courseData.put("createdAt", course.getCreatedAt() != null ? course.getCreatedAt().toString() : null);
            courseData.put("updatedAt", course.getUpdatedAt() != null ? course.getUpdatedAt().toString() : null);
            
            // Add featured image info if available
            if (course.getFeaturedImage() != null) {
                Map<String, Object> imageData = new HashMap<>();
                imageData.put("name", course.getFeaturedImage().getName());
                imageData.put("url", course.getFeaturedImage().getUrl());
                imageData.put("size", course.getFeaturedImage().getSize());
                imageData.put("type", course.getFeaturedImage().getType());
                imageData.put("key", course.getFeaturedImage().getKey());
                courseData.put("featuredImage", imageData);
            }
            
            // Add thumbnail info if available
            if (course.getThumbnail() != null) {
                Map<String, Object> thumbnailData = new HashMap<>();
                thumbnailData.put("name", course.getThumbnail().getName());
                thumbnailData.put("url", course.getThumbnail().getUrl());
                thumbnailData.put("size", course.getThumbnail().getSize());
                thumbnailData.put("type", course.getThumbnail().getType());
                thumbnailData.put("key", course.getThumbnail().getKey());
                courseData.put("thumbnail", thumbnailData);
            }
            
            return courseData;
        }).collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getCoursesByInstructorIdWithDetails(UUID instructorId) {
        log.info("Getting detailed courses for instructor {}", instructorId);
        List<Course> courses = courseRepository.findCoursesByInstructorId(instructorId);
        
        return courses.stream().map(course -> {
            Map<String, Object> courseData = new HashMap<>();
            courseData.put("courseId", course.getId().toString());
            courseData.put("title", course.getTitle());
            courseData.put("description", course.getDescription());
            courseData.put("longDescription", course.getLongDescription());
            courseData.put("price", course.getPrice());
            courseData.put("durationInWeeks", course.getDurationInWeeks());
            courseData.put("language", course.getLanguage() != null ? course.getLanguage().toString() : null);
            courseData.put("subtitles", course.getSubtitles());
            courseData.put("tags", course.getTags());
            courseData.put("requirements", course.getRequirements());
            courseData.put("learningObjectives", course.getLearningObjectives());
            courseData.put("instructors", course.getInstructors() != null ? 
                course.getInstructors().stream().map(UUID::toString).collect(Collectors.toList()) : new ArrayList<>());
            courseData.put("categoryId", course.getCategoryId() != null ? course.getCategoryId().toString() : null);
            courseData.put("schoolId", course.getSchoolId() != null ? course.getSchoolId().toString() : null);
            courseData.put("enrollmentCount", 0); // Default enrollment count since Course model doesn't have this field
            courseData.put("status", "ACTIVE"); // Default status since Course model doesn't have this field
            courseData.put("createdAt", course.getCreatedAt() != null ? course.getCreatedAt().toString() : null);
            courseData.put("updatedAt", course.getUpdatedAt() != null ? course.getUpdatedAt().toString() : null);
            
            // Add featured image info if available
            if (course.getFeaturedImage() != null) {
                Map<String, Object> imageData = new HashMap<>();
                imageData.put("name", course.getFeaturedImage().getName());
                imageData.put("url", course.getFeaturedImage().getUrl());
                imageData.put("size", course.getFeaturedImage().getSize());
                imageData.put("type", course.getFeaturedImage().getType());
                imageData.put("key", course.getFeaturedImage().getKey());
                courseData.put("featuredImage", imageData);
            }
            
            // Add thumbnail info if available
            if (course.getThumbnail() != null) {
                Map<String, Object> thumbnailData = new HashMap<>();
                thumbnailData.put("name", course.getThumbnail().getName());
                thumbnailData.put("url", course.getThumbnail().getUrl());
                thumbnailData.put("size", course.getThumbnail().getSize());
                thumbnailData.put("type", course.getThumbnail().getType());
                thumbnailData.put("key", course.getThumbnail().getKey());
                courseData.put("thumbnail", thumbnailData);
            }
            
            return courseData;
        }).collect(Collectors.toList());
    }

    private List<Module> handleSyllabus(List<ModuleRequest> syllabusRequest, Course course) {
        List<Module> modules = new ArrayList<>();

        for (ModuleRequest moduleRequest : syllabusRequest) {
            Module module = moduleMapper.toEntity(moduleRequest, course);
            List<Topic> topics = handleTopics(moduleRequest.getTopics(), module);
            module.setTopics(topics);
            modules.add(module);
            moduleRepository.save(module);
        }
        return modules;
    }

    private List<Topic> handleTopics(List<TopicRequest> topicsRequest, Module module) {
        List<Topic> topics = new ArrayList<>();
        for (TopicRequest topicRequest : topicsRequest) {
            Topic topic = topicMapperImpl.toTopic(topicRequest, module);
            topics.add(topic);
            topicRepository.save(topic);
        }
        return topics;
    }

    @Override
    public CompletableFuture<StudyStatisticsResponse> getUnifiedStudyStatistics() {
        log.info("Starting unified study statistics collection");
        
        UUID requestId = UUID.randomUUID();
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Collect course statistics from local database
                Map<String, Object> courseStats = collectCourseStatistics();
                
                // Create event to collect statistics from other services
                StudyStatisticsRequestEvent event = StudyStatisticsRequestEvent.builder()
                        .requestId(requestId)
                        .eventType("COLLECT_STUDY_STATISTICS")
                        .replyTo("course_statistics_response")
                        .build();
                
                // Publish event to collect statistics from UserService and StudentManagementService
                log.info("📤 Publishing statistics request event with ID: {} to exchange: {} with routing key: study.statistics.request", 
                        requestId, "user_events");
                rabbitMQProducer.publishStudyStatisticsRequest(event);
                log.info("📤 Event published successfully, waiting for responses from UserService and StudentManagementService...");
                
                // Wait for responses (with timeout)
                CompletableFuture<Map<String, Object>> userStatsPromise = responseListener.waitForUserStatistics(requestId);
                CompletableFuture<Map<String, Object>> enrollmentStatsPromise = responseListener.waitForEnrollmentStatistics(requestId);
                
                // Combine all statistics with graceful degradation
                log.info("⏳ Waiting for responses from other services...");
                
                Map<String, Object> userStats = new HashMap<>();
                Map<String, Object> enrollmentStats = new HashMap<>();
                
                try {
                    userStats = userStatsPromise.get(10, TimeUnit.SECONDS);
                    log.info("✅ Received UserService statistics");
                } catch (Exception e) {
                    log.warn("⚠️ UserService timeout or error: {}", e.getMessage());
                    userStats.put("error", "UserService unavailable");
                }
                
                try {
                    enrollmentStats = enrollmentStatsPromise.get(10, TimeUnit.SECONDS);
                    log.info("✅ Received StudentManagementService statistics");
                } catch (Exception e) {
                    log.warn("⚠️ StudentManagementService timeout or error: {}", e.getMessage());
                    enrollmentStats.put("error", "StudentManagementService unavailable");
                }
                
                log.info("📊 Successfully collected unified statistics for request: {}", requestId);
                log.info("📈 UserStats size: {}, EnrollmentStats size: {}", userStats.size(), enrollmentStats.size());
                return StudyStatisticsResponse.success(requestId, courseStats, userStats, enrollmentStats);
                
            } catch (Exception e) {
                log.error("Error collecting unified statistics for request {}: {}", requestId, e.getMessage(), e);
                return StudyStatisticsResponse.error(requestId, "Failed to collect statistics: " + e.getMessage());
            }
        });
    }
    
    private Map<String, Object> collectCourseStatistics() {
        log.info("Collecting comprehensive course statistics from local database");
        
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // === BASIC COURSE COUNTS ===
            long totalCourses = courseRepository.count();
            stats.put("totalCourses", totalCourses);
            
            // Recent courses (last 30 days)
            long recentCourses = courseRepository.countRecentCourses();
            stats.put("recentCourses", recentCourses);
            
            // === COURSE DISTRIBUTION ===
            // Courses by school
            List<Object[]> coursesBySchool = courseRepository.countCoursesBySchool();
            Map<String, Long> schoolCourseCount = new HashMap<>();
            for (Object[] row : coursesBySchool) {
                String schoolId = row[0] != null ? row[0].toString() : "unknown";
                Long count = (Long) row[1];
                schoolCourseCount.put(schoolId, count);
            }
            stats.put("coursesBySchool", schoolCourseCount);
            
            // Courses by language
            List<Object[]> coursesByLanguage = courseRepository.countCoursesByLanguage();
            Map<String, Long> languageCount = new HashMap<>();
            for (Object[] row : coursesByLanguage) {
                String language = row[0] != null ? row[0].toString() : "unknown";
                Long count = (Long) row[1];
                languageCount.put(language, count);
            }
            stats.put("coursesByLanguage", languageCount);
            
            // === PRICING ANALYSIS ===
            // Get all courses with prices for detailed analysis
            List<Course> coursesWithPrices = courseRepository.findAllWithPrice();
            
            // Average course price
            Double avgPrice = courseRepository.getAverageCoursePrice();
            stats.put("averageCoursePrice", avgPrice != null ? avgPrice : 0.0);
            
            // Price distribution
            Map<String, Long> priceDistribution = new HashMap<>();
            coursesWithPrices.forEach(course -> {
                double price = course.getPrice() != null ? course.getPrice().doubleValue() : 0.0;
                String category;
                if (price == 0) category = "Free";
                else if (price <= 50) category = "Budget ($1-50)";
                else if (price <= 100) category = "Affordable ($51-100)";
                else if (price <= 200) category = "Standard ($101-200)";
                else if (price <= 500) category = "Premium ($201-500)";
                else category = "Luxury ($500+)";
                
                priceDistribution.put(category, priceDistribution.getOrDefault(category, 0L) + 1);
            });
            stats.put("priceDistribution", priceDistribution);
            
            // Price statistics
            Map<String, Object> priceStats = new HashMap<>();
            if (!coursesWithPrices.isEmpty()) {
                double minPrice = coursesWithPrices.stream()
                    .mapToDouble(course -> course.getPrice() != null ? course.getPrice().doubleValue() : 0.0)
                    .min().orElse(0.0);
                double maxPrice = coursesWithPrices.stream()
                    .mapToDouble(course -> course.getPrice() != null ? course.getPrice().doubleValue() : 0.0)
                    .max().orElse(0.0);
                
                priceStats.put("minPrice", minPrice);
                priceStats.put("maxPrice", maxPrice);
                priceStats.put("freeCourses", coursesWithPrices.stream()
                    .mapToLong(course -> (course.getPrice() == null || course.getPrice().compareTo(java.math.BigDecimal.ZERO) == 0) ? 1L : 0L)
                    .sum());
                priceStats.put("paidCourses", coursesWithPrices.stream()
                    .mapToLong(course -> (course.getPrice() != null && course.getPrice().compareTo(java.math.BigDecimal.ZERO) > 0) ? 1L : 0L)
                    .sum());
            }
            stats.put("priceStats", priceStats);
            
            // === CONTENT ANALYSIS ===
            List<Course> allCourses = courseRepository.findAll();
            
            // Duration analysis
            Map<String, Long> durationDistribution = new HashMap<>();
            allCourses.forEach(course -> {
                Integer duration = course.getDurationInWeeks();
                String category;
                if (duration == null) category = "Unknown";
                else if (duration <= 2) category = "Short (1-2 weeks)";
                else if (duration <= 6) category = "Medium (3-6 weeks)";
                else if (duration <= 12) category = "Long (7-12 weeks)";
                else category = "Extended (12+ weeks)";
                
                durationDistribution.put(category, durationDistribution.getOrDefault(category, 0L) + 1);
            });
            stats.put("durationDistribution", durationDistribution);
            
            // Content richness analysis
            Map<String, Long> contentRichness = new HashMap<>();
            allCourses.forEach(course -> {
                int contentCount = 0;
                if (course.getFeaturedImage() != null) contentCount++;
                if (course.getThumbnail() != null) contentCount++;
                if (course.getSyllabus() != null && !course.getSyllabus().isEmpty()) {
                    contentCount += course.getSyllabus().size();
                }
                if (course.getLearningObjectives() != null && !course.getLearningObjectives().isEmpty()) contentCount++;
                if (course.getRequirements() != null && !course.getRequirements().isEmpty()) contentCount++;
                
                String category;
                if (contentCount == 0) category = "Minimal Content";
                else if (contentCount <= 3) category = "Basic Content";
                else if (contentCount <= 8) category = "Rich Content";
                else category = "Very Rich Content";
                
                contentRichness.put(category, contentRichness.getOrDefault(category, 0L) + 1);
            });
            stats.put("contentRichness", contentRichness);
            
            // === INSTRUCTOR ANALYSIS ===
            Map<String, Long> instructorDistribution = new HashMap<>();
            allCourses.forEach(course -> {
                int instructorCount = course.getInstructors() != null ? course.getInstructors().size() : 0;
                String category;
                if (instructorCount == 0) category = "No Instructors";
                else if (instructorCount == 1) category = "Single Instructor";
                else if (instructorCount <= 3) category = "Small Team (2-3)";
                else category = "Large Team (4+)";
                
                instructorDistribution.put(category, instructorDistribution.getOrDefault(category, 0L) + 1);
            });
            stats.put("instructorDistribution", instructorDistribution);
            
            // === CATEGORY ANALYSIS ===
            Map<String, Long> categoryDistribution = new HashMap<>();
            allCourses.forEach(course -> {
                String categoryId = course.getCategoryId() != null ? course.getCategoryId().toString() : "Uncategorized";
                categoryDistribution.put(categoryId, categoryDistribution.getOrDefault(categoryId, 0L) + 1);
            });
            stats.put("categoryDistribution", categoryDistribution);
            
            // === QUALITY METRICS ===
            Map<String, Object> qualityMetrics = new HashMap<>();
            long coursesWithThumbnails = allCourses.stream()
                .mapToLong(course -> course.getThumbnail() != null ? 1L : 0L)
                .sum();
            long coursesWithFeaturedImages = allCourses.stream()
                .mapToLong(course -> course.getFeaturedImage() != null ? 1L : 0L)
                .sum();
            long coursesWithSyllabus = allCourses.stream()
                .mapToLong(course -> course.getSyllabus() != null && !course.getSyllabus().isEmpty() ? 1L : 0L)
                .sum();
            long coursesWithObjectives = allCourses.stream()
                .mapToLong(course -> course.getLearningObjectives() != null && !course.getLearningObjectives().isEmpty() ? 1L : 0L)
                .sum();
            
            qualityMetrics.put("coursesWithThumbnails", coursesWithThumbnails);
            qualityMetrics.put("coursesWithFeaturedImages", coursesWithFeaturedImages);
            qualityMetrics.put("coursesWithSyllabus", coursesWithSyllabus);
            qualityMetrics.put("coursesWithObjectives", coursesWithObjectives);
            qualityMetrics.put("thumbnailCompletionRate", totalCourses > 0 ? 
                Math.round((double) coursesWithThumbnails / totalCourses * 100.0 * 100.0) / 100.0 : 0.0);
            qualityMetrics.put("contentCompletionRate", totalCourses > 0 ? 
                Math.round((double) coursesWithSyllabus / totalCourses * 100.0 * 100.0) / 100.0 : 0.0);
            
            stats.put("qualityMetrics", qualityMetrics);
            
            // === SUMMARY INSIGHTS ===
            Map<String, Object> insights = new HashMap<>();
            insights.put("coursesPerSchool", schoolCourseCount.isEmpty() ? 0.0 : 
                schoolCourseCount.values().stream().mapToDouble(Long::doubleValue).average().orElse(0.0));
            insights.put("mostPopularLanguage", languageCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Unknown"));
            insights.put("growthRate", totalCourses > 0 ? 
                Math.round((double) recentCourses / totalCourses * 100.0 * 100.0) / 100.0 : 0.0);
            
            stats.put("insights", insights);
            
            log.info("Comprehensive course statistics collected: {} total courses, {} recent, {} schools", 
                    totalCourses, recentCourses, schoolCourseCount.size());
            
        } catch (Exception e) {
            log.error("Error collecting course statistics: {}", e.getMessage(), e);
            stats.put("error", "Failed to collect course statistics: " + e.getMessage());
        }
        
        return stats;
    }
}