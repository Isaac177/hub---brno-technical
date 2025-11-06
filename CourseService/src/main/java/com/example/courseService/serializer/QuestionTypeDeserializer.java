package com.example.courseService.serializer;

import com.example.courseService.enums.QuestionType;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;

public class QuestionTypeDeserializer extends JsonDeserializer<QuestionType> {

    @Override
    public QuestionType deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getText();
        if (value == null || value.isEmpty()) {
            return null; // Treat empty string as null
        }
        return QuestionType.valueOf(value.toUpperCase()); // Parse the enum value
    }
}
