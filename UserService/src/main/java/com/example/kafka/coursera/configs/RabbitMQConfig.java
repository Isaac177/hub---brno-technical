package com.example.kafka.coursera.configs;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.amqp.support.converter.DefaultClassMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class RabbitMQConfig {

    public static final String INSTRUCTOR_DETAILS_QUEUE = "instructorDetailsQueue";
    public static final String INSTRUCTOR_COUNT_QUEUE = "instructorCountQueue";
    public static final String COURSE_CREATED_QUEUE = "courseCreatedQueue";
    public static final String COURSE_ENROLLMENT_QUEUE = "courseEnrollmentQueue";
    public static final String QUIZ_COMPLETION_QUEUE = "quiz_completion_queue";
    public static final String EXCHANGE_NAME = "courseTopicExchange";
    public static final String QUIZ_EXCHANGE_NAME = "quiz_events";
    public static final String QUIZ_COMPLETION_DLX = "quiz_completion_dlx";
    public static final String QUIZ_COMPLETION_DLQ = "quiz_completion_dlq";
    public static final String QUIZ_EVENTS_EXCHANGE = "quiz_events";
    public static final String USER_ACHIEVEMENTS_QUEUE = "user_achievements";
    public static final String USER_EVENTS_EXCHANGE = "user_events";
    public static final String SCHOOL_DELETED_QUEUE = "school_deleted_queue";
    public static final String SCHOOL_EVENTS_EXCHANGE = "school_events";
    public static final String SCHOOL_DELETION_RESPONSE_QUEUE = "school_deletion_response_queue";
    public static final String SCHOOL_DATA_REQUEST_QUEUE = "school_data_request_queue";
    public static final String SCHOOL_DATA_RESPONSE_QUEUE = "school_data_response_queue";
    public static final String STUDENT_DATA_REQUEST_QUEUE = "student_data_request_queue";
    public static final String STUDENT_DATA_RESPONSE_QUEUE = "student_data_response_queue";
    public static final String STUDENT_EVENTS_EXCHANGE = "student_events";
    public static final String USER_DATA_REQUEST_QUEUE = "user_data_request_queue";
    public static final String USER_DATA_RESPONSE_QUEUE = "user_data_response_queue";
    public static final String STUDY_STATISTICS_REQUEST_QUEUE = "study_statistics_request_queue";
    public static final String STUDY_STATISTICS_RESPONSE_QUEUE = "study_statistics_response_queue";

    @Bean
    public Queue quizCompletionQueue() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-dead-letter-exchange", QUIZ_COMPLETION_DLX);
        return new Queue(QUIZ_COMPLETION_QUEUE, true, false, false, args);
    }

    @Bean
    public TopicExchange quizExchange() {
        return new TopicExchange(QUIZ_EXCHANGE_NAME);
    }

    @Bean
    public Binding quizCompletionBinding(Queue quizCompletionQueue, TopicExchange quizExchange) {
        return BindingBuilder
                .bind(quizCompletionQueue)
                .to(quizExchange)
                .with("quiz.completion.user");
    }

    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(QUIZ_COMPLETION_DLX);
    }

    @Bean
    public Queue deadLetterQueue() {
        return new Queue(QUIZ_COMPLETION_DLQ);
    }

    @Bean
    public Binding deadLetterBinding() {
        return BindingBuilder
                .bind(deadLetterQueue())
                .to((DirectExchange) deadLetterExchange())
                .with(QUIZ_COMPLETION_DLQ);
    }

    @Bean
    public Queue userAchievementsQueue() {
        return new Queue(USER_ACHIEVEMENTS_QUEUE, true);
    }

    @Bean
    public TopicExchange userEventsExchange() {
        return new TopicExchange(USER_EVENTS_EXCHANGE);
    }

    @Bean
    public Binding userAchievementsBinding(Queue userAchievementsQueue, TopicExchange userEventsExchange) {
        return BindingBuilder
                .bind(userAchievementsQueue)
                .to(userEventsExchange)
                .with("user.achievements");
    }

    @Bean
    public Queue schoolDeletedQueue() {
        return new Queue(SCHOOL_DELETED_QUEUE, true);
    }

    @Bean
    public TopicExchange schoolEventsExchange() {
        return new TopicExchange(SCHOOL_EVENTS_EXCHANGE);
    }

    @Bean
    public Binding schoolDeletedBinding(Queue schoolDeletedQueue, TopicExchange schoolEventsExchange) {
        return BindingBuilder
                .bind(schoolDeletedQueue)
                .to(schoolEventsExchange)
                .with("school.deleted");
    }

    @Bean
    public Queue schoolDeletionResponseQueue() {
        return new Queue(SCHOOL_DELETION_RESPONSE_QUEUE, true);
    }

    @Bean
    public Binding schoolDeletionResponseBinding(Queue schoolDeletionResponseQueue,
            TopicExchange schoolEventsExchange) {
        return BindingBuilder
                .bind(schoolDeletionResponseQueue)
                .to(schoolEventsExchange)
                .with("school.deletion.*");
    }

    @Bean
    public Queue schoolDataRequestQueue() {
        return new Queue(SCHOOL_DATA_REQUEST_QUEUE, true);
    }

    @Bean
    public Binding schoolDataRequestBinding(Queue schoolDataRequestQueue, TopicExchange schoolEventsExchange) {
        return BindingBuilder
                .bind(schoolDataRequestQueue)
                .to(schoolEventsExchange)
                .with("school.data.request");
    }

    @Bean
    public Queue schoolDataResponseQueue() {
        return new Queue(SCHOOL_DATA_RESPONSE_QUEUE, true);
    }

    @Bean
    public Binding schoolDataResponseBinding(Queue schoolDataResponseQueue, TopicExchange schoolEventsExchange) {
        return BindingBuilder
                .bind(schoolDataResponseQueue)
                .to(schoolEventsExchange)
                .with("school.data.response.*");
    }

    @Bean
    public TopicExchange studentEventsExchange() {
        return new TopicExchange(STUDENT_EVENTS_EXCHANGE);
    }

    @Bean
    public Queue studentDataRequestQueue() {
        return new Queue(STUDENT_DATA_REQUEST_QUEUE, true);
    }

    @Bean
    public Binding studentDataRequestBinding(Queue studentDataRequestQueue, TopicExchange studentEventsExchange) {
        return BindingBuilder
                .bind(studentDataRequestQueue)
                .to(studentEventsExchange)
                .with("student.data.request");
    }

    @Bean
    public Queue studentDataResponseQueue() {
        return new Queue(STUDENT_DATA_RESPONSE_QUEUE, true);
    }

    @Bean
    public Binding studentDataResponseBinding(Queue studentDataResponseQueue, TopicExchange studentEventsExchange) {
        return BindingBuilder
                .bind(studentDataResponseQueue)
                .to(studentEventsExchange)
                .with("student.data.response.*");
    }

    @Bean
    public Queue userDataRequestQueue() {
        return new Queue(USER_DATA_REQUEST_QUEUE, true);
    }

    @Bean
    public Binding userDataRequestBinding(Queue userDataRequestQueue, TopicExchange userEventsExchange) {
        return BindingBuilder
                .bind(userDataRequestQueue)
                .to(userEventsExchange)
                .with("user.data.request");
    }

    @Bean
    public Queue userDataResponseQueue() {
        return new Queue(USER_DATA_RESPONSE_QUEUE, true);
    }

    @Bean
    public Binding userDataResponseBinding(Queue userDataResponseQueue, TopicExchange userEventsExchange) {
        return BindingBuilder
                .bind(userDataResponseQueue)
                .to(userEventsExchange)
                .with("user.data.response.*");
    }

    @Bean
    public Queue studyStatisticsRequestQueue() {
        return new Queue(STUDY_STATISTICS_REQUEST_QUEUE, true);
    }

    @Bean
    public Binding studyStatisticsRequestBinding(Queue studyStatisticsRequestQueue, TopicExchange userEventsExchange) {
        return BindingBuilder
                .bind(studyStatisticsRequestQueue)
                .to(userEventsExchange)
                .with("study.statistics.request");
    }

    @Bean
    public Queue studyStatisticsResponseQueue() {
        return new Queue(STUDY_STATISTICS_RESPONSE_QUEUE, true);
    }

    @Bean
    public Binding studyStatisticsResponseBinding(Queue studyStatisticsResponseQueue, TopicExchange userEventsExchange) {
        return BindingBuilder
                .bind(studyStatisticsResponseQueue)
                .to(userEventsExchange)
                .with("study.statistics.response.*");
    }

    @Bean
    public Queue instructorDetailsQueue() {
        return new Queue(INSTRUCTOR_DETAILS_QUEUE, true);
    }

    @Bean
    public Binding instructorDetailsBinding(Queue instructorDetailsQueue, TopicExchange userEventsExchange) {
        return BindingBuilder
                .bind(instructorDetailsQueue)
                .to(userEventsExchange)
                .with("instructor.details");
    }

    @Bean
    public Queue courseCreatedQueue() {
        return new Queue(COURSE_CREATED_QUEUE, true);
    }

    @Bean
    public TopicExchange courseExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Binding courseCreatedBinding(Queue courseCreatedQueue, TopicExchange courseExchange) {
        return BindingBuilder
                .bind(courseCreatedQueue)
                .to(courseExchange)
                .with("course.created");
    }

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.enable(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY);
        mapper.enable(DeserializationFeature.UNWRAP_SINGLE_VALUE_ARRAYS);
        mapper.enable(DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT);
        mapper.enable(DeserializationFeature.READ_UNKNOWN_ENUM_VALUES_AS_NULL);
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

        SimpleModule module = new SimpleModule();
        mapper.registerModule(module);

        return mapper;
    }

    @Bean
    public MessageConverter messageConverter(ObjectMapper objectMapper) {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter(objectMapper);
        DefaultClassMapper classMapper = new DefaultClassMapper();
        classMapper.setTrustedPackages("*");
        converter.setClassMapper(classMapper);
        return converter;
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter messageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter);
        return template;
    }
}