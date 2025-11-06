package com.example.kafka.coursera.services.achievements;

import com.example.kafka.coursera.DTO.QuizCompletionMessage;
import com.example.kafka.coursera.db.entities.User;
import com.example.kafka.coursera.db.repositories.UserRepository;
import com.example.kafka.coursera.exceptions.ResourceNotFoundException;
import com.example.kafka.coursera.model.UserAchievement;
import com.example.kafka.coursera.model.UserStats;
import com.example.kafka.coursera.repository.UserAchievementRepository;
import com.example.kafka.coursera.repository.UserStatsRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class UserAchievementService {
    private final UserAchievementRepository achievementRepository;
    private final UserStatsRepository statsRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public UserAchievementService(UserAchievementRepository achievementRepository,
                                UserStatsRepository statsRepository,
                                UserRepository userRepository,
                                ObjectMapper objectMapper) {
        this.achievementRepository = achievementRepository;
        this.statsRepository = statsRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void handleQuizCompletion(QuizCompletionMessage message) throws Exception {
        try {
            if (message == null || message.getUserId() == null || message.getCourseId() == null || message.getQuizId() == null) {
                log.error("Invalid quiz completion message received: {}", message);
                return;
            }

            log.info("Processing quiz completion message: {}", objectMapper.writeValueAsString(message));
            
            // Update user stats
            log.info("Fetching stats for user: {}", message.getUserId());
            UserStats stats = statsRepository.findByUserId(message.getUserId())
                    .orElseGet(() -> {
                        log.info("Creating new stats for user: {}", message.getUserId());
                        UserStats newStats = new UserStats();
                        newStats.setUserId(message.getUserId());
                        newStats.setTotalQuizzesTaken(0);
                        newStats.setPerfectScores(0);
                        newStats.setAvgQuizScore(0.0);
                        return newStats;
                    });
            
            updateUserStats(stats, message);
            statsRepository.save(stats);
            log.info("Updated stats saved for user: {}", message.getUserId());

            // Check and update achievements
            if (message.isPassed()) {
                updateAchievements(message);
            }
        } catch (Exception e) {
            log.error("Error processing quiz completion for user {}: {}", 
                    message != null ? message.getUserId() : "unknown", e.getMessage(), e);
            throw e;
        }
    }

    private void updateUserStats(UserStats stats, QuizCompletionMessage message) {
        int oldTotal = stats.getTotalQuizzesTaken();
        stats.setTotalQuizzesTaken(oldTotal + 1);
        
        // Update average score
        double currentAvg = stats.getAvgQuizScore() != null ? stats.getAvgQuizScore() : 0.0;
        double newAvg = (currentAvg * oldTotal + message.getScore()) / (oldTotal + 1);
        stats.setAvgQuizScore(newAvg);
        
        // Update perfect scores
        if (message.getScore() == 100) {
            stats.setPerfectScores(stats.getPerfectScores() + 1);
        }
        
        log.info("Updated stats - userId: {}, totalQuizzes: {}, avgScore: {}, perfectScores: {}", 
                stats.getUserId(), stats.getTotalQuizzesTaken(), stats.getAvgQuizScore(), stats.getPerfectScores());
    }

    private void updateAchievements(QuizCompletionMessage message) {
        Optional<UserAchievement> existingAchievement = achievementRepository
                .findByUserIdAndCourseIdAndQuizId(message.getUserId(), message.getCourseId(), message.getQuizId());
        
        if (existingAchievement.isEmpty()) {
            UserAchievement achievement = new UserAchievement();
            achievement.setUserId(message.getUserId());
            achievement.setCourseId(message.getCourseId());
            achievement.setQuizId(message.getQuizId());
            achievement.setScore(message.getScore());
            achievement.setCompletedAt(message.getCompletedAt());
            achievement.setType("QUIZ_COMPLETION"); // Set the achievement type
            
            achievementRepository.save(achievement);
            log.info("New achievement saved for user {} in course {}, quiz {}", 
                    message.getUserId(), message.getCourseId(), message.getQuizId());
        } else {
            log.info("Achievement already exists for user {} in course {}, quiz {}", 
                    message.getUserId(), message.getCourseId(), message.getQuizId());
        }
    }

    @Transactional
    public void handleCourseEnrollment(Map<String, Object> message) throws Exception {
        try {
            if (message == null || !message.containsKey("data")) {
                log.error("Invalid course enrollment message received: {}", message);
                return;
            }

            Map<String, Object> data = (Map<String, Object>) message.get("data");
            String courseId = (String) data.get("course_id");
            String userEmail = (String) data.get("user_id"); // This is actually the email
            Map<String, Object> metadata = (Map<String, Object>) data.get("metadata");
            String enrollmentId = (String) metadata.get("enrollmentId");

            // Look up user from user_coursera table by email
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

            log.info("Processing course enrollment message for user: {}, course: {}", user.getId(), courseId);

            // Create new achievement
            UserAchievement achievement = new UserAchievement();
            achievement.setUserId(user.getId().toString());
            achievement.setCourseId(courseId);
            achievement.setType("enrollment");
            achievement.setScore(0); // Initial score for enrollment
            achievement.setCompletedAt(LocalDateTime.now()); // Set to now since it's an enrollment achievement
            achievement.setEarnedAt(LocalDateTime.now()); // Set earned time
            achievement.setMetadata(metadata); // This will be automatically converted to JSON by JPA

            achievementRepository.save(achievement);
            log.info("Saved enrollment achievement for user: {}, course: {}", user.getId(), courseId);

            // Update user stats
            UserStats stats = statsRepository.findByUserId(user.getId().toString())
                    .orElseGet(() -> {
                        UserStats newStats = new UserStats();
                        newStats.setUserId(user.getId().toString());
                        newStats.setLastActivityAt(LocalDateTime.now());
                        return newStats;
                    });
            
            statsRepository.save(stats);

        } catch (Exception e) {
            log.error("Error processing course enrollment message: {}", e.getMessage(), e);
            throw e;
        }
    }
}
