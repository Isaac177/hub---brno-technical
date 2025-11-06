package com.example.kafka.coursera.db.entities;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = { "filename", "url" })
public class File {
    private String url;
    private String filename;
    private String checkSum;

    public boolean checkSumEquals(String otherChecksum) {
        if (otherChecksum == null && this.checkSum != null || otherChecksum != null && this.checkSum == null)
            return false;
        if (this.checkSum != null && !this.checkSum.equals(otherChecksum)) {
            return false;
        }
        return true;
    }
}
