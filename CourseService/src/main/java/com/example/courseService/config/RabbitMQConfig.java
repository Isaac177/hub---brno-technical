package com.example.courseService.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Qualifier;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Configuration
public class RabbitMQConfig {

    public static final String INSTRUCTOR_DETAILS_QUEUE = "instructorDetailsQueue";
    public static final String INSTRUCTOR_COUNT_QUEUE = "instructorCountQueue";
    public static final String COURSE_CREATED_QUEUE = "courseCreatedQueue";
    public static final String COURSE_ENROLLMENT_QUEUE = "courseEnrollmentQueue";
    public static final String QUIZ_SUBMISSION_QUEUE = "quizSubmissionQueue";
    public static final String QUIZ_RESULT_QUEUE = "quizResultQueue";
    public static final String QUIZ_COMPLETION_QUEUE = "quiz_completion_queue";
    public static final String SCHOOL_DELETED_QUEUE = "school_deleted_queue";
    public static final String SCHOOL_DELETION_RESPONSE_QUEUE = "school_deletion_response_queue";
    public static final String SCHOOL_DATA_REQUEST_QUEUE = "school_data_request_queue";
    public static final String USER_DATA_REQUEST_QUEUE = "user_data_request_queue_course";
    public static final String STUDY_STATISTICS_REQUEST_QUEUE = "study_statistics_request_queue";
    public static final String STUDY_STATISTICS_RESPONSE_QUEUE = "study_statistics_response_queue";

    public static final String QUIZ_COMPLETION_DLX = "quiz_completion_dlx";
    public static final String QUIZ_COMPLETION_DLQ = "quiz_completion_dlq";

    public static final String EXCHANGE_NAME = "courseTopicExchange";
    public static final String QUIZ_EVENTS_EXCHANGE = "quiz_events";
    public static final String SCHOOL_EVENTS_EXCHANGE = "school_events";
    public static final String USER_EVENTS_EXCHANGE = "user_events";

    @Bean
    public Queue instructorCountQueue() {
        return new Queue(INSTRUCTOR_COUNT_QUEUE, true);
    }

    @Bean
    public Queue instructorDetailsQueue() {
        return new Queue(INSTRUCTOR_DETAILS_QUEUE, true);
    }

    @Bean
    public Queue courseCreatedQueue() {
        return new Queue(COURSE_CREATED_QUEUE, true);
    }

    @Bean
    public Queue courseEnrollmentQueue() {
        return new Queue(COURSE_ENROLLMENT_QUEUE, true);
    }

    @Bean
    public Queue quizSubmissionQueue() {
        return new Queue(QUIZ_SUBMISSION_QUEUE, true);
    }

    @Bean
    public Queue quizResultQueue() {
        return new Queue(QUIZ_RESULT_QUEUE, true);
    }

    @Bean
    public Queue quizCompletionQueue() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-dead-letter-exchange", QUIZ_COMPLETION_DLX);
        return new Queue(QUIZ_COMPLETION_QUEUE, true, false, false, args);
    }

    @Bean
    public Queue schoolDeletedQueue() {
        return new Queue(SCHOOL_DELETED_QUEUE, true);
    }

    @Bean
    public Queue schoolDeletionResponseQueue() {
        return new Queue(SCHOOL_DELETION_RESPONSE_QUEUE, true);
    }

    @Bean
    public Queue schoolDataRequestQueue() {
        return new Queue(SCHOOL_DATA_REQUEST_QUEUE, true);
    }

    @Bean
    public Queue userDataRequestQueue() {
        return new Queue(USER_DATA_REQUEST_QUEUE, true);
    }

    @Bean
    public Queue studyStatisticsRequestQueue() {
        return new Queue(STUDY_STATISTICS_REQUEST_QUEUE, true);
    }

    @Bean
    public Queue studyStatisticsResponseQueue() {
        return new Queue(STUDY_STATISTICS_RESPONSE_QUEUE, true);
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
                .to(deadLetterExchange())
                .with(QUIZ_COMPLETION_DLQ);
    }

    @Bean
    public TopicExchange topicExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public TopicExchange quizEventsExchange() {
        return new TopicExchange(QUIZ_EVENTS_EXCHANGE);
    }

    @Bean
    public TopicExchange schoolEventsExchange() {
        return new TopicExchange(SCHOOL_EVENTS_EXCHANGE);
    }

    @Bean
    public TopicExchange userEventsExchange() {
        return new TopicExchange(USER_EVENTS_EXCHANGE);
    }

    @Bean
    public Binding instructorCountBinding(Queue instructorCountQueue, TopicExchange topicExchange) {
        return BindingBuilder.bind(instructorCountQueue).to(topicExchange).with("request.instructorCount");
    }

    @Bean
    public Binding instructorDetailsBinding(Queue instructorDetailsQueue, TopicExchange topicExchange) {
        return BindingBuilder.bind(instructorDetailsQueue).to(topicExchange).with("request.instructorDetails");
    }

    @Bean
    public Binding courseCreatedBinding(Queue courseCreatedQueue, TopicExchange topicExchange) {
        return BindingBuilder.bind(courseCreatedQueue).to(topicExchange).with("event.courseCreated");
    }

    @Bean
    public Binding courseEnrollmentBinding(Queue courseEnrollmentQueue, TopicExchange topicExchange) {
        return BindingBuilder.bind(courseEnrollmentQueue).to(topicExchange).with("event.courseEnrollment");
    }

    @Bean
    public Binding quizSubmissionBinding(Queue quizSubmissionQueue, TopicExchange topicExchange) {
        return BindingBuilder.bind(quizSubmissionQueue).to(topicExchange).with("event.quizSubmission");
    }

    @Bean
    public Binding quizResultBinding(Queue quizResultQueue, TopicExchange topicExchange) {
        return BindingBuilder.bind(quizResultQueue).to(topicExchange).with("event.quizResult");
    }

    @Bean
    public Binding quizCompletionBinding(Queue quizCompletionQueue,
            @Qualifier("quizEventsExchange") TopicExchange quizEventsExchange) {
        return BindingBuilder.bind(quizCompletionQueue)
                .to(quizEventsExchange)
                .with("quiz.completion.user");
    }

    @Bean
    public Binding schoolDeletionBinding(Queue schoolDeletedQueue, TopicExchange schoolEventsExchange) {
        return BindingBuilder
                .bind(schoolDeletedQueue)
                .to(schoolEventsExchange)
                .with("school.deleted");
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
    public Binding schoolDataRequestBinding(Queue schoolDataRequestQueue, TopicExchange schoolEventsExchange) {
        return BindingBuilder
                .bind(schoolDataRequestQueue)
                .to(schoolEventsExchange)
                .with("school.data.request");
    }

    @Bean
    public Binding userDataRequestBinding(Queue userDataRequestQueue, TopicExchange userEventsExchange) {
        return BindingBuilder
                .bind(userDataRequestQueue)
                .to(userEventsExchange)
                .with("user.data.request");
    }

    @Bean
    public Binding studyStatisticsRequestBinding(Queue studyStatisticsRequestQueue, TopicExchange userEventsExchange) {
        return BindingBuilder
                .bind(studyStatisticsRequestQueue)
                .to(userEventsExchange)
                .with("study.statistics.request");
    }

    @Bean
    public Binding studyStatisticsResponseBinding(Queue studyStatisticsResponseQueue, TopicExchange userEventsExchange) {
        return BindingBuilder
                .bind(studyStatisticsResponseQueue)
                .to(userEventsExchange)
                .with("study.statistics.response.*");
    }

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }

    @Bean
    public Jackson2JsonMessageConverter jsonMessageConverter(ObjectMapper objectMapper) {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter(objectMapper);
        converter.setCreateMessageIds(true);
        return converter;
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            Jackson2JsonMessageConverter jsonMessageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jsonMessageConverter);
        return factory;
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
            Jackson2JsonMessageConverter jsonMessageConverter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter);
        return rabbitTemplate;
    }
}