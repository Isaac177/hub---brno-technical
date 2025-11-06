package com.example.courseService.repository.impl;

import com.example.courseService.repository.CourseRepositoryCustom;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.aggregation.GroupOperation;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.ArrayList;

@Repository
public class CourseRepositoryImpl implements CourseRepositoryCustom {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public List<Object[]> countCoursesBySchool() {
        GroupOperation groupBySchool = Aggregation.group("schoolId").count().as("count");
        Aggregation aggregation = Aggregation.newAggregation(groupBySchool);
        
        AggregationResults<SchoolCountResult> results = mongoTemplate.aggregate(
            aggregation, "courses", SchoolCountResult.class);
        
        List<Object[]> resultList = new ArrayList<>();
        for (SchoolCountResult result : results.getMappedResults()) {
            resultList.add(new Object[]{result.getId(), result.getCount()});
        }
        return resultList;
    }

    @Override
    public List<Object[]> countCoursesByLanguage() {
        GroupOperation groupByLanguage = Aggregation.group("language").count().as("count");
        Aggregation aggregation = Aggregation.newAggregation(groupByLanguage);
        
        AggregationResults<LanguageCountResult> results = mongoTemplate.aggregate(
            aggregation, "courses", LanguageCountResult.class);
        
        List<Object[]> resultList = new ArrayList<>();
        for (LanguageCountResult result : results.getMappedResults()) {
            resultList.add(new Object[]{result.getId(), result.getCount()});
        }
        return resultList;
    }

    // Inner classes for aggregation results
    public static class SchoolCountResult {
        private String id;
        private long count;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    public static class LanguageCountResult {
        private String id;
        private long count;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }
}