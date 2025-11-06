package com.example.kafka.coursera.DTO.deserializers;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import java.io.IOException;
import java.time.LocalDateTime;

public class NestedDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {
    @Override
    public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        JsonNode node = p.getCodec().readTree(p);
        
        try {
            // Navigate through the nested arrays to get to the date components
            JsonNode dateArray = node;
            
            // First level: "java.util.Arrays$ArrayList"
            if (dateArray.isArray() && dateArray.size() >= 2) {
                dateArray = dateArray.get(1);
                
                // Second level: another ArrayList
                if (dateArray.isArray() && dateArray.size() >= 2) {
                    dateArray = dateArray.get(1);
                    
                    // Third level: final ArrayList containing the actual date components
                    if (dateArray.isArray() && dateArray.size() >= 2) {
                        dateArray = dateArray.get(1);
                    }
                }
            }
            
            // Now we should have the array with date components
            if (dateArray.isArray() && dateArray.size() >= 7) {
                return LocalDateTime.of(
                    dateArray.get(0).asInt(),  // year
                    dateArray.get(1).asInt(),  // month
                    dateArray.get(2).asInt(),  // day
                    dateArray.get(3).asInt(),  // hour
                    dateArray.get(4).asInt(),  // minute
                    dateArray.get(5).asInt(),  // second
                    dateArray.get(6).asInt()   // nanosecond
                );
            }
            
            throw new IOException("Invalid date array format: Expected array of 7 components but got: " + dateArray);
        } catch (Exception e) {
            throw new IOException("Failed to parse date from: " + node, e);
        }
    }
}
