package maintenance_backend.example.demo.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(org.springframework.security.config.annotation.web.builders.HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {}) // Uses corsConfigurationSource bean
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // ================= CORS =================
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ================= AUTH =================
                        .requestMatchers("/api/auth/**").permitAll()

                        // ================= USERS =================
                        .requestMatchers(HttpMethod.GET, "/api/users/**")
                        .hasAnyAuthority("ADMIN", "TECHNICIAN")
                        .requestMatchers("/api/users/**")
                        .hasAuthority("ADMIN")

                        // ================= MACHINES =================
                        .requestMatchers(HttpMethod.GET, "/api/machines/**")
                        .hasAnyAuthority("ADMIN", "TECHNICIAN")
                        .requestMatchers(HttpMethod.POST, "/api/machines/**")
                        .hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/machines/**")
                        .hasAnyAuthority("ADMIN", "TECHNICIAN")
                        .requestMatchers(HttpMethod.DELETE, "/api/machines/**")
                        .hasAuthority("ADMIN")

                        // ================= INTERVENTIONS =================

                        // Technician: only his interventions
                        .requestMatchers(HttpMethod.GET, "/api/interventions/my")
                        .hasAuthority("TECHNICIAN")

                        // Technician: update status & description
                        .requestMatchers(HttpMethod.PATCH, "/api/interventions/**")
                        .hasAuthority("TECHNICIAN")

                        // Admin: full access
                        .requestMatchers(HttpMethod.GET, "/api/interventions/**")
                        .hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/interventions/**")
                        .hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/interventions/**")
                        .hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/interventions/**")
                        .hasAuthority("ADMIN")

                        // ================= CLIENTS =================
                        .requestMatchers("/api/clients/**")
                        .hasAnyAuthority("ADMIN", "TECHNICIAN")

                        // ================= DEFAULT =================
                        .anyRequest().authenticated()
                )

                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ================= CORS =================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:5173"
        ));
        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // ================= AUTH =================
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
