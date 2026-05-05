package co.edu.uptc.eventtracker.domain.repository;

import co.edu.uptc.eventtracker.domain.model.TicketPurchase;
import co.edu.uptc.eventtracker.domain.model.TicketType;

import java.util.List;
import java.util.Optional;

public interface TicketRepository {

    TicketType createType(TicketType type);
    TicketType modifyType(Integer id, String name);
    List<TicketType> findAll();
    Optional<TicketType> getTypeById(Integer id);
    void deleteType(Integer id);
    TicketPurchase savePurchase(TicketPurchase purchase);
    Optional<TicketPurchase> getPurchaseById(Integer id);

}
