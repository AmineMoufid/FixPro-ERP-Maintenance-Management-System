package maintenance_backend.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import maintenance_backend.example.demo.entity.MachineStatus;

@Data
@AllArgsConstructor
public class MachineResponseDTO {
    private Long id;
    private String name;
    private String serialNumber;
    private MachineStatus status;

    private Long clientId;
    private String clientName;
}
