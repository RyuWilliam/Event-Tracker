package co.edu.uptc.EventTracker.persistence.mapper;

import co.edu.uptc.EventTracker.domain.model.TicketPurchase;
import co.edu.uptc.EventTracker.persistence.entities.TicketPurchaseEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PurchaseMapper {

    private final TicketMapper ticketMapper;
    private final UserMapper userMapper;

    public PurchaseMapper(TicketMapper ticketMapper, UserMapper userMapper) {
        this.ticketMapper = ticketMapper;
        this.userMapper = userMapper;
    }

    public TicketPurchaseEntity toEntity(TicketPurchase purchase) {
        TicketPurchaseEntity entity = new TicketPurchaseEntity();
        entity.setQuantity(purchase.getQuantity());
        entity.setEventTicket(ticketMapper.toEntity(purchase.getEventTicket()));
        entity.setUser(userMapper.toEntity(purchase.getUser()));
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
    public List<TicketPurchaseEntity> toEntities(List<TicketPurchase> purchases) {
        if (purchases == null) return List.of();
        return purchases.stream()
                .map(this::toEntity)
                .toList();
    }

    public List<TicketPurchase> toPurchases(List<TicketPurchaseEntity> entities) {
        if (entities == null) return List.of();
        return entities.stream()
                .map(this::toPurchase)
                .toList();
    }

}
