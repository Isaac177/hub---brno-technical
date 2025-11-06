package com.example.courseService.model;

import org.javers.core.metamodel.annotation.TypeName;
import org.springframework.data.mongodb.core.mapping.DBRef;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@TypeName("Category")
@EqualsAndHashCode(exclude = "id")
public class Category {

    @Id
    private UUID id;

    private String name;

    private String description;

    @DBRef
    private Category parentCategory;
}
