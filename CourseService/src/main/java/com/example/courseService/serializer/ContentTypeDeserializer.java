package com.example.courseService.serializer;

import com.example.courseService.enums.ContentType;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;

public class ContentTypeDeserializer extends JsonDeserializer<ContentType> {

    @Override
    public ContentType deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getText();
        if (value == null || value.isEmpty()) {
            return null; // Treat empty string as null
        }
        return ContentType.valueOf(value.toUpperCase()); // Parse the enum value
    }
}
