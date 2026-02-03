package maintenance_backend.example.demo.service;

import maintenance_backend.example.demo.dto.ClientRequestDTO;
import maintenance_backend.example.demo.dto.ClientResponseDTO;
import maintenance_backend.example.demo.entity.Client;
import maintenance_backend.example.demo.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;

    public ClientResponseDTO createClient(ClientRequestDTO dto) {
        Client client = new Client();
        client.setCompanyName(dto.getCompanyName());
        client.setAddress(dto.getAddress());
        client.setPhone(dto.getPhone());

        return toDTO(clientRepository.save(client));
    }

    public List<ClientResponseDTO> getAllClients() {
        return clientRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public Optional<ClientResponseDTO> getClientById(Long id) {
        return clientRepository.findById(id).map(this::toDTO);
    }

    public ClientResponseDTO updateClient(Long id, ClientRequestDTO dto) {
        Client client = clientRepository.findById(id).orElseThrow();

        client.setCompanyName(dto.getCompanyName());
        client.setAddress(dto.getAddress());
        client.setPhone(dto.getPhone());

        return toDTO(clientRepository.save(client));
    }

    public void deleteClient(Long id) {
        clientRepository.deleteById(id);
    }

    private ClientResponseDTO toDTO(Client client) {
        return new ClientResponseDTO(
                client.getId(),
                client.getCompanyName(),
                client.getAddress(),
                client.getPhone()
        );
    }
}
