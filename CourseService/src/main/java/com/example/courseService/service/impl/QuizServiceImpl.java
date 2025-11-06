package com.example.courseService.service.impl;

import com.example.courseService.dto.request.QuizRequest;
import com.example.courseService.dto.request.QuizQuestionRequest;
import com.example.courseService.dto.response.QuizDTO;
import com.example.courseService.model.Quiz;
import com.example.courseService.model.QuizQuestion;
import com.example.courseService.repository.QuizRepository;
import com.example.courseService.repository.TopicRepository;
import com.example.courseService.repository.QuizQuestionRepository;
import com.example.courseService.service.QuizService;
import com.example.courseService.service.QuizQuestionService;
import com.example.courseService.mapper.QuizMapper;
import com.example.courseService.exception.implementation.BadRequestException;
import com.example.courseService.exception.implementation.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {
    private final QuizRepository quizRepository;
    private final QuizMapper mapper;
    private final TopicRepository topicRepository;
    private final QuizQuestionService quizQuestionService;
    private final QuizQuestionRepository quizQuestionRepository;
    private static final Logger log = LoggerFactory.getLogger(QuizServiceImpl.class);

    @Override
    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    @Override
    public Quiz getQuizById(UUID id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz with id " + id + " not found"));
    }

    @Override
    @Transactional
    public Quiz createQuiz(QuizRequest request) {
        log.info("Creating new quiz with request: {}", request);
        
        // Validate total points
        if (request.getQuestions() != null && !request.getQuestions().isEmpty()) {
            int totalPoints = request.getQuestions().stream()
                    .mapToInt(QuizQuestionRequest::getPoints)
                    .sum();
            
            if (totalPoints != request.getTotalPoints()) {
                throw new BadRequestException(
                    String.format("Sum of question points (%d) does not match quiz total points (%d)", 
                    totalPoints, request.getTotalPoints())
                );
            }
        }
        
        Quiz quiz = mapper.toEntity(request);
        Quiz savedQuiz = quizRepository.save(quiz);
        log.debug("Saved initial quiz: {}", savedQuiz);
        
        if (request.getQuestions() != null && !request.getQuestions().isEmpty()) {
            log.info("Processing {} questions for quiz", request.getQuestions().size());
            List<QuizQuestion> newQuestions = new ArrayList<>();
            for (QuizQuestionRequest questionRequest : request.getQuestions()) {
                questionRequest.setQuizId(savedQuiz.getId());
                try {
                    QuizQuestion savedQuestion = quizQuestionService.createQuizQuestion(questionRequest);
                    newQuestions.add(savedQuestion);
                    log.debug("Created question: {}", savedQuestion);
                } catch (Exception e) {
                    log.error("Error creating question: {}", e.getMessage());
                    throw e;
                }
            }
            savedQuiz.setQuestions(newQuestions);
            savedQuiz = quizRepository.save(savedQuiz);
        }
        
        // Fetch fresh quiz with all relations
        Quiz finalQuiz = quizRepository.findById(savedQuiz.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found after saving"));
        
        log.info("Successfully created quiz with id: {} and {} questions", 
                finalQuiz.getId(), 
                finalQuiz.getQuestions() != null ? finalQuiz.getQuestions().size() : 0);
        return finalQuiz;
    }

    @Override
    @Transactional
    public Quiz updateQuiz(UUID id, QuizRequest request) {
        log.info("Updating quiz with id: {} and request: {}", id, request);
        
        // Find existing quiz
        Quiz existingQuiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz with id: " + id + " not found"));
        
        // Store original courseId
        UUID originalCourseId = existingQuiz.getCourseId();
        
        // Validate total points if questions are present
        if (request.getQuestions() != null && !request.getQuestions().isEmpty()) {
            int totalPoints = request.getQuestions().stream()
                    .mapToInt(QuizQuestionRequest::getPoints)
                    .sum();
            
            if (totalPoints != request.getTotalPoints()) {
                throw new BadRequestException(
                    String.format("Sum of question points (%d) does not match quiz total points (%d)", 
                    totalPoints, request.getTotalPoints())
                );
            }
        }

        // Update quiz using mapper
        Quiz updatedQuiz = mapper.updateEntityFromRequest(existingQuiz, request);
        updatedQuiz.setCourseId(originalCourseId);
        
        // Save the updated quiz first
        updatedQuiz = quizRepository.save(updatedQuiz);
        log.debug("Saved updated quiz basic info: {}", updatedQuiz);

        // Handle questions update
        if (request.getQuestions() != null) {
            log.info("Updating questions for quiz {}", id);
            
            // Delete existing questions first
            if (existingQuiz.getQuestions() != null && !existingQuiz.getQuestions().isEmpty()) {
                log.debug("Deleting {} existing questions", existingQuiz.getQuestions().size());
                quizQuestionRepository.deleteAll(existingQuiz.getQuestions());
            }

            // Create new questions if any
            List<QuizQuestion> newQuestions = new ArrayList<>();
            if (!request.getQuestions().isEmpty()) {
                log.info("Creating {} new questions", request.getQuestions().size());
                for (QuizQuestionRequest questionRequest : request.getQuestions()) {
                    questionRequest.setQuizId(id);  // Ensure correct quiz ID
                    try {
                        QuizQuestion savedQuestion = quizQuestionService.createQuizQuestion(questionRequest);
                        newQuestions.add(savedQuestion);
                        log.debug("Created question: {}", savedQuestion);
                    } catch (Exception e) {
                        log.error("Error creating question: {}", e.getMessage());
                        throw e;
                    }
                }
            }

            // Update quiz with new questions
            updatedQuiz.setQuestions(newQuestions);
            updatedQuiz = quizRepository.save(updatedQuiz);
        }

        // Fetch fresh quiz with all relations
        Quiz finalQuiz = quizRepository.findById(updatedQuiz.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found after update"));

        log.info("Successfully updated quiz with id: {} and {} questions", 
                finalQuiz.getId(), 
                finalQuiz.getQuestions() != null ? finalQuiz.getQuestions().size() : 0);
        
        return finalQuiz;
    }

    @Override
    public void deleteQuiz(UUID id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz with id " + id + " not found"));
        quizRepository.delete(quiz);
    }

    @Override
    public List<QuizDTO> getQuizzesByCourseId(UUID courseId) {
        List<Quiz> quizzes = quizRepository.findByCourseId(courseId);
        return quizzes.stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }
}
