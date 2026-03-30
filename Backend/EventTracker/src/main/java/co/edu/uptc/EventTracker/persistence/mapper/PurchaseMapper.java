package co.edu.uptc.EventTracker.persistence.mapper;

import co.edu.uptc.EventTracker.domain.model.TicketPurchase;
import co.edu.uptc.EventTracker.persistence.entities.TicketPurchaseEntity;
import org.springframework.stereotype.Component;

@Component
public class PurchaseMapper {

    private final TicketMapper ticketMapper;
    private final UserMapper userMapper;

    public PurchaseMapper(TicketMapper ticketMapper, UserMapper userMapper) {
        this.ticketMapper = ticketMapper;
        this.userMapper = userMapper;
    }

    public TicketPurchaseEntity toEntity(TicketPurchase purchase){
        TicketPurchaseEntity entity  = new TicketPurchaseEntity();
        entity.setId(purchase.getId());
        entity.setQuantity(purchase.getQuantity());
        entity.setUser(userMapper.toEntity(purchase.getUser()));
        entity.setEventTicket(ticketMapper.toEntity(purchase.getEventTicket()));
        return entity;
    }


    public TicketPurchase toPurchase(TicketPurchaseEntity entity){
        TicketPurchase purchase = new TicketPurchase();
        purchase.setQuantity(entity.getQuantity());
        purchase.setId(entity.getId());
        purchase.setUser(userMapper.toDomain(entity.getUser()));
        purchase.setEventTicket(ticketMapper.toEventTicket(entity.getEventTicket()));
        return purchase;
    }

}
