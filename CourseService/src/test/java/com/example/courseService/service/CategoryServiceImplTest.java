//package com.example.courseService.service;
//
//
//import com.example.courseService.dto.request.CategoryRequest;
//import com.example.courseService.dto.response.CategoryDTO;
//import com.example.courseService.exception.implementation.BadRequestException;
//import com.example.courseService.mapper.CategoryMapper;
//import com.example.courseService.model.Category;
//import com.example.courseService.repository.CategoryRepository;
//import com.example.courseService.service.impl.CategoryServiceImpl;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.ArgumentCaptor;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//
//import java.util.List;
//import java.util.Optional;
//import java.util.UUID;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class CategoryServiceImplTest {
//
//    @Mock
//    private CategoryRepository categoryRepository;
//
//    @Mock
//    private CategoryMapper categoryMapper;
//
//    @InjectMocks
//    private CategoryServiceImpl categoryService;
//
//    private CategoryRequest categoryRequest;
//    private Category category;
//    private Category categoryParent;
//    private CategoryDTO categoryDTO;
//
//    @BeforeEach
//    void setUp() {
//        categoryRequest = new CategoryRequest();
//        categoryRequest.setParentCategoryId(UUID.randomUUID()); // Set appropriate values
//
//        category = new Category();
//        category.setId(UUID.randomUUID()); // Set appropriate values
//
//        categoryDTO = new CategoryDTO();
//
//        categoryParent = new Category();
//        categoryParent.setId(categoryRequest.getParentCategoryId());
//
//        categoryDTO.setId(categoryRequest.getParentCategoryId());
//    }
//
//    @Test
//    void testCreateCategory() {
//        when(categoryMapper.toEntity(any(), any())).thenReturn(category);
//        when(categoryRepository.save(any(Category.class))).thenReturn(category);
//        when(categoryMapper.toDTO(any(Category.class))).thenReturn(categoryDTO);
//
//        CategoryDTO result = categoryService.createCategory(categoryRequest);
//
//        assertNotNull(result);
//        verify(categoryRepository).save(any(Category.class));
//    }
//
//    @Test
//    void testUpdateCategory() {
//        UUID id = UUID.randomUUID();
//        category.setId(id);
//
//        CategoryRequest updatedRequest = new CategoryRequest();
//        updatedRequest.setName("test"); // Set appropriate values
//
//        Category updatedCategory = new Category();
//        updatedCategory.setId(id);
//        updatedCategory.setName("test");
//
//        CategoryDTO updatedCategoryDTO = new CategoryDTO();
//        updatedCategoryDTO.setId(id);
//        updatedCategoryDTO.setName("test");
//
//        when(categoryRepository.findById(id)).thenReturn(Optional.of(category));
//        when(categoryMapper.toEntity(any(), any())).thenReturn(updatedCategory);
//        when(categoryMapper.toDTO(any(Category.class))).thenReturn(updatedCategoryDTO);
//        when(categoryRepository.save(any(Category.class))).thenReturn(updatedCategory);
//
//        CategoryDTO result = categoryService.updateCategory(id, updatedRequest);
//
//        assertNotNull(result);
//        verify(categoryRepository).save(any(Category.class));
//    }
//
//    @Test
//    void testGetCategoryById() {
//        UUID id = UUID.randomUUID();
//        when(categoryRepository.findById(id)).thenReturn(Optional.of(category));
//        when(categoryMapper.toDTO(any(Category.class))).thenReturn(categoryDTO);
//
//        CategoryDTO result = categoryService.getCategoryById(id);
//
//        assertNotNull(result);
//        verify(categoryRepository).findById(id);
//    }
//
//    @Test
//    void testGetAllCategories() {
//        List<Category> categories = List.of(category);
//        when(categoryRepository.findAll()).thenReturn(categories);
//        when(categoryMapper.toDTO(any(Category.class))).thenReturn(categoryDTO);
//
//        List<CategoryDTO> result = categoryService.getAllCategories();
//
//        assertFalse(result.isEmpty());
//        verify(categoryRepository).findAll();
//    }
//
//    @Test
//    void testDeleteCategory() {
//        UUID id = UUID.randomUUID();
//        doNothing().when(categoryRepository).deleteById(id);
//
//        categoryService.deleteCategory(id);
//
//        verify(categoryRepository).deleteById(id);
//    }
//
//    @Test
//    void testCreateCategoryThrowsExceptionWhenCategoryNotFound() {
//        when(categoryMapper.toEntity(any(CategoryRequest.class), any(Category.class))).thenThrow(new RuntimeException("Category not found"));
//
//        assertThrows(RuntimeException.class, () -> categoryService.createCategory(categoryRequest));
//    }
//
//    @Test
//    void testUpdateCategoryThrowsExceptionWhenNoChangesDetected() {
//        UUID id = UUID.randomUUID();
//
//        when(categoryRepository.findById(id)).thenReturn(Optional.of(category));
//        when(categoryRepository.findById(categoryRequest.getParentCategoryId())).thenReturn(Optional.of(categoryParent));
//        when(categoryMapper.toEntity(any(), any())).thenReturn(category);
//
//        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
//            categoryService.updateCategory(id, categoryRequest);
//        });
//
//        assertEquals("No changes detected. At least one field must be updated.", exception.getMessage());
//    }
//}