package com.example.kafka.coursera.configs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.stereotype.Component;

@Component
public class RedisConnectionLogger {

    private final RedisConnectionFactory redisConnectionFactory;

    @Autowired
    public RedisConnectionLogger(RedisConnectionFactory redisConnectionFactory) {
        this.redisConnectionFactory = redisConnectionFactory;
        logRedisConnectionDetails();
    }

    private void logRedisConnectionDetails() {
        RedisConnection connection = redisConnectionFactory.getConnection();

        try {
            // Accessing client name using serverCommands()
            String clientName = connection.serverCommands().getClientName();

            // Logging the client name
            System.out.println("Connected to Redis with client name: " + clientName);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Failed to get Redis client name.");
        } finally {
            // Close the connection if no longer needed
            connection.close();
        }
    }
}
