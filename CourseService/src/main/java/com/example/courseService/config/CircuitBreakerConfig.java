package com.example.courseService.config;

import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig.SlidingWindowType;
import io.github.resilience4j.common.circuitbreaker.configuration.CircuitBreakerConfigCustomizer;
import io.github.resilience4j.timelimiter.TimeLimiterConfig;
import org.springframework.cloud.circuitbreaker.resilience4j.Resilience4JCircuitBreakerFactory;
import org.springframework.cloud.circuitbreaker.resilience4j.Resilience4JConfigBuilder;
import org.springframework.cloud.client.circuitbreaker.Customizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class CircuitBreakerConfig {
    
    @Bean
    public Customizer<Resilience4JCircuitBreakerFactory> defaultCustomizer() {
        return factory -> factory.configureDefault(id -> new Resilience4JConfigBuilder(id)
                .timeLimiterConfig(TimeLimiterConfig.custom()
                        .timeoutDuration(Duration.ofSeconds(5))
                        .build())
                .circuitBreakerConfig(io.github.resilience4j.circuitbreaker.CircuitBreakerConfig.custom()
                        .slidingWindowType(SlidingWindowType.COUNT_BASED)
                        .slidingWindowSize(10)
                        .failureRateThreshold(50)
                        .waitDurationInOpenState(Duration.ofSeconds(10))
                        .permittedNumberOfCallsInHalfOpenState(5)
                        .automaticTransitionFromOpenToHalfOpenEnabled(true)
                        .build())
                .build());
    }

    @Bean
    public CircuitBreakerConfigCustomizer mongoCustomizer() {
        return CircuitBreakerConfigCustomizer
                .of("mongoCircuitBreaker",
                    builder -> builder.slidingWindowSize(10)
                            .failureRateThreshold(50)
                            .waitDurationInOpenState(Duration.ofSeconds(5))
                            .recordExceptions(
                                    org.springframework.dao.DataAccessException.class,
                                    com.mongodb.MongoException.class)
                );
    }

    @Bean
    public CircuitBreakerConfigCustomizer redisCustomizer() {
        return CircuitBreakerConfigCustomizer
                .of("redisCircuitBreaker",
                    builder -> builder.slidingWindowSize(10)
                            .failureRateThreshold(50)
                            .waitDurationInOpenState(Duration.ofSeconds(5))
                            .recordExceptions(
                                    org.springframework.dao.DataAccessException.class,
                                    io.lettuce.core.RedisException.class)
                );
    }

    @Bean
    public CircuitBreakerConfigCustomizer rabbitCustomizer() {
        return CircuitBreakerConfigCustomizer
                .of("rabbitCircuitBreaker",
                    builder -> builder.slidingWindowSize(10)
                            .failureRateThreshold(50)
                            .waitDurationInOpenState(Duration.ofSeconds(5))
                            .recordExceptions(
                                    org.springframework.amqp.AmqpException.class,
                                    com.rabbitmq.client.ShutdownSignalException.class)
                );
    }
}
