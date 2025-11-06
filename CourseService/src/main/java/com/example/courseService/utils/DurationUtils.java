package com.example.courseService.utils;

import java.time.Duration;

public class DurationUtils {
    public static Duration string2Duration(String duration){
        String[] timeParts = duration.trim().split(":");
        long hours = Long.parseLong(timeParts[0]);
        long minutes = Long.parseLong(timeParts[1]);
        long seconds = (timeParts.length > 2) ? Long.parseLong(timeParts[2]) : 0;

        return Duration.ofHours(hours)
                .plusMinutes(minutes)
                .plusSeconds(seconds);
    }

    public static String duration2String(Duration duration){
        long hours = duration.toHours();
        long minutes = duration.minusHours(hours).toMinutes();
        long seconds = duration.minusHours(hours).minusMinutes(minutes).getSeconds();

        // Format as "HH:mm:ss"
        return String.format("%02d:%02d:%02d", hours, minutes, seconds);
    }
}
