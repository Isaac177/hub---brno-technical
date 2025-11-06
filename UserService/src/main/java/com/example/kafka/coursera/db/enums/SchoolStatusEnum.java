package com.example.kafka.coursera.db.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum SchoolStatusEnum {
    PENDING, APPROVED, REJECTED;

    @JsonValue
    public String toValue() {
        return this.name();
    }

    @JsonCreator
    public static SchoolStatusEnum fromValue(String value) {
        if (value == null) {
            return null;
        }
        try {
            return SchoolStatusEnum.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status value: " + value);
        }
    }
}
