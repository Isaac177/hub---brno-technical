package com.example.kafka.coursera.repository;

import com.example.kafka.coursera.model.UserAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAchievementRepository extends JpaRepository<UserAchievement, String> {
    List<UserAchievement> findByUserId(String userId);
    List<UserAchievement> findByUserIdAndType(String userId, String type);
    Optional<UserAchievement> findByUserIdAndCourseIdAndQuizId(String userId, String courseId, String quizId);
}
