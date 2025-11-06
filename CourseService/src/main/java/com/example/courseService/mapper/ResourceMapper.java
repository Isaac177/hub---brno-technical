package com.example.courseService.mapper;

import com.example.courseService.dto.request.ResourceRequest;
import com.example.courseService.dto.response.ResourceDTO;
import com.example.courseService.model.Topic;
import com.example.courseService.model.Resource;

import java.util.List;

public interface ResourceMapper {
    Resource toResource(ResourceRequest request, Topic topic);

    ResourceDTO toResourceDTO(Resource resource);

    List<ResourceDTO> toResourceResponseDTOList(List<Resource> resources);
}
