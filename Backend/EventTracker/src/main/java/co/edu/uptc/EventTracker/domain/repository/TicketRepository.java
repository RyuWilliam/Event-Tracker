package co.edu.uptc.EventTracker.domain.repository;

import co.edu.uptc.EventTracker.domain.model.TicketPurchase;
import co.edu.uptc.EventTracker.domain.model.TicketType;

public interface TicketRepository {

    public TicketType createType(TicketType type);
    public TicketType modifyType(Integer id, String name);
    public TicketType getTypeById(Integer id);
    public void deleteType(Integer id);
    public TicketPurchase savePurchase(TicketPurchase purchase);
    public TicketPurchase getPurchaseById(Integer id);
}
