package maintenance_backend.example.demo.controller;

import maintenance_backend.example.demo.dto.*;
import maintenance_backend.example.demo.entity.Intervention;
import maintenance_backend.example.demo.entity.Role;
import maintenance_backend.example.demo.entity.User;
import maintenance_backend.example.demo.service.InterventionService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interventions")
@RequiredArgsConstructor
public class InterventionController {

    private final InterventionService interventionService;

    // ================= ADMIN =================

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InterventionResponseDTO> create(
            @RequestBody InterventionRequestDTO dto) {
        return ResponseEntity.ok(interventionService.create(dto));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InterventionResponseDTO>> getAll() {
        return ResponseEntity.ok(interventionService.getAll());
    }

    @GetMapping("/technician/{technicianId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InterventionResponseDTO>> getByTechnician(
            @PathVariable Long technicianId) {
        return ResponseEntity.ok(
                interventionService.getByTechnician(technicianId)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InterventionResponseDTO> adminUpdate(
            @PathVariable Long id,
            @RequestBody InterventionRequestDTO dto) {
        return ResponseEntity.ok(interventionService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        interventionService.delete(id);
        return ResponseEntity.ok("Intervention deleted");
    }

    // ================= ADMIN + TECHNICIAN =================

    @GetMapping("/{id}")
    public ResponseEntity<InterventionResponseDTO> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        InterventionResponseDTO dto = interventionService.getById(id)
                .orElseThrow(() -> new RuntimeException("Intervention not found"));

        if (user.getRole() == Role.TECHNICIAN &&
                !dto.getTechnicianId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(dto);
    }

    // ================= TECHNICIAN =================

    @GetMapping("/my")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<List<InterventionResponseDTO>> getMyInterventions(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                interventionService.getByTechnician(user.getId())
        );
    }

    // ✅ Technician update (status + description only)
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<InterventionResponseDTO> technicianUpdate(
            @PathVariable Long id,
            @RequestBody InterventionTechnicianUpdateDTO dto,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                interventionService.technicianUpdate(id, dto, user)
        );
    }
}
