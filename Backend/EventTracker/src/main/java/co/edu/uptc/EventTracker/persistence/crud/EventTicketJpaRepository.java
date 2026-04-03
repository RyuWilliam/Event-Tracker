package co.edu.uptc.EventTracker.persistence.crud;

import co.edu.uptc.EventTracker.persistence.entities.EventTicketEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventTicketJpaRepository extends JpaRepository<EventTicketEntity, Integer> {
}
