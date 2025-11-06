package com.example.courseService.controller.quiz;

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

import com.example.courseService.dto.request.QuizRequest;
import com.example.courseService.dto.response.QuizDTO;
import com.example.courseService.model.Quiz;
import com.example.courseService.service.QuizService;
import com.example.courseService.mapper.QuizMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

@Validated
@RestController
@RequestMapping("/api/v1/courses/{courseId}/quizzes")
@RequiredArgsConstructor
public class QuizController {
    private final QuizService quizService;
    private final QuizMapper mapper;

    @GetMapping
    public ResponseEntity<List<QuizDTO>> getAllQuizzes(@PathVariable UUID courseId) {
        List<QuizDTO> quizzes = quizService.getQuizzesByCourseId(courseId);
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizDTO> getQuizById(@PathVariable UUID courseId, @PathVariable UUID id) {
        Quiz quiz = quizService.getQuizById(id);
        return ResponseEntity.ok(mapper.toDTO(quiz));
    }

    @PostMapping
    public ResponseEntity<QuizDTO> createQuiz(@PathVariable UUID courseId, @RequestBody @Valid QuizRequest request) {
        Quiz createdQuiz = quizService.createQuiz(request);
        return ResponseEntity.ok(mapper.toDTO(createdQuiz));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuizDTO> updateQuiz(@PathVariable UUID courseId, @PathVariable UUID id,
            @RequestBody @Valid QuizRequest request) {
        Quiz updatedQuiz = quizService.updateQuiz(id, request);
        return ResponseEntity.ok(mapper.toDTO(updatedQuiz));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable UUID courseId, @PathVariable UUID id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/api/quizzes/{id}")
    public ResponseEntity<Void> deleteQuizById(@PathVariable UUID id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.noContent().build();
    }
}
