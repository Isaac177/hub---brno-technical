package com.example.kafka.coursera.services;

import com.example.kafka.coursera.DTO.InstructorDTO;
import com.example.kafka.coursera.db.entities.File;
import com.example.kafka.coursera.db.entities.Instructor;
import com.example.kafka.coursera.db.entities.Rating;
import com.example.kafka.coursera.db.repositories.InstructorRepository;
import com.example.kafka.coursera.db.repositories.RatingRepository;
import com.example.kafka.coursera.exceptions.implementation.ResourceNotFoundException;
import com.example.kafka.coursera.exceptions.implementation.NoChangesException;
import com.example.kafka.coursera.mappers.InstructorMapper;
import com.example.kafka.coursera.requests.InstructorRequest;
import com.example.kafka.coursera.services.messaging.RabbitMQProducer;
import com.example.kafka.coursera.util.HashChecksum;
import org.mapstruct.factory.Mappers;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class InstructorService {

    private final StorageService storageService;
    private final InstructorRepository instructorRepository;
    private final RatingRepository ratingRepository;
    private final RabbitMQProducer rabbitMQProducer;
    private final InstructorMapper instructorMapper;
    private final RabbitTemplate rabbitTemplate;

    @Autowired
    public InstructorService(StorageService storageService,
                             InstructorRepository instructorRepository,
                             RatingRepository ratingRepository,
                             RabbitMQProducer rabbitMQProducer,
                             RabbitTemplate rabbitTemplate,
                             InstructorMapper instructorMapper) {
        this.storageService = storageService;
        this.instructorRepository = instructorRepository;
        this.ratingRepository = ratingRepository;
        this.rabbitMQProducer = rabbitMQProducer;
        this.rabbitTemplate = rabbitTemplate;
        this.instructorMapper = instructorMapper;
    }

    @Transactional
    public Instructor saveInstructor(Instructor instructor) {
        return instructorRepository.save(instructor);
    }

    public List<Instructor> getInstructorEntitiesByIdList(List<UUID> instructorIds) {
        return instructorRepository.findAllById(instructorIds);
    }

    public List<InstructorDTO> getAllInstructors() {
        return instructorMapper.toDtoList(instructorRepository.findAll());
    }
    @Cacheable(value = "instructors")
    public List<InstructorDTO> getInstructorsByIdList(List<UUID> idList ) {
        return instructorMapper.toDtoList(instructorRepository.findAllById(idList));
    }

    @Cacheable(value = "instructor")
    public InstructorDTO getInstructorById(UUID id) {
        InstructorDTO instructorDto = instructorRepository.findById(id).map(instructorMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException(id.toString()+ " not found"));
        Long courseCounts = rabbitMQProducer.getInstructorCourseCount(id);

        instructorDto.setCourseCounts(courseCounts);
        return instructorDto;
    }

    public InstructorDTO signInstructor(InstructorRequest request, MultipartFile file) throws IOException {
        Instructor instructor = instructorMapper.toEntity(request);
        File avatar = storageService.uploadFile(file);

        instructor.setId(UUID.randomUUID());
        instructor.setAvatar(avatar);

        instructorRepository.save(instructor);

        return instructorMapper.toDto(instructor);
    }

    public InstructorDTO updateInstructor(UUID id, InstructorRequest request, MultipartFile file) throws Exception {
        Instructor updatedInstructor = instructorMapper.toEntity(request);
        Instructor existingInstructor = instructorRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException(id.toString()));

        String checksum = (existingInstructor.getAvatar() != null) ? existingInstructor.getAvatar().getCheckSum() : null;
        String reqChecksum = (file != null && !file.isEmpty()) ? HashChecksum.calculateFileChecksum(file) : null;

        File file2upload = new File(null, null, checksum);

        boolean isChecksumEqual = (reqChecksum != null) && file2upload.checkSumEquals(reqChecksum);
        boolean hasChanges = !existingInstructor.equals(updatedInstructor) && !isChecksumEqual;

        if (!hasChanges)
            throw new NoChangesException();

        if (file != null && !file.isEmpty()) {
            file2upload = storageService.processUpload(existingInstructor.getAvatar(), file, isChecksumEqual);
            updatedInstructor.setAvatar(file2upload);
        }

        updatedInstructor.setId(id);
        updatedInstructor.setRatings(existingInstructor.getRatings());

        return instructorMapper.toDto(updatedInstructor);
    }

    public boolean deleteInstructor(UUID id) {
        if (instructorRepository.existsById(id)) {
            instructorRepository.deleteById(id);
            return true;
        }
        return false;
    }
}