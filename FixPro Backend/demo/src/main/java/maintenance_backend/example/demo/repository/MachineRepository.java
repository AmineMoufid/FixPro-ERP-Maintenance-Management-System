package maintenance_backend.example.demo.repository;

import maintenance_backend.example.demo.entity.Machine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MachineRepository extends JpaRepository<Machine, Long> {

    // Fetch all machines with clients in one query
    @Query("SELECT m FROM Machine m LEFT JOIN FETCH m.client")
    List<Machine> findAllWithClient();

    // Fetch one machine with its client
    @Query("SELECT m FROM Machine m LEFT JOIN FETCH m.client WHERE m.id = :id")
    Optional<Machine> findByIdWithClient(Long id);
}
