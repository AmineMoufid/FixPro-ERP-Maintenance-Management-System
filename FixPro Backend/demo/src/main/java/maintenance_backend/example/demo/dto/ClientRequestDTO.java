package maintenance_backend.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class ClientRequestDTO {
    private String companyName;
    private String address;
    private String phone;
}