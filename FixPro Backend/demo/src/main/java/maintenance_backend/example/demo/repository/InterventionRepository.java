package maintenance_backend.example.demo.repository;

import maintenance_backend.example.demo.entity.Intervention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterventionRepository extends JpaRepository<Intervention, Long> {

    // Fetch all interventions with machine, client, and technician in one query
    @Query("""
        SELECT i FROM Intervention i
        LEFT JOIN FETCH i.machine m
        LEFT JOIN FETCH m.client
        LEFT JOIN FETCH i.technician
    """)
    List<Intervention> findAllFull();

    // Fetch one intervention with full info
    @Query("""
        SELECT i FROM Intervention i
        LEFT JOIN FETCH i.machine m
        LEFT JOIN FETCH m.client
        LEFT JOIN FETCH i.technician
        WHERE i.id = :id
    """)
    Optional<Intervention> findByIdFull(Long id);

    List<Intervention> findByTechnicianId(Long technicianId);
}
