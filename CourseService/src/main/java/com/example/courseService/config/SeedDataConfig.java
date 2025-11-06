package com.example.courseService.config;

import com.example.courseService.enums.AssignmentFormat;
import com.example.courseService.enums.Language;
import com.example.courseService.enums.ResourceType;
import com.example.courseService.model.*;
import com.example.courseService.model.Module;
import com.example.courseService.model.enums.QuestionType;
import com.example.courseService.repository.AssignmentRepository;
import com.example.courseService.repository.CategoryRepository;
import com.example.courseService.repository.CertificateRepository;
import com.example.courseService.repository.CourseProgressRepository;
import com.example.courseService.repository.CourseRepository;
import com.example.courseService.repository.TopicRepository;
import com.example.courseService.repository.QuizQuestionRepository;
import com.example.courseService.repository.QuizRepository;
import com.example.courseService.repository.ResourceRepository;
import com.example.courseService.repository.ReviewRepository;
import com.example.courseService.repository.ModuleRepository;
import com.example.courseService.utils.DurationUtils;
import com.github.javafaker.Faker;

import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class SeedDataConfig {

        private final CourseRepository courseRepository;

        public SeedDataConfig(CourseRepository courseRepository) {
                this.courseRepository = courseRepository;
        }

        @Bean
        CommandLineRunner initDatabase(CourseRepository courseRepository,
                        CategoryRepository categoryRepository,
                        ModuleRepository moduleRepository,
                        CertificateRepository certificateRepository,
                        ReviewRepository reviewRepository,
                        AssignmentRepository assignmentRepository,
                        QuizRepository quizRepository,
                        QuizQuestionRepository quizQuestionRepository,
                        CourseProgressRepository courseProgressRepository,
                        ResourceRepository resourceRepository,
                        TopicRepository topicRepository) {

                Faker faker = new Faker();
//                log.info("Seed creation started");

                return args -> {
//                         seedCategories(faker, categoryRepository);
//                         seedCourses(faker, courseRepository, categoryRepository);
//                         seedSections(faker, moduleRepository, courseRepository);
//                         seedCertificates(faker, certificateRepository, courseRepository);
//                         seedReviews(faker, reviewRepository, courseRepository);
//                         seedAssignments(faker, assignmentRepository, moduleRepository);
//                         seedLessons(faker, topicRepository, moduleRepository);
//                         seedQuizzes(faker, quizRepository, topicRepository);
//                         seedQuizQuestions(faker, quizQuestionRepository, quizRepository);
//                         seedResources(faker, topicRepository, resourceRepository);
//                         seedCourseProgress(faker, courseRepository, topicRepository,
//                         courseProgressRepository);
//                        updateCoursesWithRandomInstructors();
//                        seedCoursesSyllabus(faker, courseRepository, moduleRepository);
//                        log.info("Seeds creation completed");
                };
        }
        private void updateCoursesWithRandomInstructors() {
                // Initialize the list of UUIDs
                List<UUID> uuids = new ArrayList<>();
                uuids.add(UUID.fromString("cb142e6b-ad0f-45d1-b256-ea72d206b331"));
                uuids.add(UUID.fromString("3495e89e-68e9-4478-87b1-0df1ce5e59f6"));
                uuids.add(UUID.fromString("f81192f3-8d6f-45c7-94b9-f34411498a17"));
                uuids.add(UUID.fromString("c4f14f9b-26f9-40fd-96f3-0ab99a652abe"));
                uuids.add(UUID.fromString("0c89f5f9-a932-45ab-8ae8-5ced7e7bc5f3"));

                // Shuffle UUIDs for randomness
                Collections.shuffle(uuids);

                // Fetch all courses
                List<Course> courses = courseRepository.findAll();

                // Update each course with random UUIDs for instructors
                for (Course course : courses) {
                        // Determine how many instructors to assign (e.g., randomly choose between 1 to 3)
                        int numberOfInstructors = (int) (Math.random() * 3) + 1; // Random number between 1 and 3

                        // If there are enough UUIDs, select a subset for instructors
                        if (numberOfInstructors <= uuids.size()) {
                                // Get a sublist of random UUIDs for the instructors
                                List<UUID> assignedInstructors = uuids.subList(0, numberOfInstructors);
                                course.setInstructors(assignedInstructors); // Assign multiple UUIDs to instructors field
                        } else {
                                // If not enough UUIDs, assign all available UUIDs
                                course.setInstructors(new ArrayList<>(uuids));
                        }

                        // Save the updated course back to MongoDB
                        courseRepository.save(course);
                }
        }

        private void seedCategories(Faker faker, CategoryRepository categoryRepository) {
                categoryRepository.deleteAll();

                List<Category> categories = new ArrayList<>();
                for (int i = 0; i < 5; i++) {
                        categories.add(new Category(UUID.randomUUID(), faker.educator().course(),
                                        faker.lorem().sentence(), null));
                        log.info("category added");
                }

                categoryRepository.saveAll(categories);
        }

        private void seedCourses(Faker faker, CourseRepository courseRepository,
                                 CategoryRepository categoryRepository) {
                courseRepository.deleteAll();

                List<Category> categories = categoryRepository.findAll();
                List<Course> courses = new ArrayList<>();
                // Enum values for Language
                Language[] languages = Language.values();

                for (int i = 0; i < 10; i++) {
                        Category randomCategory = categories.get(faker.number().numberBetween(0, categories.size()));

                        // Randomly select a language for the course
                        Language randomLanguage = languages[faker.number().numberBetween(0, languages.length)];

                        // Randomly select a few languages for the subtitles (let's say 1-3 languages)
                        int numSubtitles = faker.number().numberBetween(1, 4); // 1 to 3 subtitle languages
                        List<Language> subtitleLanguages = new ArrayList<>();
                        for (int j = 0; j < numSubtitles; j++) {
                                // Ensure the language is not already in the list
                                Language randomSubtitleLanguage;
                                do {
                                        randomSubtitleLanguage = languages[faker.number().numberBetween(0, languages.length)];
                                } while (subtitleLanguages.contains(randomSubtitleLanguage));  // Avoid duplicates

                                subtitleLanguages.add(randomSubtitleLanguage);
                        }
                        long minPrice = 400_000;
                        long maxPrice = 2_000_000;
                        long randomPrice = ThreadLocalRandom.current().nextLong(minPrice, maxPrice + 1);
                        BigDecimal price = BigDecimal.valueOf(randomPrice);

                        courses.add(Course.builder()
                                .id(UUID.randomUUID())
                                        .title(faker.book().title())
                                        .thumbnail(File.builder()
                                                .url(faker.internet().url())
                                                .name(faker.file().fileName())
                                                .type(FileType.IMAGE)
                                                .size(0)
                                                .build())
                                        .featuredImage(File.builder()
                                                .url(faker.internet().url())
                                                .name(faker.file().fileName())
                                                .type(FileType.IMAGE)
                                                .size(0)
                                                .build())
                                .schoolId(UUID.randomUUID())
                                .categoryId(randomCategory.getId())
                                .language(randomLanguage) // Set the random language for the course
                                .subtitles(subtitleLanguages) // Set the list of random languages for subtitles
                                .price(price)
                                .createdAt(new Date())
                                .updatedAt(new Date())
                                .tags(faker.lorem().words(3))
                                .requirements(Arrays.asList(faker.educator().course()))
                                .learningObjectives(Arrays.asList(faker.educator().course(),
                                        faker.educator().course()))
                                .instructors(Collections.singletonList(UUID.randomUUID()))
                                .build());
                }
                log.info("Courses seeding finished");
                courseRepository.saveAll(courses);
        }
        private void seedCoursesSyllabus(Faker faker, CourseRepository courseRepository, ModuleRepository moduleRepository) {
                List<Course> courses = courseRepository.findAll();

                for (Course course : courses) {
                        List<Module> modules = moduleRepository.findByCourseId(course.getId());
                        course.setSyllabus(modules);
                }
                log.info("Courses seeding finished");
                courseRepository.saveAll(courses);
        }

        private void seedSections(Faker faker, ModuleRepository moduleRepository,
                                  CourseRepository courseRepository) {
                moduleRepository.deleteAll();
                List<Course> courses = courseRepository.findAll();
                List<Module> syllabi = new ArrayList<>();
                Random random = new Random();

                for (Course course : courses) {
//                        List<Module> syllabi2save = new ArrayList<>();

                        for (int i = 0; i < 3; i++) {
                                // Generate random hours, minutes, and seconds
                                int hours = random.nextInt(60);  // 0 to 23 hours
                                int minutes = random.nextInt(60);  // 0 to 59 minutes
                                int seconds = random.nextInt(60);  // 0 to 59 seconds

                                // Format the duration as HH:mm:ss
                                String durationString = String.format("%02d:%02d:%02d", hours, minutes, seconds);

                                Duration duration = Duration.ofHours(0);
                                Module module = Module.builder()
                                        .id(UUID.randomUUID())
                                        .title(faker.book().title())
                                        .course(course)
                                        .thumbnailUrl(faker.internet().url())
                                        .duration(duration)  // Add the generated duration
                                        .build();

//                                syllabi2save.add(module);
                                syllabi.add(module);
                        }
//                        course.setSyllabus(syllabi2save);
                }

                log.info("Sections seeding finished");
                moduleRepository.saveAll(syllabi);
        }

        private void seedCertificates(Faker faker, CertificateRepository certificateRepository,
                        CourseRepository courseRepository) {
                certificateRepository.deleteAll();

                List<Course> courses = courseRepository.findAll();
                List<Certificate> certificates = new ArrayList<>();

                for (Course course : courses) {
                        certificates.add(Certificate.builder()
                                        .id(UUID.randomUUID())
                                        .course(course)
                                        .userId(UUID.randomUUID())
                                        .issueDate(LocalDateTime.now())
                                        .certificate(File.builder().url(faker.internet().url()).name("Certificate")
                                                        .build())
                                        .verificationCode(faker.code().isbn10())
                                        .build());
                }
                log.info("Certificates seeding finished");

                certificateRepository.saveAll(certificates);
        }

        private void seedReviews(Faker faker, ReviewRepository reviewRepository,
                        CourseRepository courseRepository) {
                reviewRepository.deleteAll();

                List<Course> courses = courseRepository.findAll();
                List<Review> reviews = new ArrayList<>();

                for (Course course : courses) {
                        for (int i = 0; i < 3; i++) {

                                reviews.add(Review.builder()
                                                .id(UUID.randomUUID())
                                                .course(course)
                                                .userId(UUID.randomUUID())
                                                .rating(faker.number().numberBetween(1, 5))
                                                .comment(faker.lorem().sentence())
                                                .createdAt(LocalDateTime.now())
                                                .isVerifiedPurchase(faker.bool().bool())
                                                .helpfulVotes(faker.number().numberBetween(1, 50))
                                                .build());
                        }
                }
                log.info("Reviews seeding finished");

                reviewRepository.saveAll(reviews);
        }

        private void seedAssignments(Faker faker, AssignmentRepository assignmentRepository,
                        ModuleRepository moduleRepository) {
                assignmentRepository.deleteAll();

                List<Module> syllabi = moduleRepository.findAll();
                List<Assignment> assignments = new ArrayList<>();

                for (Module module : syllabi) {
                        for (int i = 0; i < 1; i++) {

                                assignments.add(Assignment.builder()
                                                .id(UUID.randomUUID())
                                                .module(module)
                                                .title(faker.book().title())
                                                .description(faker.lorem().sentence())
                                                .dueDate(Instant.now().plus(7, ChronoUnit.DAYS))
                                                .maxScore(100)
                                                .assignmentFormat(AssignmentFormat.values()[faker.number()
                                                                .numberBetween(0,
                                                                                AssignmentFormat.values().length)])
                                                .attempts(faker.number().numberBetween(1, 5))
                                                .build());
                        }
                }
                log.info("Assignment seeding finished");

                assignmentRepository.saveAll(assignments);
        }

        private void seedLessons(Faker faker, TopicRepository topicRepository,
                        ModuleRepository moduleRepository) {
                topicRepository.deleteAll();

                List<Module> syllabi = moduleRepository.findAll();
                List<Topic> topics = new ArrayList<>();
                Random random = new Random();

                int c = 0;
                for (Module module : syllabi) {
                        if (c >= 500)
                                break;
                        for (int i = 0; i < 5; i++) {
                                // Generate random hours, minutes, and seconds
                                int hours = random.nextInt(3);  // 0 to 23 hours
                                int minutes = random.nextInt(60);  // 0 to 59 minutes
                                int seconds = random.nextInt(60);  // 0 to 59 seconds

                                // Format the duration as HH:mm:ss
                                String durationString = String.format("%02d:%02d:%02d", hours, minutes, seconds);
                                Duration duration = DurationUtils.string2Duration(durationString);
                                module.setDuration(module.getDuration().plus(duration));

                                topics.add(Topic.builder()
                                                .id(UUID.randomUUID())
                                                .title(faker.book().title())
                                                .videoUrl(faker.internet().url())
                                                .isPreview(faker.bool().bool())
                                                .duration(duration)
                                                .module(module)
                                                .build());
                        }
                        moduleRepository.save(module);
                        c++;
                }
                log.info("Lesson seeding finished");

                topicRepository.saveAll(topics);
        }

        private void seedQuizzes(Faker faker, QuizRepository quizRepository,
                        TopicRepository topicRepository) {
                quizRepository.deleteAll();

                List<Topic> topics = topicRepository.findAll();
                List<Quiz> quizzes = new ArrayList<>();

                for (Topic topic : topics) {
                        quizzes.add(Quiz.builder()
                                        .id(UUID.randomUUID())
                                        .topic(topic)
                                        .title(faker.book().title())
                                        .description(faker.lorem().sentence())
                                        .passingScore(faker.number().numberBetween(50, 100))
                                        .timeLimit(faker.number().numberBetween(10, 30))
                                        .build());
                }
                log.info("Qzuizez seeding finished");

                quizRepository.saveAll(quizzes);
        }

        private void seedQuizQuestions(Faker faker, QuizQuestionRepository quizQuestionRepository,
                        QuizRepository quizRepository) {
                quizQuestionRepository.deleteAll();

                List<Quiz> quizzes = quizRepository.findAll();
                List<QuizQuestion> questions = new ArrayList<>();

                for (Quiz quiz : quizzes) {
                        questions.add(QuizQuestion.builder()
                                        .id(UUID.randomUUID())
                                        .quizId(quiz.getId())
                                        .questionText(faker.lorem().sentence())
                                        .type(QuestionType.MULTIPLE_CHOICE)
                                        .correctAnswer(faker.lorem().word())
                                        .options(Arrays.asList(faker.lorem().word(), faker.lorem().word(),
                                                        faker.lorem().word(), faker.lorem().word()))
                                        .points(faker.number().numberBetween(1, 10))
                                        .explanation(faker.lorem().paragraph())
                                        .build());
                }
                log.info("Quizez seeding finished");

                quizQuestionRepository.saveAll(questions);
        }

        private void seedResources(Faker faker, TopicRepository topicRepository,
                        ResourceRepository resourceRepository) {
                resourceRepository.deleteAll();

                List<Topic> topics = topicRepository.findAll();
                List<Resource> resources = new ArrayList<>();

                for (Topic topic : topics) {
                        resources.add(Resource.builder()
                                        .id(UUID.randomUUID())
                                        .topic(topic)
                                        .title(faker.book().title())
                                        .description(faker.lorem().sentence())
                                        .type(ResourceType.PDF)
                                        .url(faker.internet().url())
                                        .fileSize((long) faker.number().numberBetween(500, 2000))
                                        .durationSeconds(faker.number().numberBetween(60, 600))
                                        .build());
                }
                log.info("Resources seeding finished");

                resourceRepository.saveAll(resources);
        }

        private void seedCourseProgress(Faker faker, CourseRepository courseRepository,
                                        TopicRepository topicRepository, CourseProgressRepository courseProgressRepository) {
                courseProgressRepository.deleteAll();

                List<Course> courses = courseRepository.findAll();
                Set<Topic> topics = topicRepository.findAll().stream().collect(Collectors.toSet());
                List<CourseProgress> progressList = new ArrayList<>();

                for (Course course : courses) {
                        for (Topic topic : topics) {
                                progressList.add(CourseProgress.builder()
                                                .id(UUID.randomUUID())
                                                .course(course)
                                                .completedTopics(topics)
                                                .userId(UUID.randomUUID())
                                                .overallProgress((float) faker.number().randomDouble(1, 0, 100))
                                                .lastAccessDate(LocalDateTime.now().minus(
                                                                faker.number().numberBetween(1, 30),
                                                                ChronoUnit.DAYS))
                                                .lastAccessedTopic(topic)
                                                .build());
                        }
                }
                log.info("Course progress seeding finished");

                courseProgressRepository.saveAll(progressList);
        }
}
