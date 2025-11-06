package com.example.kafka.coursera.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@JsonIgnoreProperties
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PostDTO implements Serializable {
    private String id;
    private String title;
    private String content;
    private String type;

    private String authorId;
    private String authorName;
    private List<CommentDTO> commentList;
    private List<LikeDTO> likes;

    private String imageUrl;
}
