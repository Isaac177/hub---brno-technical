package com.example.courseService.config;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.bson.Document;

import java.util.HashMap;
import java.util.Map;

@Component
public class ExternalServicesHealthIndicator implements HealthIndicator {
    
    private final MongoTemplate mongoTemplate;
    private final StringRedisTemplate redisTemplate;
    private final RabbitTemplate rabbitTemplate;

    @Autowired
    public ExternalServicesHealthIndicator(
            MongoTemplate mongoTemplate,
            StringRedisTemplate redisTemplate,
            RabbitTemplate rabbitTemplate) {
        this.mongoTemplate = mongoTemplate;
        this.redisTemplate = redisTemplate;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public Health health() {
        Map<String, Object> details = new HashMap<>();
        boolean isHealthy = true;

        // Check MongoDB
        try {
            Document result = mongoTemplate.executeCommand(new Document("ping", 1));
            details.put("mongodb", "UP - " + result.toString());
        } catch (Exception e) {
            details.put("mongodb", "DOWN - " + e.getMessage());
            isHealthy = false;
        }

        // Check Redis
        try {
            String pong = redisTemplate.execute((RedisCallback<String>) connection -> {
                if (connection != null) {
                    return new String(connection.ping());
                }
                return "Connection is null";
            });
            details.put("redis", "UP - Response: " + pong);
        } catch (Exception e) {
            details.put("redis", "DOWN - " + e.getMessage());
            isHealthy = false;
        }

        // Check RabbitMQ
        try {
            rabbitTemplate.execute(channel -> {
                channel.getConnection().getServerProperties();
                return true;
            });
            details.put("rabbitmq", "UP");
        } catch (Exception e) {
            details.put("rabbitmq", "DOWN - " + e.getMessage());
            isHealthy = false;
        }

        return isHealthy 
            ? Health.up().withDetails(details).build()
            : Health.down().withDetails(details).build();
    }
}
