package maintenance_backend.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import maintenance_backend.example.demo.entity.Priority;
import maintenance_backend.example.demo.entity.Status;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class InterventionResponseDTO {
    private Long id;
    private String description;
    private Priority priority;
    private Status status;
    private LocalDateTime createdAt;

    private Long machineId;
    private String machineName;

    private Long technicianId;
    private String technicianName;
}
