package com.example.kafka.coursera.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
public class CacheService<T> {

    @Cacheable(value = "#cacheName", key = "#id")
    public T getFromCache(String cacheName, UUID id) {
        // Placeholder for actual retrieval logic (if needed)
        return null; // Will fetch from cache if available
    }

    @Async
    @CachePut(value = "#cacheName", key = "#id")
    public T updateCache(String cacheName, UUID id, T entity) {
        log.info("Update cache {} with id {}", cacheName, id);
        return entity; // Updates the cache with the new entity
    }

    @CacheEvict(value = "#cacheName", key = "#id")
    public void evictFromCache(String cacheName, UUID id) {
        // Evicts the entity from the cache
    }
}