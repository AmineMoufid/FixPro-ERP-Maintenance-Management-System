package maintenance_backend.example.demo.service;

import lombok.RequiredArgsConstructor;
import maintenance_backend.example.demo.config.JwtUtils;
import maintenance_backend.example.demo.dto.LoginRequest;
import maintenance_backend.example.demo.dto.LoginResponse;
import maintenance_backend.example.demo.entity.User;
import maintenance_backend.example.demo.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;



@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtils.generateToken(user.getEmail());
        return new LoginResponse(token, user.getRole().name());
    }
}
