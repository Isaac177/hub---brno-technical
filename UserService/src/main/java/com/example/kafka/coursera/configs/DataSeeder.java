// package com.example.kafka.coursera.configs;

// import org.springframework.boot.CommandLineRunner;
// import org.springframework.stereotype.Component;

// import com.example.kafka.coursera.db.entities.Category;
// import com.example.kafka.coursera.db.entities.Comment;
// import com.example.kafka.coursera.db.entities.Language;
// import com.example.kafka.coursera.db.entities.Like;
// import com.example.kafka.coursera.db.entities.Post;
// import com.example.kafka.coursera.db.entities.School;
// import com.example.kafka.coursera.db.entities.SchoolVerification;
// import com.example.kafka.coursera.db.entities.Student;
// import com.example.kafka.coursera.db.entities.User;
// import com.example.kafka.coursera.db.enums.DocumentType;
// import com.example.kafka.coursera.db.enums.LanguageEnum;
// import com.example.kafka.coursera.db.enums.LanguageLevel;
// import com.example.kafka.coursera.db.enums.PostType;
// import com.example.kafka.coursera.db.enums.RoleEnum;
// import com.example.kafka.coursera.db.enums.SchoolStatusEnum;
// import com.example.kafka.coursera.db.enums.StatusEnum;
// import com.example.kafka.coursera.db.repositories.CategoryRepository;
// import com.example.kafka.coursera.db.repositories.CommentRepository;
// import com.example.kafka.coursera.db.repositories.LikeRepository;
// import com.example.kafka.coursera.db.repositories.PostRepository;
// import com.example.kafka.coursera.db.repositories.SchoolRepository;
// import
// com.example.kafka.coursera.db.repositories.SchoolVerificationRepository;
// import com.example.kafka.coursera.db.repositories.StudentRepository;
// import com.example.kafka.coursera.db.repositories.UserRepository;

// import com.github.javafaker.Faker;

// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;

// import java.time.Instant;
// import java.util.ArrayList;
// import java.util.List;
// import java.util.UUID;

// @Slf4j
// @Component
// @RequiredArgsConstructor
// public class DataSeeder implements CommandLineRunner {

// private final UserRepository userRepository;
// private final CategoryRepository categoryRepository;
// private final PostRepository postRepository;
// private final CommentRepository commentRepository;
// private final LikeRepository likeRepository;
// private final SchoolRepository schoolRepository;
// private final StudentRepository studentRepository;
// private final SchoolVerificationRepository schoolVerificationRepository;

// private final Faker faker = new Faker();

// @Override
// public void run(String... args) throws Exception {
// int count = 100;
// log.info("Started data seeding");

// // Seed users
// List<User> users = userRepository.findAll();
// for (int i = 0; i < count; i++) {
// User user = User.builder()
// .id(UUID.randomUUID())
// .email(faker.internet().emailAddress())
// .password(faker.internet().password())
// .role(RoleEnum.values()[faker.number().numberBetween(0,
// RoleEnum.values().length)])
// .status(StatusEnum.values()[faker.number().numberBetween(0,
// StatusEnum.values().length)])
// .build();
// users.add(userRepository.save(user));

// }
// log.info("Finished user seeding");

// // Seed categories
// List<Category> categories = categoryRepository.findAll();
// for (int i = 0; i < count; i++) {
// Category category = Category.builder()
// .id(UUID.randomUUID())

// .name(faker.lorem().word())
// .description(faker.lorem().sentence())
// .build();
// categories.add(categoryRepository.save(category));

// }
// log.info("Finished categories seeding");

// // Seed posts
// log.info("Started seeding posts, comment, likes");
// for (int i = 0; i < count; i++) {
// Post post = Post.builder()
// .id(UUID.randomUUID())
// .title(faker.lorem().sentence())
// .content(faker.lorem().paragraph())
// .author(users.get(i % users.size()))
// .category(categories.get(i % categories.size()))
// .type(PostType.values()[faker.number().numberBetween(0,
// PostType.values().length)])
// .build();
// post = postRepository.save(post);

// // Seed comments
// Comment comment = Comment.builder()
// .id(UUID.randomUUID())
// .content(faker.lorem().sentence())
// .post(post)
// .author(users.get((i + 1) % users.size()))
// .build();
// comment = commentRepository.save(comment);

// // Seed likes
// Like like = Like.builder()
// .id(UUID.randomUUID())

// .post(post)
// .author(users.get((i + 2) % users.size()))
// .build();
// likeRepository.save(like);

// }
// log.info("Finished post seeding");
// log.info("Finished comment seeding");
// log.info("Finished like seeding");

// // Seed schools
// for (int i = 0; i < count; i++) {
// School school = School.builder()
// .id(UUID.randomUUID())

// .email(faker.internet().emailAddress())
// .name(faker.company().name())
// .description(faker.lorem().sentence())
// .website(faker.internet().url())
// .foundedYear(faker.number().numberBetween(1900, 2022))
// .status(SchoolStatusEnum.values()[faker.number().numberBetween(0,
// SchoolStatusEnum.values().length)])
// .build();
// school = schoolRepository.save(school);

// // Seed students
// Student student = Student.builder()
// .id(UUID.randomUUID())

// .firstName(faker.name().firstName())
// .lastName(faker.name().lastName())
// .phoneNumber(faker.phoneNumber().phoneNumber())
// .address(faker.address().streetAddress())
// .city(faker.address().city())
// .country(faker.address().country())
// .user(users.get(i % users.size()))
// .languages(createLanguagesForStudent(i))
// .build();

// student = studentRepository.save(student);

// // Seed school verifications
// SchoolVerification verification = SchoolVerification.builder()
// .id(UUID.randomUUID())

// .school(school)
// .documentType(DocumentType.values()[faker.number().numberBetween(0,
// DocumentType.values().length)])
// .submittedAt(Instant.now())
// .build();
// schoolVerificationRepository.save(verification);

// }
// log.info("Finished school seeding");
// log.info("Finished verification seeding");
// log.info("Finished student seeding");
// log.info("Finished data seeding");
// }

// private List<Language> createLanguagesForStudent(int studentIndex) {
// // Create languages list
// List<Language> languages = new ArrayList<>();
// for (LanguageEnum languageEnum : LanguageEnum.values()) {
// Language language = Language.builder()

// .language(languageEnum.name())
// .level(LanguageLevel.values()[faker.number().numberBetween(0,
// LanguageLevel.values().length)]) // Set a default level or
// // adjust as necessary
// .build();
// languages.add(language);
// }
// return languages;
// }
// }