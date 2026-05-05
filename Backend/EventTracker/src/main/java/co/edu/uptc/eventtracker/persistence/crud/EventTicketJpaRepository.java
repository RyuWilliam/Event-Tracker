package co.edu.uptc.eventtracker.persistence.crud;

import co.edu.uptc.eventtracker.persistence.entities.EventTicketEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventTicketJpaRepository extends JpaRepository<EventTicketEntity, Integer> {
}
