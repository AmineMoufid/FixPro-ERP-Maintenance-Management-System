package maintenance_backend.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import maintenance_backend.example.demo.entity.Priority;
import maintenance_backend.example.demo.entity.Status;

import java.time.LocalDateTime;

@Data
public class InterventionRequestDTO {
    private String description;
    private Priority priority;
    private Status status;
    private Long machineId;
    private Long technicianId; // optional at creation
}
