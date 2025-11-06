// package com.example.courseService.repository.elasticsearch;

// import java.util.List;
// import java.util.UUID;

// import org.springframework.data.elasticsearch.annotations.Query;
// import
// org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
// import org.springframework.stereotype.Repository;

// import com.example.courseService.model.Course;

// @Repository
// public interface CourseSearchRepository extends
// ElasticsearchRepository<Course, UUID> {

// // Поиск по заголовку внутри вложенных переводов
// @Query("{\"bool\": {\"should\": [" +
// "{\"nested\": {\"path\": \"translations\", \"query\": {\"match\":
// {\"translations.title\": {\"query\": \"?0\", \"fuzziness\": \"AUTO\"}}}}},"
// +
// "{\"nested\": {\"path\": \"translations\", \"query\": {\"match\":
// {\"translations.description\": {\"query\": \"?0\", \"fuzziness\":
// \"AUTO\"}}}}},"
// +
// "{\"nested\": {\"path\": \"translations\", \"query\": {\"match\":
// {\"translations.shortDescription\": {\"query\": \"?0\", \"fuzziness\":
// \"AUTO\"}}}}}"
// +
// "]}}")
// List<Course> findByFuzzySearch(String searchText);

// }
