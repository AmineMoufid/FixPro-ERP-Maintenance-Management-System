package maintenance_backend.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Machine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String serialNumber;

    @Enumerated(EnumType.STRING)
    private MachineStatus status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="client_id")
    @JsonIgnoreProperties("machines") // prevent recursion
    private Client client;

    @OneToMany(mappedBy="machine", cascade=CascadeType.ALL)
    @JsonIgnoreProperties("machine")
    private List<Intervention> interventions;
}
