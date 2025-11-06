package com.example.kafka.coursera.services;

import com.example.kafka.coursera.DTO.RatingDTO;
import com.example.kafka.coursera.db.entities.Instructor;
import com.example.kafka.coursera.db.entities.Rating;
import com.example.kafka.coursera.db.repositories.InstructorRepository;
import com.example.kafka.coursera.db.repositories.RatingRepository;
import com.example.kafka.coursera.mappers.RatingMapper;
import com.example.kafka.coursera.requests.RatingRequest;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final InstructorRepository instructorRepository;
    private final RatingMapper ratingMapper;

    // Create a new Rating
    public RatingDTO addRating(RatingRequest ratingRequest) {
        // Fetch the instructor
        Instructor instructor = instructorRepository.findById(ratingRequest.getInstructorId())
                .orElseThrow(() -> new EntityNotFoundException("Instructor not found"));

        // Map the RatingRequest to Rating entity
        Rating rating = ratingMapper.toEntity(ratingRequest);

        rating.setId(UUID.randomUUID());
        rating.setInstructor(instructor);

        // Save the rating
        Rating savedRating = ratingRepository.save(rating);

        // Convert the saved rating to DTO and return
        return ratingMapper.toDto(savedRating);
    }

    // Retrieve all ratings for a specific instructor
    public List<RatingDTO> getRatingsForInstructor(UUID instructorId) {
        Instructor instructor = instructorRepository.findById(instructorId)
                .orElseThrow(() -> new EntityNotFoundException("Instructor not found with ID: " + instructorId));

        return instructor.getRatings().stream().map(ratingMapper::toDto).toList();
    }

    // Retrieve a single rating by its ID
    public RatingDTO getRatingById(UUID ratingId) {
        Rating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new EntityNotFoundException("Rating not found with ID: " + ratingId));

        return ratingMapper.toDto(rating);
    }

    // Update a rating by its ID
    public RatingDTO updateRating(UUID ratingId, RatingRequest ratingRequest) {
        // Fetch the existing rating
        Rating existingRating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new EntityNotFoundException("Rating not found with ID: " + ratingId));

        // Update the rating's score and comment
        existingRating.setScore(ratingRequest.getScore());
        existingRating.setComment(ratingRequest.getComment());

        // Save the updated rating
        Rating updatedRating = ratingRepository.save(existingRating);

        // Convert the updated rating to DTO and return
        return ratingMapper.toDto(updatedRating);
    }

    // Delete a rating by its ID
    public boolean deleteRating(UUID ratingId) {
        if (!ratingRepository.existsById(ratingId)) {
            throw new EntityNotFoundException("Rating not found with ID: " + ratingId);
        }
        ratingRepository.deleteById(ratingId);
        return true;
    }
}