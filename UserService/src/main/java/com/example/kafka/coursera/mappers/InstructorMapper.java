package com.example.kafka.coursera.mappers;

import com.example.kafka.coursera.DTO.InstructorDTO;
import com.example.kafka.coursera.db.entities.Instructor;
import com.example.kafka.coursera.db.entities.Rating;
import com.example.kafka.coursera.requests.InstructorRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Mapper(componentModel = "spring", uses = RatingMapper.class)
public interface InstructorMapper {
    InstructorMapper INSTANCE = Mappers.getMapper(InstructorMapper.class);

    @Mapping(target = "courseCounts", ignore = true)
    @Mapping(target = "avatarUrl", source = "avatar.url")
    InstructorDTO toDto(Instructor instructor);

    @Mapping(target = "ratings", ignore = true)
    @Mapping(target = "avatar", ignore = true)
    Instructor toEntity(InstructorRequest registerRequest);

    List<InstructorDTO> toDtoList(List<Instructor> instructors);
}