package maintenance_backend.example.demo.dto;


import maintenance_backend.example.demo.entity.Status;
import lombok.Data;

@Data
public class InterventionTechnicianUpdateDTO {
    private Status status;
    private String description;
}
