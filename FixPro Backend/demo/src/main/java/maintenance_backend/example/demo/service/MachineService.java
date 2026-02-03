package maintenance_backend.example.demo.service;

import maintenance_backend.example.demo.dto.MachineRequestDTO;
import maintenance_backend.example.demo.dto.MachineResponseDTO;
import maintenance_backend.example.demo.entity.Machine;
import maintenance_backend.example.demo.repository.ClientRepository;
import maintenance_backend.example.demo.repository.MachineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MachineService {

    private final MachineRepository machineRepository;
    private final ClientRepository clientRepository;

    public MachineResponseDTO create(MachineRequestDTO dto) {
        Machine machine = new Machine();
        machine.setName(dto.getName());
        machine.setSerialNumber(dto.getSerialNumber());
        machine.setStatus(dto.getStatus());
        if (dto.getClientId() != null) {
            machine.setClient(
                    clientRepository.findById(dto.getClientId())
                            .orElseThrow(() -> new RuntimeException("Client not found"))
            );
        }
        return toDTO(machineRepository.save(machine));
    }

    public MachineResponseDTO update(Long id, MachineRequestDTO dto) {
        Machine machine = machineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Machine not found"));

        machine.setName(dto.getName());
        machine.setSerialNumber(dto.getSerialNumber());
        machine.setStatus(dto.getStatus());

        // Update client if provided
        if (dto.getClientId() != null) {
            machine.setClient(
                    clientRepository.findById(dto.getClientId())
                            .orElseThrow(() -> new RuntimeException("Client not found"))
            );
        } else {
            machine.setClient(null); // optional: remove client if dto.clientId is null
        }

        return toDTO(machineRepository.save(machine));
    }

    public List<MachineResponseDTO> getAll() {
        return machineRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public Optional<MachineResponseDTO> getById(Long id) {
        return machineRepository.findById(id).map(this::toDTO);
    }

    public void delete(Long id) {
        machineRepository.deleteById(id);
    }

    private MachineResponseDTO toDTO(Machine m) {
        return new MachineResponseDTO(
                m.getId(),
                m.getName(),
                m.getSerialNumber(),
                m.getStatus(),
                m.getClient() != null ? m.getClient().getId() : null,
                m.getClient() != null ? m.getClient().getCompanyName() : null
        );
    }
}

