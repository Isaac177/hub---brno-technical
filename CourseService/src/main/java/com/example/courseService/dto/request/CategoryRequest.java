package com.example.courseService.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryRequest {

    @NotBlank(message = "{categoryRequest.name.notBlank}")
    private String name;

    @NotBlank(message = "{categoryRequest.description.notBlank}")
    private String description;

    private UUID parentCategoryId;
}
