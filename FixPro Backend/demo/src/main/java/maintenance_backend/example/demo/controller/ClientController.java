package maintenance_backend.example.demo.controller;

import maintenance_backend.example.demo.dto.ClientRequestDTO;
import maintenance_backend.example.demo.dto.ClientResponseDTO;
import maintenance_backend.example.demo.entity.Client;
import maintenance_backend.example.demo.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    @PostMapping
    public ResponseEntity<ClientResponseDTO> createClient(
            @RequestBody ClientRequestDTO dto) {
        return ResponseEntity.ok(clientService.createClient(dto));
    }

    @GetMapping
    public ResponseEntity<List<ClientResponseDTO>> getClients() {
        return ResponseEntity.ok(clientService.getAllClients());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientResponseDTO> getClient(@PathVariable Long id) {
        return ResponseEntity.of(clientService.getClientById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientResponseDTO> updateClient(
            @PathVariable Long id,
            @RequestBody ClientRequestDTO dto) {
        return ResponseEntity.ok(clientService.updateClient(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteClient(@PathVariable Long id) {
        clientService.deleteClient(id);
        return ResponseEntity.ok("Client deleted");
    }
}


