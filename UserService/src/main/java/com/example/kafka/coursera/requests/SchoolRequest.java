package com.example.kafka.coursera.requests;

import com.example.kafka.coursera.db.enums.SchoolStatusEnum;
import com.fasterxml.jackson.annotation.JsonSetter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SchoolRequest {
    @NotBlank
    private String name;

    @Size(max = 2550)
    private String description;

    private String website;

    private int foundedYear;

    @NotBlank
    private String address;

    @NotBlank
    private String city;

    @NotBlank
    private String country;

    @NotBlank
    private String phoneNumber;

    private String email;

    private String primaryContactEmail;

    private SchoolStatusEnum status;

    @JsonSetter("status")
    public void setStatusFromString(String statusString) {
        if (statusString != null && !statusString.trim().isEmpty()) {
            try {
                this.status = SchoolStatusEnum.valueOf(statusString.toUpperCase());
                System.out.println("✅ Successfully converted status: " + statusString + " -> " + this.status);
            } catch (IllegalArgumentException e) {
                System.out.println("❌ Failed to convert status: " + statusString);
                this.status = null;
            }
        } else {
            this.status = null;
        }
    }

    public void setStatus(SchoolStatusEnum status) {
        this.status = status;
        System.out.println("✅ Set status directly: " + status);
    }
}
