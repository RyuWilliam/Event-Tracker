package co.edu.uptc.eventtracker.persistence.crud;

import co.edu.uptc.eventtracker.persistence.entities.TicketPurchaseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PurchaseJpaRepository extends JpaRepository<TicketPurchaseEntity, Integer> {
    List<TicketPurchaseEntity> findByUserId(Integer userId);
}
