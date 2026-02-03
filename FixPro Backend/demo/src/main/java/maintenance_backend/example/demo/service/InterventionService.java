package maintenance_backend.example.demo.service;

import maintenance_backend.example.demo.dto.InterventionRequestDTO;
import maintenance_backend.example.demo.dto.InterventionResponseDTO;
import maintenance_backend.example.demo.dto.InterventionTechnicianUpdateDTO;
import maintenance_backend.example.demo.entity.Intervention;
import maintenance_backend.example.demo.entity.User;
import maintenance_backend.example.demo.repository.InterventionRepository;
import lombok.RequiredArgsConstructor;
import maintenance_backend.example.demo.repository.MachineRepository;
import maintenance_backend.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InterventionService {

    private final InterventionRepository interventionRepository;
    private final MachineRepository machineRepository;
    private final UserRepository userRepository;

    // Create new intervention
    public InterventionResponseDTO create(InterventionRequestDTO dto) {
        Intervention intervention = new Intervention();
        intervention.setDescription(dto.getDescription());
        intervention.setPriority(dto.getPriority());
        intervention.setStatus(dto.getStatus());

        if (dto.getMachineId() != null) {
            intervention.setMachine(
                    machineRepository.findById(dto.getMachineId())
                            .orElseThrow(() -> new RuntimeException("Machine not found"))
            );
        }

        if (dto.getTechnicianId() != null) {
            intervention.setTechnician(
                    userRepository.findById(dto.getTechnicianId())
                            .orElseThrow(() -> new RuntimeException("Technician not found"))
            );
        }

        return toDTO(interventionRepository.save(intervention));
    }

    public InterventionResponseDTO technicianUpdate(
            Long id,
            InterventionTechnicianUpdateDTO dto,
            User user
    ) {
        Intervention intervention = interventionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Intervention not found"));

        // ownership check
        if (!intervention.getTechnician().getId().equals(user.getId())) {
            throw new RuntimeException("Forbidden");
        }

        if (dto.getStatus() != null) {
            intervention.setStatus(dto.getStatus());
        }

        if (dto.getDescription() != null && !dto.getDescription().isBlank()) {
            intervention.setDescription(dto.getDescription());
        }

        return toDTO(interventionRepository.save(intervention));
    }

    // Update intervention
    public InterventionResponseDTO update(Long id, InterventionRequestDTO dto) {
        Intervention intervention = getEntityById(id);

        intervention.setDescription(dto.getDescription());
        intervention.setPriority(dto.getPriority());
        intervention.setStatus(dto.getStatus());

        if (dto.getMachineId() != null) {
            intervention.setMachine(
                    machineRepository.findById(dto.getMachineId())
                            .orElseThrow(() -> new RuntimeException("Machine not found"))
            );
        }

        if (dto.getTechnicianId() != null) {
            intervention.setTechnician(
                    userRepository.findById(dto.getTechnicianId())
                            .orElseThrow(() -> new RuntimeException("Technician not found"))
            );
        }

        return toDTO(interventionRepository.save(intervention));
    }

    // Delete intervention
    public void delete(Long id) {
        interventionRepository.deleteById(id);
    }

    // Get all interventions (Admin)
    public List<InterventionResponseDTO> getAll() {
        return interventionRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // Get intervention by ID
    public Optional<InterventionResponseDTO> getById(Long id) {
        return interventionRepository.findById(id).map(this::toDTO);
    }

    // Get interventions for a specific technician
    public List<InterventionResponseDTO> getByTechnician(Long technicianId) {
        return interventionRepository.findByTechnicianId(technicianId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // Helper to get the entity itself (for controller security checks)
    public Intervention getEntityById(Long id) {
        return interventionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Intervention not found"));
    }

    // Convert entity to DTO
    private InterventionResponseDTO toDTO(Intervention i) {
        return new InterventionResponseDTO(
                i.getId(),
                i.getDescription(),
                i.getPriority(),
                i.getStatus(),
                i.getCreatedAt(),
                i.getMachine() != null ? i.getMachine().getId() : null,
                i.getMachine() != null ? i.getMachine().getName() : null,
                i.getTechnician() != null ? i.getTechnician().getId() : null,
                i.getTechnician() != null ? i.getTechnician().getName() : null
        );
    }
}
