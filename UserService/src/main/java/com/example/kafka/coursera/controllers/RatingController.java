package com.example.kafka.coursera.controllers;

import com.example.kafka.coursera.DTO.RatingDTO;
import com.example.kafka.coursera.requests.RatingRequest;
import com.example.kafka.coursera.services.RatingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@Validated
@RestController
@RequestMapping("api/instructor/rating")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    // Create a new rating
    @PostMapping(consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> addRating(@RequestBody RatingRequest ratingRequest) {
        RatingDTO ratingDTO = ratingService.addRating(ratingRequest);
        log.info("Rating : {}", ratingDTO.toString());

        return ResponseEntity.status(HttpStatusCode.valueOf(200)).body(ratingDTO);
    }

    // Get all ratings for a specific instructor
    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<List<RatingDTO>> getRatingsForInstructor(@PathVariable UUID instructorId) {
        List<RatingDTO> ratings = ratingService.getRatingsForInstructor(instructorId);
        return ResponseEntity.ok(ratings);
    }

    // Get a single rating by its ID
    @GetMapping("/{ratingId}")
    public ResponseEntity<RatingDTO> getRatingById(@PathVariable UUID ratingId) {
        RatingDTO ratingDTO = ratingService.getRatingById(ratingId);
        return ResponseEntity.ok(ratingDTO);
    }

    // Update a rating by its ID
    @PutMapping("/{ratingId}")
    public ResponseEntity<RatingDTO> updateRating(@PathVariable UUID ratingId, @RequestBody RatingRequest ratingRequest) {
        RatingDTO updatedRatingDTO = ratingService.updateRating(ratingId, ratingRequest);
        return ResponseEntity.ok(updatedRatingDTO);
    }

    // Delete a rating by its ID
    @DeleteMapping("/{ratingId}")
    public ResponseEntity<Void> deleteRating(@PathVariable UUID ratingId) {
        ratingService.deleteRating(ratingId);
        return ResponseEntity.noContent().build();
    }
}