package co.edu.uptc.EventTracker.persistence.crud;

import co.edu.uptc.EventTracker.persistence.entities.TicketPurchase;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketJpaRepository extends JpaRepository<TicketPurchase, Integer> {
}
