package com.example.courseService.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import com.example.courseService.model.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Repository
public interface CourseRepository extends MongoRepository<Course, UUID>, CourseRepositoryCustom {

    // Fetch courses with at least one common tag
    @Query("{ 'tags': { $in: ?0 } }")
    Page<Course> findCoursesByTags(Set<String> tags, Pageable pageable);

    @Query(value = "{}", sort = "{ 'createdAt': -1 }")
    Page<Course> findAllSortedByCreatedAtDesc(Pageable pageable);

    Page<Course> findAll(Pageable pageable); // Method to retrieve paginated results

    Page<Course> findAllByOrderByPriceAsc(Pageable pageable);

    @Query(value = "{ 'instructors': ?0 }", count = true)
    long countCoursesByInstructorId(UUID instructorId);

    @Query("{ 'instructors': ?0 }")
    List<Course> findCoursesByInstructorId(UUID instructorId);

    @Query("{ 'schoolId': { $in: ?0 } }")
    List<Course> findBySchoolIdIn(List<UUID> schoolIds);

    List<Course> findAllBySchoolId(UUID schoolId);

    boolean existsBySchoolId(UUID schoolId);

    // Find all courses with price for average calculation
    @Query(value = "{ 'price': { $ne: null } }", fields = "{ 'price': 1 }")
    List<Course> findAllWithPrice();

    // Count recent courses (last 30 days) - will be called with date parameter from service
    @Query(value = "{ 'createdAt': { $gte: ?0 } }", count = true)
    long countRecentCourses(Date since);

    // Count recent courses without parameter (for backward compatibility)
    default long countRecentCourses() {
        Date thirtyDaysAgo = new Date(System.currentTimeMillis() - (30L * 24 * 60 * 60 * 1000));
        return countRecentCourses(thirtyDaysAgo);
    }

    // Method to get average price (will be implemented in service layer using findAllWithPrice)
    default double getAverageCoursePrice() {
        List<Course> coursesWithPrice = findAllWithPrice();
        if (coursesWithPrice.isEmpty()) {
            return 0.0;
        }
        return coursesWithPrice.stream()
                .filter(course -> course.getPrice() != null)
                .mapToDouble(course -> course.getPrice().doubleValue())
                .average()
                .orElse(0.0);
    }
}
