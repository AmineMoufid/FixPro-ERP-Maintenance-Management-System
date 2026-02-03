package maintenance_backend.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import maintenance_backend.example.demo.entity.Role;

@Data
@AllArgsConstructor
public class UserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private Role role;
}
