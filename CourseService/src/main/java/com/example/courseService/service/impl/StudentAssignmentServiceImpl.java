package com.example.courseService.service.impl;

import com.example.courseService.dto.request.StudentAssignmentRequest;
import com.example.courseService.dto.response.StudentAssignmentDTO;
import com.example.courseService.model.Assignment;
import com.example.courseService.model.File;
import com.example.courseService.model.StudentAssignment;
import com.example.courseService.repository.AssignmentRepository;
import com.example.courseService.repository.StudentAssignmentRepository;
import com.example.courseService.exception.implementation.BadRequestException;
import com.example.courseService.exception.implementation.NoChangesException;
import com.example.courseService.exception.implementation.ResourceNotFoundException;
import com.example.courseService.mapper.StudentAssignmentMapper;
import com.example.courseService.service.StorageService;
import com.example.courseService.service.StudentAssignmentService;
import com.example.courseService.utils.HashChecksum;

import lombok.RequiredArgsConstructor;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentAssignmentServiceImpl implements StudentAssignmentService {

    private final StudentAssignmentRepository repository;
    private final StudentAssignmentMapper mapper;
    private final AssignmentRepository assignmentRepository;
    private final MessageSource messageSource;
    private final StorageService blobService;

    @Override
    public List<StudentAssignmentDTO> getAllAssignments() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public StudentAssignmentDTO getAssignmentById(UUID id) {
        StudentAssignment assignment = getStudentAssignmentById(id);
        return mapper.toResponse(assignment);
    }

    @Override
    public List<StudentAssignmentDTO> getAssignmentsByLessonId(UUID assignmentId) {
        return repository.findByAssignmentId(assignmentId).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StudentAssignmentDTO createAssignment(StudentAssignmentRequest request, MultipartFile file) {
        validateAssignmentDoesNotExist(request);

        Assignment assignment = getAssignmentByIdRepo(request.getAssignmentId());
        File file2save = uploadFile(file);

        StudentAssignment studentAssignment = createNewStudentAssignment(request, assignment, file2save);
        return mapper.toResponse(repository.save(studentAssignment));
    }

    @Override
    @Transactional
    public StudentAssignmentDTO updateAssignment(UUID id, StudentAssignmentRequest request, MultipartFile file) {
        StudentAssignment existingAssignment = getStudentAssignmentById(id);
        Assignment assignment = existingAssignment.getAssignment();

        validateAttempts(existingAssignment);

        File updatedFile = processFileUpdate(file, existingAssignment);

        StudentAssignment updatedAssignment = updateAssignmentEntity(existingAssignment, request, assignment, updatedFile);

        if (!existingAssignment.equals(updatedAssignment)) {
            throw new NoChangesException(messageSource, LocaleContextHolder.getLocale());
        }

        return mapper.toResponse(repository.save(updatedAssignment));
    }

    @Override
    @Transactional
    public void deleteAssignment(UUID id) {
        StudentAssignment assignment = getStudentAssignmentById(id);
        blobService.deleteFile(assignment.getFile().getName());
        repository.deleteById(id);
    }

    private StudentAssignment getStudentAssignmentById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StudentAssignment not found"));
    }

    private Assignment getAssignmentByIdRepo(UUID assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment with this id not found"));
    }

    private void validateAssignmentDoesNotExist(StudentAssignmentRequest request) {
        if (repository.findAssignmentByStudentIdAndAssignmentId(request.getStudentId(), request.getAssignmentId()) != null) {
            throw new BadRequestException(messageSource.getMessage("studentAssignment.alreadyCreated",
                    new Object[]{request.getStudentId()}, LocaleContextHolder.getLocale()));
        }
    }

    private void validateAttempts(StudentAssignment existingAssignment) {
        if (existingAssignment.getAssignment().getAttempts() - existingAssignment.getAttempts() <= 0) {
            throw new BadRequestException("No attempts left");
        }
    }

    private File uploadFile(MultipartFile file) {
        try {
            return blobService.uploadFile(file);
        } catch (Exception e) {
            throw new RuntimeException("File upload failed", e);
        }
    }

    private File processFileUpdate(MultipartFile file, StudentAssignment existingAssignment) {
        if (file == null) {
            deleteFileIfPresent(existingAssignment.getFile());
            return existingAssignment.getFile();
        }

        try {
            String newChecksum = HashChecksum.calculateFileChecksum(file);
            File existingFile = existingAssignment.getFile();

            if (existingFile != null && existingFile.checkSumEquals(newChecksum)) {
                return existingFile;
            }

            deleteFileIfPresent(existingFile);
            return blobService.uploadFile(file);

        } catch (Exception e) {
            throw new RuntimeException("File update failed", e);
        }
    }

    private void deleteFileIfPresent(File file) {
        if (file != null) {
            blobService.deleteFile(file.getName());
        }
    }

    private StudentAssignment createNewStudentAssignment(StudentAssignmentRequest request, Assignment assignment, File file) {
        StudentAssignment studentAssignment = mapper.toEntity(request, assignment);
        studentAssignment.setId(UUID.randomUUID());
        studentAssignment.setAttempts(1);
        studentAssignment.setChecked(false);
        studentAssignment.setPoints(null);
        studentAssignment.setFile(file);
        return studentAssignment;
    }

    private StudentAssignment updateAssignmentEntity(StudentAssignment existingAssignment, StudentAssignmentRequest request,
                                                     Assignment assignment, File file) {
        StudentAssignment updatedAssignment = mapper.toEntity(request, assignment);
        updatedAssignment.setId(existingAssignment.getId());
        updatedAssignment.setAssignment(assignment);
        updatedAssignment.setStudentId(existingAssignment.getStudentId());
        updatedAssignment.setPoints(existingAssignment.getPoints());
        updatedAssignment.setFile(file);
        updatedAssignment.setAttempts(existingAssignment.getAttempts() + 1);
        return updatedAssignment;
    }
}