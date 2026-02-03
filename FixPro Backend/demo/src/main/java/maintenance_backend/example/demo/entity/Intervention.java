package maintenance_backend.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Intervention {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    private Status status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="machine_id")
    @JsonIgnoreProperties({"interventions", "client"})
    private Machine machine;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="technician_id")
    private User technician;

    private LocalDateTime createdAt = LocalDateTime.now();
}
