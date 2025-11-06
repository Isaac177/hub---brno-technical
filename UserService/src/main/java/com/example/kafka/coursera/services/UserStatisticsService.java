package com.example.kafka.coursera.services;

import com.example.kafka.coursera.db.repositories.UserRepository;
import com.example.kafka.coursera.repository.UserStatsRepository;
import com.example.kafka.coursera.repository.UserAchievementRepository;
import com.example.kafka.coursera.db.entities.User;
import com.example.kafka.coursera.model.UserStats;
import com.example.kafka.coursera.model.UserAchievement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserStatisticsService {

    private final UserRepository userRepository;
    private final UserStatsRepository userStatsRepository;
    private final UserAchievementRepository userAchievementRepository;

    public Map<String, Object> collectUserStatistics() {
        log.info("Collecting comprehensive user statistics from UserService");
        
        Map<String, Object> statistics = new HashMap<>();
        
        try {
            // === BASIC USER COUNTS ===
            long totalUsers = userRepository.count();
            long usersWithQuizActivity = userStatsRepository.count();
            statistics.put("totalUsers", totalUsers);
            statistics.put("usersWithQuizActivity", usersWithQuizActivity);
            
            // === USER DEMOGRAPHICS ===
            Map<String, Long> usersByRole = new HashMap<>();
            var allUsers = userRepository.findAll();
            allUsers.forEach(user -> {
                String role = user.getRole() != null ? user.getRole().toString() : "UNKNOWN";
                usersByRole.put(role, usersByRole.getOrDefault(role, 0L) + 1);
            });
            statistics.put("usersByRole", usersByRole);
            
            // === QUIZ PERFORMANCE STATISTICS ===
            var allUserStats = userStatsRepository.findAll();
            
            // Total quiz attempts
            long totalQuizAttempts = allUserStats.stream()
                    .mapToLong(UserStats::getTotalQuizzesTaken)
                    .sum();
            statistics.put("totalQuizAttempts", totalQuizAttempts);
            
            // Users with perfect scores
            long usersWithPerfectScores = allUserStats.stream()
                    .mapToLong(stats -> stats.getPerfectScores() > 0 ? 1L : 0L)
                    .sum();
            statistics.put("usersWithPerfectScores", usersWithPerfectScores);
            
            // Total perfect scores achieved
            long totalPerfectScores = allUserStats.stream()
                    .mapToLong(UserStats::getPerfectScores)
                    .sum();
            statistics.put("totalPerfectScores", totalPerfectScores);
            
            // Average quiz score across all users
            double averageQuizScore = allUserStats.stream()
                    .filter(stats -> stats.getAvgQuizScore() != null)
                    .mapToDouble(UserStats::getAvgQuizScore)
                    .average()
                    .orElse(0.0);
            statistics.put("averageQuizScore", Math.round(averageQuizScore * 100.0) / 100.0);
            
            // Quiz performance distribution
            Map<String, Long> quizPerformanceDistribution = new HashMap<>();
            allUserStats.stream()
                    .filter(stats -> stats.getAvgQuizScore() != null)
                    .forEach(stats -> {
                        double score = stats.getAvgQuizScore();
                        String category;
                        if (score >= 90) category = "Excellent (90-100%)";
                        else if (score >= 80) category = "Good (80-89%)";
                        else if (score >= 70) category = "Average (70-79%)";
                        else if (score >= 60) category = "Below Average (60-69%)";
                        else category = "Poor (<60%)";
                        
                        quizPerformanceDistribution.put(category, 
                            quizPerformanceDistribution.getOrDefault(category, 0L) + 1);
                    });
            statistics.put("quizPerformanceDistribution", quizPerformanceDistribution);
            
            // === ACHIEVEMENT STATISTICS ===
            var allAchievements = userAchievementRepository.findAll();
            long totalAchievements = allAchievements.size();
            statistics.put("totalAchievements", totalAchievements);
            
            // Achievement breakdown by type
            Map<String, Long> achievementsByType = new HashMap<>();
            allAchievements.stream()
                    .filter(achievement -> achievement.getType() != null)
                    .forEach(achievement -> {
                        String type = achievement.getType();
                        achievementsByType.put(type, achievementsByType.getOrDefault(type, 0L) + 1);
                    });
            statistics.put("achievementsByType", achievementsByType);
            
            // Recent achievements (last 30 days)
            var thirtyDaysAgo = java.time.LocalDateTime.now().minusDays(30);
            long recentAchievements = allAchievements.stream()
                    .filter(achievement -> achievement.getEarnedAt() != null && 
                            achievement.getEarnedAt().isAfter(thirtyDaysAgo))
                    .mapToLong(achievement -> 1L)
                    .sum();
            statistics.put("recentAchievements", recentAchievements);
            
            // === ACTIVITY STATISTICS ===
            long activeUsersCount = allUserStats.stream()
                    .filter(stats -> stats.getLastActivityAt() != null)
                    .mapToLong(stats -> 1L)
                    .sum();
            statistics.put("activeUsersCount", activeUsersCount);
            
            // Recent activity (last 7 days)
            var sevenDaysAgo = java.time.LocalDateTime.now().minusDays(7);
            long recentlyActiveUsers = allUserStats.stream()
                    .filter(stats -> stats.getLastActivityAt() != null && 
                            stats.getLastActivityAt().isAfter(sevenDaysAgo))
                    .mapToLong(stats -> 1L)
                    .sum();
            statistics.put("recentlyActiveUsers", recentlyActiveUsers);
            
            // === ENGAGEMENT METRICS ===
            // Average quizzes per user
            double avgQuizzesPerUser = usersWithQuizActivity > 0 ? 
                (double) totalQuizAttempts / usersWithQuizActivity : 0.0;
            statistics.put("avgQuizzesPerUser", Math.round(avgQuizzesPerUser * 100.0) / 100.0);
            
            // Engagement levels based on quiz activity
            Map<String, Long> engagementLevels = new HashMap<>();
            allUserStats.forEach(stats -> {
                int quizzes = stats.getTotalQuizzesTaken();
                String level;
                if (quizzes == 0) level = "No Activity";
                else if (quizzes <= 5) level = "Low Engagement (1-5 quizzes)";
                else if (quizzes <= 20) level = "Medium Engagement (6-20 quizzes)";
                else if (quizzes <= 50) level = "High Engagement (21-50 quizzes)";
                else level = "Very High Engagement (50+ quizzes)";
                
                engagementLevels.put(level, engagementLevels.getOrDefault(level, 0L) + 1);
            });
            statistics.put("engagementLevels", engagementLevels);
            
            // === SUMMARY INSIGHTS ===
            Map<String, Object> insights = new HashMap<>();
            insights.put("userActivationRate", totalUsers > 0 ? 
                Math.round((double) usersWithQuizActivity / totalUsers * 100.0 * 100.0) / 100.0 : 0.0);
            insights.put("perfectScoreRate", totalQuizAttempts > 0 ? 
                Math.round((double) totalPerfectScores / totalQuizAttempts * 100.0 * 100.0) / 100.0 : 0.0);
            insights.put("achievementRate", totalUsers > 0 ? 
                Math.round((double) totalAchievements / totalUsers * 100.0 * 100.0) / 100.0 : 0.0);
            statistics.put("insights", insights);
            
            log.info("Comprehensive user statistics collected: {} total users, {} active, {} quiz attempts", 
                    totalUsers, usersWithQuizActivity, totalQuizAttempts);
            
        } catch (Exception e) {
            log.error("Error collecting user statistics: {}", e.getMessage(), e);
            statistics.put("error", "Failed to collect user statistics: " + e.getMessage());
        }
        
        return statistics;
    }
}