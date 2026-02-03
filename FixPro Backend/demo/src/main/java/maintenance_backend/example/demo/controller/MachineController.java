package maintenance_backend.example.demo.controller;

import maintenance_backend.example.demo.dto.MachineRequestDTO;
import maintenance_backend.example.demo.dto.MachineResponseDTO;
import maintenance_backend.example.demo.entity.Machine;
import maintenance_backend.example.demo.service.MachineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/machines")
@RequiredArgsConstructor
public class MachineController {

    private final MachineService machineService;

    @PostMapping
    public ResponseEntity<MachineResponseDTO> createMachine(
            @RequestBody MachineRequestDTO dto) {
        return ResponseEntity.ok(machineService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<MachineResponseDTO>> getMachines() {
        return ResponseEntity.ok(machineService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MachineResponseDTO> getMachine(@PathVariable Long id) {
        return ResponseEntity.of(machineService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MachineResponseDTO> updateMachine(
            @PathVariable Long id,
            @RequestBody MachineRequestDTO dto) {
        return ResponseEntity.ok(machineService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMachine(@PathVariable Long id) {
        machineService.delete(id);
        return ResponseEntity.ok("Machine deleted");
    }
}
