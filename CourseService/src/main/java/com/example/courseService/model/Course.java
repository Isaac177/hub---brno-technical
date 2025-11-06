package com.example.courseService.model;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import com.example.courseService.enums.Language;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "courses")
@EqualsAndHashCode(exclude = { "id", "createdAt", "updatedAt", "featuredImage", "thumbnail" })
public class Course {

    @Id
    private UUID id;

    private String title;
    private String description;
    private String longDescription;

    private UUID schoolId;
    private UUID categoryId;

    private Language language;
    private List<Language> subtitles;

    private File featuredImage;
    private File thumbnail;

    private List<String> tags;
    private List<String> requirements;
    private List<String> learningObjectives;

    @DBRef
    private List<Module> syllabus;
    private List<UUID> instructors;

    @Field("createdAt")
    @CreatedDate
    private Date createdAt;

    @Field("updatedAt")
    @LastModifiedDate
    private Date updatedAt;

    private BigDecimal price;
    private Integer durationInWeeks;

    private transient double similarityScore;

    public boolean featuredImageEquals(File otherImage) {
        if (otherImage == null && this.featuredImage != null || otherImage != null && this.featuredImage == null)
            return false;
        if (this.featuredImage != null && !this.featuredImage.getCheckSum().equals(otherImage.getCheckSum())) {
            return false;
        }
        return true;
    }
}