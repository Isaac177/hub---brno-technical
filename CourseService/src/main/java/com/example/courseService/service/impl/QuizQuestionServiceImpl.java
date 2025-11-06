package com.example.courseService.service.impl;

import com.example.courseService.service.QuizQuestionService;
import org.javers.core.Javers;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.example.courseService.dto.request.QuizAnswerRequest;
import com.example.courseService.dto.request.QuizQuestionRequest;
import com.example.courseService.model.enums.QuestionType;
import com.example.courseService.model.Quiz;
import com.example.courseService.model.QuizQuestion;
import com.example.courseService.repository.QuizQuestionRepository;
import com.example.courseService.repository.QuizRepository;
import com.example.courseService.exception.implementation.BadRequestException;
import com.example.courseService.exception.implementation.ResourceNotFoundException;
import com.example.courseService.mapper.QuizQuestionMapper;

import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizQuestionServiceImpl implements QuizQuestionService {
    private static final Logger logger = LoggerFactory.getLogger(QuizQuestionServiceImpl.class);
    private final QuizQuestionMapper quizQuestionMapper;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizRepository quizRepository;
    private final Javers javers;

    @Override
    public List<QuizQuestion> getAllQuizQuestions() {
        return quizQuestionRepository.findAll();
    }

    @Override
    public Optional<QuizQuestion> getQuizQuestionById(UUID id) {
        return quizQuestionRepository.findById(id);
    }

    @Override
    public QuizQuestion createQuizQuestion(@NotNull QuizQuestionRequest request) {
        logger.info("Creating quiz question with request: {}", request);
        validateQuestionTypeAndOptions(request);
        
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));
        
        QuizQuestion quizQuestion = quizQuestionMapper.toEntity(request, quiz);
        quizQuestion.setId(UUID.randomUUID());
        QuizQuestion savedQuestion = quizQuestionRepository.save(quizQuestion);
        
        // Update quiz with reference
        if (quiz.getQuestions() == null) {
            quiz.setQuestions(new ArrayList<>());
        }
        quiz.getQuestions().add(savedQuestion);
        quizRepository.save(quiz);
        
        return savedQuestion;
    }

    @Override
    public QuizQuestion updateQuizQuestion(UUID id, @NotNull QuizQuestionRequest request) {
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        QuizQuestion existingQuizQuestion = quizQuestionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz question with this Id: " + id + " not found"));

        QuizQuestion updatedQuizQuestion = quizQuestionMapper.toEntity(request, quiz);
        updatedQuizQuestion.setId(id);

        if (!hasChanges(existingQuizQuestion, updatedQuizQuestion)) {
            throw new BadRequestException("No changes to update");
        }

        return quizQuestionRepository.save(updatedQuizQuestion);
    }

    @Override
    public void deleteQuizQuestion(UUID id) {
        QuizQuestion question = quizQuestionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz question not found with id: " + id));
        
        Quiz quiz = quizRepository.findById(question.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        
        List<QuizQuestion> questions = quiz.getQuestions();
        if (questions != null) {
            questions.removeIf(q -> q.getId().equals(id));
            quiz.setQuestions(questions);
            quizRepository.save(quiz);
        }
        
        quizQuestionRepository.deleteById(id);
    }

    @Override
    @Cacheable(value = "questions")
    public List<QuizQuestion> getQuestionsByQuizId(UUID quizId) {
        logger.info("Fetching questions for quiz ID: {}", quizId);
        try {
            return quizQuestionRepository.findByQuizId(quizId);
        } catch (Exception e) {
            logger.error("Error fetching questions for quiz {}: ", quizId, e);
            throw e;
        }
    }

    @Override
    public int calculateScore(UUID quizId, @NotNull List<QuizAnswerRequest> userAnswers) {
        List<QuizQuestion> questions = getQuestionsByQuizId(quizId);
        Map<UUID, QuizQuestion> questionMap = questions.stream()
                .collect(Collectors.toMap(QuizQuestion::getId, question -> question));

        return userAnswers.stream()
                .mapToInt(answer -> calculateQuestionScore(answer, questionMap))
                .sum();
    }

    private void validateQuestionTypeAndOptions(QuizQuestionRequest request) {
        logger.debug("Validating question type: {}, options: {}", request.getType(), request.getOptions());
        if (request.getType() == null) {
            throw new BadRequestException("Question type cannot be null");
        }
        
        if (QuestionType.MULTIPLE_CHOICE.equals(request.getType())) {
            logger.debug("Question is multiple choice");
            if (request.getOptions() == null || request.getOptions().isEmpty()) {
                throw new BadRequestException("Multiple choice questions must have options");
            }
            // Validate that correct answer is one of the options
            if (!request.getOptions().contains(request.getCorrectAnswer())) {
                throw new BadRequestException("Correct answer must be one of the options");
            }
        } else if (request.getOptions() != null && !request.getOptions().isEmpty()) {
            logger.debug("Non-multiple choice question has options");
            throw new BadRequestException("Only multiple choice questions can have options");
        }
    }

    private boolean hasChanges(QuizQuestion oldQuizQuestion, QuizQuestion newQuizQuestion) {
        return !javers.compare(oldQuizQuestion, newQuizQuestion).getChanges().isEmpty();
    }

    private int calculateQuestionScore(QuizAnswerRequest userAnswer, Map<UUID, QuizQuestion> questionMap) {
        QuizQuestion question = questionMap.get(userAnswer.getQuestionId());
        return (question != null && userAnswer.getAnswer().equals(question.getCorrectAnswer()))
                ? question.getPoints() : 0;
    }
}