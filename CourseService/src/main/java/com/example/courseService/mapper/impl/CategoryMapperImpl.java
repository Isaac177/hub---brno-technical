package com.example.courseService.mapper.impl;

import com.example.courseService.dto.request.CategoryRequest;
import com.example.courseService.dto.response.CategoryDTO;
import com.example.courseService.mapper.CategoryMapper;
import com.example.courseService.model.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapperImpl implements CategoryMapper {
    @Override
    public CategoryDTO toDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .parentCategoryId(category.getParentCategory() != null ? category.getParentCategory().getId() : null)
                .build();
    }
    @Override
    public Category toEntity(CategoryRequest request, Category parentCategory) {
        return Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .parentCategory(parentCategory)
                .build();
    }
}
