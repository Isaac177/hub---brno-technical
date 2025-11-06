package com.example.courseService.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = { "name", "url" })
public class File {
    private String url;
    private String name;
    private String checkSum;
    private String key;
    private FileType type;
    private long size;

    public boolean checkSumEquals(String otherChecksum) {
        if (otherChecksum == null && this.checkSum != null || otherChecksum != null && this.checkSum == null)
            return false;
        if (this.checkSum != null && !this.checkSum.equals(otherChecksum)) {
            return false;
        }
        return true;
    }
}
