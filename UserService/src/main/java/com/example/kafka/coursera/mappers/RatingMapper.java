package com.example.kafka.coursera.mappers;

import com.example.kafka.coursera.DTO.RatingDTO;
import com.example.kafka.coursera.db.entities.Rating;
import com.example.kafka.coursera.requests.RatingRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Component;

@Component
@Mapper(componentModel = "spring")
public interface RatingMapper {

    RatingDTO toDto(Rating rating);

    // Map RatingRequest to Rating (excluding instructor)
    @Mapping(target = "instructor", ignore = true)
    Rating toEntity(RatingRequest ratingRequest);
}