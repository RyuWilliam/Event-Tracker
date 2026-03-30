package co.edu.uptc.EventTracker.persistence.crud;

import co.edu.uptc.EventTracker.persistence.entities.TicketTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketTypeJpaRepository extends JpaRepository<TicketTypeEntity,Integer> {

}
