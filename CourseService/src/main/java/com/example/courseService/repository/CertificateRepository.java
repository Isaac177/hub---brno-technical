package com.example.courseService.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.courseService.model.Certificate;

import java.util.UUID;

public interface CertificateRepository extends MongoRepository<Certificate, UUID> {
}
