//package com.example.courseService.service;
//
//import com.example.courseService.dto.request.AssignmentRequest;
//import com.example.courseService.dto.response.AssignmentDTO;
//import com.example.courseService.exception.implementation.ResourceNotFoundException;
//import com.example.courseService.mapper.AssignmentMapper;
//import com.example.courseService.model.Syllabus;
//import com.example.courseService.repository.AssignmentRepository;
//import com.example.courseService.repository.SyllabusRepository;
//import com.example.courseService.service.impl.AssignmentServiceImpl;
//import lombok.extern.slf4j.Slf4j;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//import org.springframework.context.MessageSource;
//import com.example.courseService.model.Assignment;
//
//import java.util.Collections;
//import java.util.List;
//import java.util.Optional;
//import java.util.UUID;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.*;
//
//@Slf4j
//public class AssignmentServiceImplTest {
//
//    @Mock
//    private AssignmentRepository assignmentRepository;
//
//    @Mock
//    private SyllabusRepository syllabusRepository;
//
//    @Mock
//    private MessageSource messageSource;
//
//    @Mock
//    private AssignmentMapper assignmentMapper;
//
//    @InjectMocks
//    private AssignmentServiceImpl assignmentService;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.openMocks(this);
//    }
//
//    @Test
//    public void createAssignment_Success() {
//        AssignmentRequest assignmentRequest = new AssignmentRequest();
//        assignmentRequest.setSectionId(UUID.randomUUID());
//        Assignment mockAssignment = new Assignment();
//        mockAssignment.setId(UUID.randomUUID());
//
//        Syllabus mockSyllabus = new Syllabus();
//        mockSyllabus.setId(assignmentRequest.getSectionId());
//
//        when(syllabusRepository.findById(assignmentRequest.getSectionId())).thenReturn(Optional.of(mockSyllabus));
//        when(assignmentMapper.toEntity(any(), any())).thenReturn(mockAssignment);
//        when(assignmentRepository.save(any(Assignment.class))).thenReturn(mockAssignment);
//        when(assignmentMapper.toResponse(mockAssignment)).thenReturn(AssignmentDTO.builder().id(mockAssignment.getId()).build());
//
//        AssignmentDTO response = assignmentService.createAssignment(assignmentRequest);
//
//        verify(assignmentRepository).save(any(Assignment.class));
//        assertNotNull(response);
//        log.info("Assignment creation test passed.");
//    }
//
//    @Test
//    public void findById_Success() {
//        UUID assignmentId = UUID.randomUUID();
//        Assignment mockAssignment = new Assignment();
//        mockAssignment.setId(assignmentId);
//
//        when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(mockAssignment));
//        when(assignmentMapper.toResponse(mockAssignment)).thenReturn(new AssignmentDTO());
//
//        AssignmentDTO response = assignmentService.getAssignmentById(assignmentId);
//
//        assertNotNull(response);
//        verify(assignmentRepository).findById(assignmentId);
//        log.info("Find by ID test passed.");
//    }
//
//    @Test
//    public void findById_NotFound() {
//        UUID assignmentId = UUID.randomUUID();
//        when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.empty());
//
//        Exception exception = assertThrows(ResourceNotFoundException.class, () -> {
//            assignmentService.getAssignmentById(assignmentId);
//        });
//        assertNotNull(exception);
//        verify(assignmentRepository).findById(assignmentId);
//    }
//
//    @Test
//    public void updateAssignment_Success() {
//        UUID assignmentId = UUID.randomUUID();
//        AssignmentRequest assignmentRequest = new AssignmentRequest();
//        assignmentRequest.setSectionId(UUID.randomUUID());
//        assignmentRequest.setTitle("test");
//
//        Assignment existingAssignment = new Assignment();
//        existingAssignment.setId(assignmentId);
//
//        Syllabus mockSyllabus = new Syllabus();
//        mockSyllabus.setId(assignmentRequest.getSectionId());
//
//        when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(existingAssignment));
//        when(syllabusRepository.findById(assignmentRequest.getSectionId())).thenReturn(Optional.of(mockSyllabus));
//        when(assignmentMapper.toEntity(any(), any())).thenReturn(com.example.courseService.model.Assignment.builder().id(assignmentId).title("test").build());
//        when(assignmentRepository.save(any(Assignment.class))).thenReturn(existingAssignment);
//        when(assignmentMapper.toResponse(existingAssignment)).thenReturn(new AssignmentDTO());
//
//        AssignmentDTO response = assignmentService.updateAssignment(assignmentId, assignmentRequest);
//
//        verify(assignmentRepository).save(any(Assignment.class));
//        assertNotNull(response);
//    }
//
//    @Test
//    public void updateAssignment_NotFound() {
//        UUID assignmentId = UUID.randomUUID();
//        AssignmentRequest assignmentRequest = new AssignmentRequest();
//        assignmentRequest.setSectionId(UUID.randomUUID());
//
//        when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.empty());
//
//        Exception exception = assertThrows(ResourceNotFoundException.class, () -> {
//            assignmentService.updateAssignment(assignmentId, assignmentRequest);
//        });
//        assertNotNull(exception);
//        verify(assignmentRepository).findById(assignmentId);
//    }
//
//    @Test
//    public void deleteAssignment_Success() {
//        UUID assignmentId = UUID.randomUUID();
//        Assignment mockAssignment = new Assignment();
//        mockAssignment.setId(assignmentId);
//
//        when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(mockAssignment));
//
//        assignmentService.deleteAssignment(assignmentId);
//
//        verify(assignmentRepository).deleteById(assignmentId);
//    }
//
//
//    @Test
//    public void findAll_Success() {
//        Assignment mockAssignment = new Assignment();
//        when(assignmentRepository.findAll()).thenReturn(Collections.singletonList(mockAssignment));
//        when(assignmentMapper.toResponse(mockAssignment)).thenReturn(new AssignmentDTO());
//
//        List<AssignmentDTO> responses = assignmentService.getAllAssignments();
//
//        assertEquals(1, responses.size());
//        verify(assignmentRepository).findAll();
//    }
//}