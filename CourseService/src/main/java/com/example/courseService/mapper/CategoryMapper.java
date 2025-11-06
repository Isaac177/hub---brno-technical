package com.example.courseService.mapper;

import com.example.courseService.dto.request.CategoryRequest;
import com.example.courseService.dto.response.CategoryDTO;
import com.example.courseService.model.Category;

public interface CategoryMapper {
    CategoryDTO toDTO(Category category);

    Category toEntity(CategoryRequest request, Category parentCategory);
}
