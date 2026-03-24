package co.edu.uptc.EventTracker.persistence.mapper;

import co.edu.uptc.EventTracker.domain.model.TicketType;
import co.edu.uptc.EventTracker.persistence.entities.TicketTypeEntity;
import org.springframework.stereotype.Component;

@Component
public class TicketTypeMapper {

    public TicketTypeEntity toEntity(TicketType type){
        TicketTypeEntity entity = new TicketTypeEntity();
        entity.setId(type.getId());
        entity.setName(type.getName());
        return entity;
    }
    public TicketType toType(TicketTypeEntity entity){
        TicketType type = new TicketType();
        type.setId(entity.getId());
        type.setName(entity.getName());
        return type;
    }
}
