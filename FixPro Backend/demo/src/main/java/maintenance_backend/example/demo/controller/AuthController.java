package maintenance_backend.example.demo.controller;

import lombok.RequiredArgsConstructor;
import maintenance_backend.example.demo.config.JwtUtils;
import maintenance_backend.example.demo.dto.LoginRequest;
import maintenance_backend.example.demo.dto.LoginResponse;
import maintenance_backend.example.demo.entity.User;
import maintenance_backend.example.demo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).build();
        }

        String token = jwtUtils.generateToken(user.getEmail());
        return ResponseEntity.ok(new LoginResponse(token, user.getRole().name()));
    }
}
