package maintenance_backend.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import maintenance_backend.example.demo.entity.MachineStatus;

@Data
public class MachineRequestDTO {
    private String name;
    private String serialNumber;
    private MachineStatus status;
    private Long clientId;
}
