package com.example.courseService.model;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.DBRef;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"id", "course"})
public class Module {
    @Id
    private UUID id;

    private String title;
    private Duration duration;

    private String thumbnailUrl;

    @DBRef(lazy = false)
    @JsonIgnore
    private Course course;


    @OneToMany(fetch = FetchType.EAGER)
    private List<Topic> topics;

    /**
     * Sets the topics for the module and calculates the total duration in HH:mm:ss format.
     *
     * @param topics the list of topics to set
     */
    public void setTopics(List<Topic> topics) {
        this.topics = topics;

        // Calculate total duration
        if (topics != null && !topics.isEmpty()) {
            this.duration = topics.stream()
                    .map(Topic::getDuration)
                    .filter(duration -> duration != null) // Ignore null durations
                    .reduce(Duration.ZERO, Duration::plus);
        } else {
            this.duration = Duration.ZERO; // Default to zero if no topics
        }
    }

    /**
     * Returns the module duration formatted as HH:mm:ss.
     *
     * @return duration in HH:mm:ss format
     */
    public String getFormattedDuration() {
        if (this.duration == null) {
            return "00:00:00"; // Default value
        }

        long hours = this.duration.toHours();
        long minutes = this.duration.toMinutesPart();
        long seconds = this.duration.toSecondsPart();

        return String.format("%02d:%02d:%02d", hours, minutes, seconds);
    }
}