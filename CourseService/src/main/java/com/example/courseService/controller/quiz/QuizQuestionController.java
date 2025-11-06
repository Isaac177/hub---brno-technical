package com.example.courseService.controller.quiz;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.courseService.dto.request.QuizQuestionRequest;
import com.example.courseService.dto.response.QuizQuestionDTO;
import com.example.courseService.model.QuizQuestion;
import com.example.courseService.service.QuizQuestionService;
import com.example.courseService.mapper.QuizQuestionMapper;
import com.example.courseService.exception.implementation.ResourceNotFoundException;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/quiz-questions")
@Validated
@RequiredArgsConstructor
public class QuizQuestionController {

    private static final Logger logger = LoggerFactory.getLogger(QuizQuestionController.class);

    private final QuizQuestionService quizQuestionService;
    private final QuizQuestionMapper quizQuestionMapper;

    @GetMapping
    public ResponseEntity<List<QuizQuestionDTO>> getAllQuizQuestions() {
        List<QuizQuestion> quizQuestions = quizQuestionService.getAllQuizQuestions();
        List<QuizQuestionDTO> responseList = quizQuestions.stream()
                .map(quizQuestionMapper::toDTO)
                .toList();
        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizQuestionDTO> getQuizQuestionById(@PathVariable UUID id) {
        Optional<QuizQuestion> quizQuestion = quizQuestionService.getQuizQuestionById(id);
        return quizQuestion.map(value -> ResponseEntity.ok(quizQuestionMapper.toDTO(value)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<QuizQuestionDTO>> getQuestionsByQuizId(@PathVariable UUID quizId) {
        logger.info("Received request to get questions for quiz ID: {}", quizId);
        try {
            List<QuizQuestion> questions = quizQuestionService.getQuestionsByQuizId(quizId);
            
            // Add debug logging
            questions.forEach(q -> logger.debug("Retrieved question: {}", q));
            
            List<QuizQuestionDTO> responseList = questions.stream()
                    .map(q -> {
                        try {
                            return quizQuestionMapper.toDTO(q);
                        } catch (Exception e) {
                            logger.error("Error mapping question to DTO: {}", q, e);
                            throw e;
                        }
                    })
                    .toList();
                    
            return ResponseEntity.ok(responseList);
        } catch (Exception e) {
            logger.error("Error retrieving questions for quiz {}: ", quizId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping(consumes = "application/json;charset=UTF-8")
    public ResponseEntity<QuizQuestionDTO> createQuizQuestion(@RequestBody @Valid QuizQuestionRequest request) {
        logger.info("Received quiz question creation request: {}", request);
        QuizQuestion createdQuizQuestion = quizQuestionService.createQuizQuestion(request);
        logger.info("Created quiz question: {}", createdQuizQuestion);
        return ResponseEntity.ok(quizQuestionMapper.toDTO(createdQuizQuestion));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuizQuestionDTO> updateQuizQuestion(@PathVariable UUID id,
            @RequestBody @Valid QuizQuestionRequest request) {
        QuizQuestion updatedQuizQuestion = quizQuestionService.updateQuizQuestion(id, request);
        return ResponseEntity.ok(quizQuestionMapper.toDTO(updatedQuizQuestion));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuizQuestion(@PathVariable UUID id) {
        quizQuestionService.deleteQuizQuestion(id);
        return ResponseEntity.noContent().build();
    }
}
