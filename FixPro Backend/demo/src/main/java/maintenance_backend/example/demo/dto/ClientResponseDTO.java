package maintenance_backend.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ClientResponseDTO {
    private Long id;
    private String companyName;
    private String address;
    private String phone;
}
