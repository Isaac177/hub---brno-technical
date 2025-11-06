package com.example.kafka.coursera.DTO.deserializers;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import java.io.IOException;

public class NestedValueDeserializer extends JsonDeserializer<Object> {
    @Override
    public Object deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        JsonNode node = p.getCodec().readTree(p);
        if (node.isArray()) {
            JsonNode lastNode = node;
            while (lastNode.isArray() && lastNode.size() >= 2) {
                lastNode = lastNode.get(1);
            }
            
            if (lastNode.isNumber()) {
                if (lastNode.isLong() || lastNode.isBigInteger()) {
                    return lastNode.asLong();
                } else if (lastNode.isInt()) {
                    return lastNode.asInt();
                } else {
                    return lastNode.asDouble();
                }
            }
            return lastNode.asText();
        }
        
        if (node.isNumber()) {
            if (node.isLong() || node.isBigInteger()) {
                return node.asLong();
            } else if (node.isInt()) {
                return node.asInt();
            } else {
                return node.asDouble();
            }
        }
        return node.asText();
    }
}
