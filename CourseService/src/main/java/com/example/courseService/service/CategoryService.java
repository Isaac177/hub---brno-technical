package com.example.courseService.service;


import com.example.courseService.dto.request.CategoryRequest;
import com.example.courseService.dto.response.CategoryDTO;

import java.util.List;
import java.util.UUID;

public interface CategoryService {

    CategoryDTO createCategory(CategoryRequest request);

    CategoryDTO updateCategory(UUID id, CategoryRequest request);

    CategoryDTO getCategoryById(UUID id);

    List<CategoryDTO> getAllCategories();

    void deleteCategory(UUID id);
}
