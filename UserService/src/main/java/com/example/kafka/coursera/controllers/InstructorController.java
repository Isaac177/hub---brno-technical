package com.example.kafka.coursera.controllers;

import com.example.kafka.coursera.DTO.InstructorDTO;
import com.example.kafka.coursera.requests.InstructorRequest;
import com.example.kafka.coursera.services.InstructorService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Validated
@RestController
@RequestMapping("/api/instructors")
public class InstructorController {
    private InstructorService instructorService;

    @Autowired
    public InstructorController(InstructorService instructorService) {
        this.instructorService = instructorService;
    }

    @GetMapping
    public ResponseEntity<List<InstructorDTO>> getAllInstructors() {
        List<InstructorDTO> instructors = instructorService.getAllInstructors();
        return ResponseEntity.ok(instructors);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InstructorDTO> getInstructorById(@PathVariable UUID id) {
        InstructorDTO instructor = instructorService.getInstructorById(id);
        return ResponseEntity.ok(instructor);
    }

    @PostMapping
    public ResponseEntity<?> signInstructor(@RequestPart("request")  @Valid InstructorRequest request, @RequestPart(value = "avatar", required = false) MultipartFile file) {
        try{

            InstructorDTO createdInstructor = instructorService.signInstructor(request, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdInstructor);

        } catch (Exception e){
            log.error(e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInstructor(@PathVariable UUID id, @RequestPart("request") InstructorRequest request, @RequestPart(value = "avatar", required = false) MultipartFile avatar) {
        try {
            InstructorDTO updatedInstructor = instructorService.updateInstructor(id, request, avatar);
            return ResponseEntity.ok(updatedInstructor);
        }catch (Exception e){
            log.error(e.getMessage());
            e.printStackTrace();

            return  ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/getInstructors/byIdList")
    public ResponseEntity<?> findInsctructorsByIds(@RequestBody List<UUID> uuidList) {
        List<InstructorDTO> instructors = instructorService.getInstructorsByIdList(uuidList);
        return ResponseEntity.ok(instructors);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInstructor(@PathVariable UUID id) {
        boolean isDeleted = instructorService.deleteInstructor(id);
        return isDeleted ? ResponseEntity.noContent().build() : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}