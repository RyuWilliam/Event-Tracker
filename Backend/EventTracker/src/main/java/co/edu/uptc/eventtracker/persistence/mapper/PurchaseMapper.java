package co.edu.uptc.eventtracker.persistence.mapper;

import co.edu.uptc.eventtracker.domain.model.TicketPurchase;
import co.edu.uptc.eventtracker.persistence.entities.TicketPurchaseEntity;
import co.edu.uptc.eventtracker.persistence.entities.TicketPurchaseItemEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PurchaseMapper {

    private final PurchaseItemMapper itemMapper;
    private final UserMapper userMapper;

    public PurchaseMapper(PurchaseItemMapper itemMapper, UserMapper userMapper) {
        this.itemMapper = itemMapper;
        this.userMapper = userMapper;
    }

    public TicketPurchaseEntity toEntity(TicketPurchase purchase) {
        TicketPurchaseEntity entity = new TicketPurchaseEntity();
        entity.setUser(userMapper.toEntity(purchase.getUser()));

        List<TicketPurchaseItemEntity> itemEntities = itemMapper.toEntities(purchase.getItems());
        // Asignar referencia al padre antes de guardar (necesario por mappedBy)
        itemEntities.forEach(item -> item.setTicketPurchase(entity));
        entity.setItems(itemEntities);

        return entity;
    }

    public TicketPurchase toPurchase(TicketPurchaseEntity entity) {
        TicketPurchase purchase = new TicketPurchase();
        purchase.setId(entity.getId());
        purchase.setUser(userMapper.toDomain(entity.getUser()));
        purchase.setItems(itemMapper.toDomains(entity.getItems()));
        return purchase;
    }

    public List<TicketPurchaseEntity> toEntities(List<TicketPurchase> purchases) {
        if (purchases == null) return List.of();
        return purchases.stream().map(this::toEntity).toList();
    }

    public List<TicketPurchase> toPurchases(List<TicketPurchaseEntity> entities) {
        if (entities == null) return List.of();
        return entities.stream().map(this::toPurchase).toList();
    }
}