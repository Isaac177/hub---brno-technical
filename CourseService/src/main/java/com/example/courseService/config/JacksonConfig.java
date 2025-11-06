package com.example.courseService.config;

import com.example.courseService.dto.response.CourseDTO;
import com.example.courseService.dto.response.ModuleDTO;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Sort;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;

@Configuration
@Order(Ordered.HIGHEST_PRECEDENCE)
public class JacksonConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();

        objectMapper.registerModule(new JavaTimeModule());

        objectMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        objectMapper.configure(SerializationFeature.WRITE_DATES_WITH_ZONE_ID, false);

        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        objectMapper.configure(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY, true);
        objectMapper.configure(DeserializationFeature.UNWRAP_ROOT_VALUE, false);

        SimpleModule module = new SimpleModule();

        module.addSerializer(PageImpl.class, new JsonSerializer<PageImpl>() {
            @Override
            public void serialize(PageImpl page, JsonGenerator gen, SerializerProvider provider) throws IOException {
                gen.writeStartObject();
                gen.writeNumberField("totalElements", page.getTotalElements());
                gen.writeNumberField("totalPages", page.getTotalPages());
                gen.writeNumberField("number", page.getNumber());
                gen.writeNumberField("size", page.getSize());
                gen.writeBooleanField("first", page.isFirst());
                gen.writeBooleanField("last", page.isLast());
                gen.writeFieldName("content");
                provider.defaultSerializeValue(page.getContent(), gen);
                gen.writeEndObject();
            }
        });

        module.addSerializer(BigDecimal.class, new JsonSerializer<BigDecimal>() {
            @Override
            public void serialize(BigDecimal value, JsonGenerator gen, SerializerProvider provider) throws IOException {
                gen.writeNumber(value);
            }
        });

        module.addSerializer(CourseDTO.class, new JsonSerializer<CourseDTO>() {
            @Override
            public void serialize(CourseDTO course, JsonGenerator gen, SerializerProvider provider) throws IOException {
                gen.writeStartObject();

                if (course.getId() != null) gen.writeStringField("id", course.getId().toString());
                if (course.getSchoolId() != null) gen.writeStringField("schoolId", course.getSchoolId().toString());
                if (course.getCategoryId() != null) gen.writeStringField("categoryId", course.getCategoryId().toString());

                if (course.getTitle() != null) gen.writeStringField("title", course.getTitle());
                if (course.getDescription() != null) gen.writeStringField("description", course.getDescription());
                if (course.getLongDescription() != null) gen.writeStringField("longDescription", course.getLongDescription());
                if (course.getLanguage() != null) gen.writeStringField("language", course.getLanguage());

                if (course.getThumbnailUrl() != null) gen.writeStringField("thumbnailUrl", course.getThumbnailUrl());
                if (course.getFeaturedImageUrl() != null) gen.writeStringField("featuredImageUrl", course.getFeaturedImageUrl());

                if (course.getPrice() != null) gen.writeNumberField("price", course.getPrice());
                if (course.getInstructorsCount() != null) gen.writeNumberField("instructorsCount", course.getInstructorsCount());

                if (course.getTags() != null) {
                    gen.writeFieldName("tags");
                    provider.defaultSerializeValue(course.getTags(), gen);
                }

                if (course.getRequirements() != null) {
                    gen.writeFieldName("requirements");
                    provider.defaultSerializeValue(course.getRequirements(), gen);
                }

                if (course.getLearningObjectives() != null) {
                    gen.writeFieldName("learningObjectives");
                    provider.defaultSerializeValue(course.getLearningObjectives(), gen);
                }

                if (course.getSubtitles() != null) {
                    gen.writeFieldName("subtitles");
                    provider.defaultSerializeValue(course.getSubtitles(), gen);
                }

                if (course.getSyllabus() != null) {
                    gen.writeFieldName("syllabus");
                    provider.defaultSerializeValue(course.getSyllabus(), gen);
                }

                if (course.getQuizzes() != null) {
                    gen.writeFieldName("quizzes");
                    provider.defaultSerializeValue(course.getQuizzes(), gen);
                }

                gen.writeEndObject();
            }
        });

        objectMapper.registerModule(module);

        return objectMapper;
    }
}

