package com.example.courseService.service.impl;

import com.example.courseService.dto.request.CategoryRequest;
import com.example.courseService.dto.response.CategoryDTO;
import com.example.courseService.exception.implementation.BadRequestException;
import com.example.courseService.mapper.CategoryMapper;
import com.example.courseService.model.Category;
import com.example.courseService.repository.CategoryRepository;
import com.example.courseService.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.javers.core.Javers;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public CategoryDTO createCategory(CategoryRequest request) {
        Category parentCategory = findParentCategory(request.getParentCategoryId());
        Category category = categoryMapper.toEntity(request, parentCategory);

        category.setId(UUID.randomUUID());
        return categoryMapper.toDTO(categoryRepository.save(category));
    }

    @Override
    public CategoryDTO updateCategory(UUID id, CategoryRequest request) {
        Category existingCategory = findCategoryById(id);

        Category parentCategory = findParentCategory(request.getParentCategoryId());
        Category newCategory = categoryMapper.toEntity(request, parentCategory);

        validateChanges(existingCategory, newCategory);
        newCategory.setId(id);

        return categoryMapper.toDTO(categoryRepository.save(newCategory));
    }

    @Override
    public CategoryDTO getCategoryById(UUID id) {
        return categoryMapper.toDTO(findCategoryById(id));
    }

    @Override
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteCategory(UUID id) {
        categoryRepository.deleteById(id);
    }

    private Category findCategoryById(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }

    private Category findParentCategory(UUID parentId) {
        return Optional.ofNullable(parentId)
                .flatMap(categoryRepository::findById)
                .orElse(null);
    }

    private void validateChanges(Category existingCategory, Category newCategory) {
        if (existingCategory.equals(newCategory)) {
            throw new BadRequestException("No changes detected. At least one field must be updated.");
        }
    }
}