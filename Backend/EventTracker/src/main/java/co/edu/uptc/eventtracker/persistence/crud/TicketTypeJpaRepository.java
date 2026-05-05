package co.edu.uptc.eventtracker.persistence.crud;

import co.edu.uptc.eventtracker.persistence.entities.TicketTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketTypeJpaRepository extends JpaRepository<TicketTypeEntity,Integer> {

}
