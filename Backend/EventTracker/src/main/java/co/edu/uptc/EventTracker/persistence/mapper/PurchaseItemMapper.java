package co.edu.uptc.EventTracker.persistence.mapper;

import co.edu.uptc.EventTracker.domain.model.TicketPurchaseItem;
import co.edu.uptc.EventTracker.persistence.entities.TicketPurchaseItemEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PurchaseItemMapper {

    private final TicketMapper ticketMapper;

    public PurchaseItemMapper(TicketMapper ticketMapper) {
        this.ticketMapper = ticketMapper;
    }

    public TicketPurchaseItemEntity toEntity(TicketPurchaseItem item) {
        TicketPurchaseItemEntity entity = new TicketPurchaseItemEntity();
        entity.setQuantity(item.getQuantity());
        entity.setEventTicket(ticketMapper.toEntity(item.getEventTicket()));
        return entity;
    }

    public TicketPurchaseItem toDomain(TicketPurchaseItemEntity entity) {
        TicketPurchaseItem item = new TicketPurchaseItem();
        item.setId(entity.getId());
        item.setQuantity(entity.getQuantity());
        item.setEventTicket(ticketMapper.toEventTicket(entity.getEventTicket()));
        return item;
    }

    public List<TicketPurchaseItemEntity> toEntities(List<TicketPurchaseItem> items) {
        if (items == null) return List.of();
        return items.stream().map(this::toEntity).toList();
    }

    public List<TicketPurchaseItem> toDomains(List<TicketPurchaseItemEntity> entities) {
        if (entities == null) return List.of();
        return entities.stream().map(this::toDomain).toList();
    }
}