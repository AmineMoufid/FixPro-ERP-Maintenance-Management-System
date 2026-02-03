package maintenance_backend.example.demo.service;

import lombok.RequiredArgsConstructor;
import maintenance_backend.example.demo.dto.UserRequestDTO;
import maintenance_backend.example.demo.dto.UserResponseDTO;
import maintenance_backend.example.demo.entity.User;
import maintenance_backend.example.demo.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponseDTO create(UserRequestDTO dto) {
        User user = new User();

        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setRole(dto.getRole());
        user.setPassword(passwordEncoder.encode(dto.getPassword())); // 🔐 IMPORTANT

        return toDTO(userRepository.save(user));
    }

    public List<UserResponseDTO> getAll() {
        return userRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public void delete(Long id) {
        userRepository.deleteById(id);
    }

    private UserResponseDTO toDTO(User u) {
        return new UserResponseDTO(
                u.getId(),
                u.getName(),
                u.getEmail(),
                u.getRole()
        );
    }
}
