package com.example.courseService.service.impl;

import com.example.courseService.dto.request.AssignmentRequest;
import com.example.courseService.dto.response.AssignmentDTO;
import com.example.courseService.exception.implementation.BadRequestException;
import com.example.courseService.exception.implementation.ResourceNotFoundException;
import com.example.courseService.mapper.AssignmentMapper;
import com.example.courseService.model.Assignment;
import com.example.courseService.model.Module;
import com.example.courseService.repository.AssignmentRepository;
import com.example.courseService.repository.ModuleRepository;
import com.example.courseService.service.AssignmentService;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentServiceImpl implements AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentMapper assignmentMapper;
    private final ModuleRepository moduleRepository;
    private final MessageSource messageSource;

    @Override
    public AssignmentDTO createAssignment(AssignmentRequest request) {
        Module module = findSectionById(request.getSectionId());
        Assignment assignment = assignmentMapper.toEntity(request, module);
        assignment.setId(UUID.randomUUID());
        assignment = assignmentRepository.save(assignment);
        return assignmentMapper.toResponse(assignment);
    }

    @Override
    public AssignmentDTO getAssignmentById(UUID id) {
        Assignment assignment = findAssignmentById(id);
        return assignmentMapper.toResponse(assignment);
    }

    @Override
    public List<AssignmentDTO> getAllAssignments() {
        return assignmentRepository.findAll().stream()
                .map(assignmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AssignmentDTO updateAssignment(UUID id, AssignmentRequest request) {
        Assignment existingAssignment = findAssignmentById(id);
        Module module = findSectionById(request.getSectionId());

        Assignment updatedAssignment = assignmentMapper.toEntity(request, module);
        updatedAssignment.setId(id);

        if (!hasChanges(existingAssignment, updatedAssignment)) {
            throw new BadRequestException("No changes to update");
        }

        existingAssignment = assignmentRepository.save(updatedAssignment);
        return assignmentMapper.toResponse(existingAssignment);
    }

    @Override
    public void deleteAssignment(UUID id) {
        assignmentRepository.deleteById(id);
    }

    private Module findSectionById(UUID sectionId) {
        return moduleRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageSource.getMessage("section.notfound", new Object[]{sectionId}, LocaleContextHolder.getLocale())));
    }

    private Assignment findAssignmentById(UUID id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
    }

    private boolean hasChanges(Assignment existingAssignment, Assignment updatedAssignment) {
        return !existingAssignment.equals(updatedAssignment);
    }
}