package com.example.courseService.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class RedisConnectionLogger {
    private static final Logger log = LoggerFactory.getLogger(RedisConnectionLogger.class);
    private final RedisConnectionFactory redisConnectionFactory;

    @Autowired
    public RedisConnectionLogger(RedisConnectionFactory redisConnectionFactory) {
        this.redisConnectionFactory = redisConnectionFactory;
    }

    @PostConstruct
    public void logRedisConnectionDetails() {
        RedisConnection connection = null;
        try {
            connection = redisConnectionFactory.getConnection();
            String clientName = connection.serverCommands().getClientName();
            log.info("Connected to Redis with client name: {}", clientName);
        } catch (Exception e) {
            log.error("Failed to get Redis client name: {}", e.getMessage());
        } finally {
            if (connection != null) {
                try {
                    connection.close();
                } catch (Exception e) {
                    log.error("Error closing Redis connection: {}", e.getMessage());
                }
            }
        }
    }
}
