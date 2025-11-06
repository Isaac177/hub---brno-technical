//package com.example.courseService.service;
//
//import com.example.courseService.dto.request.TopicRequest;
//import com.example.courseService.dto.response.TopicDTO;
//import com.example.courseService.enums.ContentType;
//import com.example.courseService.exception.implementation.BadRequestException;
//import com.example.courseService.exception.implementation.NoChangesException;
//import com.example.courseService.mapper.TopicMapper;
//import com.example.courseService.model.Topic;
//import com.example.courseService.model.Syllabus;
//import com.example.courseService.repository.TopicRepository;
//import com.example.courseService.repository.SyllabusRepository;
//import com.example.courseService.service.impl.TopicServiceImpl;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//import org.springframework.context.MessageSource;
//import org.springframework.context.i18n.LocaleContextHolder;
//
//import java.util.List;
//import java.util.Locale;
//import java.util.Optional;
//import java.util.UUID;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//class TopicServiceImplTest {
//
//    @Mock
//    private TopicRepository topicRepository;
//
//    @Mock
//    private SyllabusRepository syllabusRepository;
//
//    @Mock
//    private TopicMapper topicMapper;
//
//    @Mock
//    private MessageSource messageSource;
//
//    @InjectMocks
//    private TopicServiceImpl lessonService;
//
//    private UUID sectionId;
//    private UUID lessonId;
//    private Topic topic;
//    private Syllabus syllabus;
//    private TopicRequest topicRequest;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.openMocks(this);
//
//        sectionId = UUID.randomUUID();
//        lessonId = UUID.randomUUID();
//
//        syllabus = new Syllabus();
//        syllabus.setId(sectionId);
//
//        topic = new Topic();
//        topic.setId(lessonId);
//        topic.setSyllabus(syllabus);
//
//        topicRequest = new TopicRequest();
//        topicRequest.setSectionId(sectionId);
//    }
//
//    @Test
//    void testCreateTopic_Success() {
//        when(syllabusRepository.findById(sectionId)).thenReturn(Optional.of(syllabus));
//        when(topicMapper.toLesson(any(TopicRequest.class), any(Syllabus.class))).thenReturn(topic);
//        when(topicRepository.save(any(Topic.class))).thenReturn(topic);
//
//        Topic createdTopic = lessonService.createTopic(topicRequest);
//
//        assertNotNull(createdTopic);
//        verify(syllabusRepository, times(1)).findById(sectionId);
//        verify(topicRepository, times(1)).save(topic);
//    }
//
//    @Test
//    void testUpdateTopic_Success() {
//        Locale locale = Locale.ENGLISH;
//        LocaleContextHolder.setLocale(locale);
//
//        topicRequest.setContentType(ContentType.VIDEO);
//
//        Topic updatedTopic = new Topic();
//        updatedTopic.setId(lessonId);
//        updatedTopic.setSyllabus(syllabus);
//        updatedTopic.setContentType(ContentType.VIDEO);
//
//        when(topicRepository.findById(lessonId)).thenReturn(Optional.of(topic));
//        when(syllabusRepository.findById(sectionId)).thenReturn(Optional.of(syllabus));
//        when(topicMapper.toLesson(any(TopicRequest.class), any(Syllabus.class))).thenReturn(updatedTopic);
//        when(topicRepository.save(any(Topic.class))).thenReturn(updatedTopic);
//        when(messageSource.getMessage(anyString(), any(), eq(locale))).thenReturn("No changes detected");
//
//        Topic result = lessonService.updateTopic(topicRequest, lessonId);
//
//        assertNotNull(result);
//        assertEquals(lessonId, result.getId());
//        verify(topicRepository, times(1)).findById(lessonId);
//        verify(syllabusRepository, times(1)).findById(sectionId);
//        verify(topicRepository, times(1)).save(updatedTopic);
//    }
//
//    @Test
//    void testUpdateTopic_NoChanges() {
//        Locale locale = Locale.ENGLISH;
//        LocaleContextHolder.setLocale(locale);
//
//        when(topicRepository.findById(lessonId)).thenReturn(Optional.of(topic));
//        when(syllabusRepository.findById(sectionId)).thenReturn(Optional.of(syllabus));
//        when(topicMapper.toLesson(any(TopicRequest.class), any(Syllabus.class))).thenReturn(topic);
//        when(messageSource.getMessage(anyString(), any(), eq(locale))).thenReturn("No changes detected");
//
//        NoChangesException exception = assertThrows(NoChangesException.class, () ->
//                lessonService.updateTopic(topicRequest, lessonId));
//
//        assertEquals("No changes detected", exception.getMessage());
//        verify(topicRepository, times(1)).findById(lessonId);
//        verify(syllabusRepository, times(1)).findById(sectionId);
//    }
//
//    @Test
//    void testGetTopicById_Success() {
//
//        when(topicRepository.findById(lessonId)).thenReturn(Optional.of(topic));
//        when(topicMapper.toTopicDTO(any(Topic.class), any(Locale.class))).thenReturn(new TopicDTO());
//
//        TopicDTO result = lessonService.getTopicById(lessonId);
//
//        assertNotNull(result);
//        verify(topicRepository, times(1)).findById(lessonId);
//    }
//
//    @Test
//    void testGetTopicById_NotFound() {
//        when(topicRepository.findById(lessonId)).thenReturn(Optional.empty());
//
//        assertThrows(BadRequestException.class, () -> lessonService.getTopicById(lessonId));
//    }
//
//    @Test
//    void testGetAllTopics() {
//        when(topicRepository.findAll()).thenReturn(List.of(topic));
//        when(topicMapper.toTopicDTO(any(Topic.class), any(Locale.class))).thenReturn(new TopicDTO());
//
//        List<TopicDTO> result = lessonService.getAllTopics();
//
//        assertNotNull(result);
//        assertEquals(1, result.size());
//        verify(topicRepository, times(1)).findAll();
//    }
//
//    @Test
//    void testDeleteTopic_Success() {
//        doNothing().when(topicRepository).deleteById(lessonId);
//
//        lessonService.deleteTopic(lessonId);
//
//        verify(topicRepository, times(1)).deleteById(lessonId);
//    }
//}
