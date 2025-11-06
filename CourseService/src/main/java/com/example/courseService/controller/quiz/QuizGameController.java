package com.example.courseService.controller.quiz;

import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.courseService.dto.request.QuizAnswerRequest;
import com.example.courseService.dto.request.QuizSubmitRequest;
import com.example.courseService.dto.response.QuizGameResult;
import com.example.courseService.dto.response.QuizQuestionDTO;
import com.example.courseService.model.Quiz;
import com.example.courseService.model.QuizSession;
import com.example.courseService.service.QuizQuestionService;
import com.example.courseService.service.QuizService;
import com.example.courseService.service.QuizSessionService;
import com.example.courseService.mapper.QuizQuestionMapper;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/quiz-game")
@RequiredArgsConstructor
@Validated
public class QuizGameController {
    private final QuizService quizService;
    private final QuizSessionService quizSessionService;
    private final QuizQuestionService quizQuestionService;
    private final MessageSource messageSource;
    private final QuizQuestionMapper quizQuestionMapper;
    private final RedisTemplate<String, Object> redisTemplate; // Make sure this matches your configuration

    @PostMapping("/{quizId}/start")
    public ResponseEntity<?> startQuiz(
            @PathVariable("quizId") @NotNull(message = "quizQuestionRequest.quizId.notNull") UUID quizId,
            @RequestParam @NotNull(message = "courseProgressRequest.userId.notNull") UUID userId) {
        try {
            QuizSession session = quizSessionService.startSession(quizId, userId);
            return ResponseEntity.ok(session);

        } catch (DuplicateKeyException e) {
            return ResponseEntity.badRequest().body("You already passed the quiz");
        }
    }

    // Получение вопросов квиза
    @GetMapping("/{quizId}/questions")
    public ResponseEntity<List<QuizQuestionDTO>> getShuffledQuestions(
            @PathVariable("quizId") @NotNull(message = "quizQuestionRequest.quizId.notNulls") UUID quizId) {

        List<QuizQuestionDTO> questions = quizQuestionService.getQuestionsByQuizId(quizId).stream()
                .map(q -> quizQuestionMapper.toDTO(q)).collect(Collectors.toList());
        Collections.shuffle(questions);
        return ResponseEntity.ok(questions);
    }

    // Отправка ответов
    @PostMapping("/submit")
    public ResponseEntity<?> submitQuiz(
            @RequestBody @Valid QuizSubmitRequest request) {
        Locale locale = LocaleContextHolder.getLocale();

        UUID sessionId = request.getSessionId();
        UUID userId = request.getUserId();
        UUID quizId = request.getQuizId();
        List<QuizAnswerRequest> userAnswers = request.getUserAnswers();
        QuizSession session = (QuizSession) redisTemplate.opsForValue().get("sessionId:" + userId + quizId);

        Quiz quiz = quizService.getQuizById(session.getQuizId());

        long currentTime = System.currentTimeMillis();
        if ((currentTime - session.getStartTime()) > quiz.getTimeLimit() * 1000) {
            return ResponseEntity.badRequest().body("Time limit exceeded");
        }

        int totalScore = quizQuestionService.calculateScore(session.getQuizId(), userAnswers);

        quizSessionService.completeSession(sessionId, totalScore);

        QuizGameResult result = new QuizGameResult();
        if (totalScore >= quiz.getPassingScore()) {
            result.setMessage(messageSource.getMessage("quiz.game.passed", null, locale));
            result.setTotalScore(totalScore);
        } else {
            result.setMessage(messageSource.getMessage("quiz.game.failed", null, locale));
            result.setTotalScore(totalScore);
        }

        return ResponseEntity.ok(result);
    }
}
