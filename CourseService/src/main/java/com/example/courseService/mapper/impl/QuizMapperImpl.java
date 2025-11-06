package com.example.courseService.mapper.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.UUID;

import com.example.courseService.mapper.QuizMapper;
import org.springframework.stereotype.Component;
import com.example.courseService.dto.request.QuizRequest;
import com.example.courseService.dto.response.QuizDTO;
import com.example.courseService.model.Topic;
import com.example.courseService.model.Quiz;
import com.example.courseService.repository.TopicRepository;
import com.example.courseService.exception.implementation.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class QuizMapperImpl implements QuizMapper {
    private final TopicRepository topicRepository;

    @Override
    public Quiz toEntity(QuizRequest request) {
        Topic topic = topicRepository.findById(request.getTopicId()).orElseThrow(
                () -> new ResourceNotFoundException("Topic with Id: " + request.getTopicId() + " not found"));
                
        return Quiz.builder()
                .id(UUID.randomUUID())
                .courseId(request.getCourseId())
                .topic(topic)
                .title(request.getTitle())
                .description(request.getDescription())
                .difficultyLevel(request.getDifficultyLevel())
                .timeLimit(request.getTimeLimit())
                .passingScore(request.getPassingScore())
                .totalPoints(request.getTotalPoints())
                .helpGuidelines(request.getHelpGuidelines())
                .visibility(request.getVisibility())
                .isDraft(request.getIsDraft())
                .isPublished(false)
                .questions(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .lastModifiedAt(LocalDateTime.now())
                .build();
    }

    @Override
    public Quiz updateEntityFromRequest(Quiz existingQuiz, QuizRequest request) {
        Topic topic = topicRepository.findById(request.getTopicId()).orElseThrow(
                () -> new ResourceNotFoundException("Topic with Id: " + request.getTopicId() + " not found"));

        // Do not update courseId - it should be preserved
        existingQuiz.setTopic(topic);
        existingQuiz.setTitle(request.getTitle());
        existingQuiz.setDescription(request.getDescription());
        existingQuiz.setDifficultyLevel(request.getDifficultyLevel());
        existingQuiz.setTimeLimit(request.getTimeLimit());
        existingQuiz.setPassingScore(request.getPassingScore());
        existingQuiz.setTotalPoints(request.getTotalPoints());
        existingQuiz.setHelpGuidelines(request.getHelpGuidelines());
        existingQuiz.setVisibility(request.getVisibility());
        existingQuiz.setIsDraft(request.getIsDraft());
        existingQuiz.setLastModifiedAt(LocalDateTime.now());
        
        return existingQuiz;
    }

    @Override
    public QuizDTO toDTO(Quiz quiz) {
        return QuizDTO.builder()
                .id(quiz.getId())
                .courseId(quiz.getCourseId())
                .topicId(quiz.getTopic().getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .difficultyLevel(quiz.getDifficultyLevel())
                .timeLimit(quiz.getTimeLimit())
                .passingScore(quiz.getPassingScore())
                .totalPoints(quiz.getTotalPoints())
                .questions(quiz.getQuestions())
                .helpGuidelines(quiz.getHelpGuidelines())
                .visibility(quiz.getVisibility())
                .isDraft(quiz.getIsDraft())
                .isPublished(quiz.getIsPublished())
                .createdAt(quiz.getCreatedAt())
                .publishedAt(quiz.getPublishedAt())
                .lastModifiedAt(quiz.getLastModifiedAt())
                .build();
    }
}
