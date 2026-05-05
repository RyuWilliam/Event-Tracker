package co.edu.uptc.eventtracker.persistence.mapper;

import co.edu.uptc.eventtracker.domain.model.TicketType;
import co.edu.uptc.eventtracker.persistence.entities.TicketTypeEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

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

    public List<TicketType> toTypes(List<TicketTypeEntity> entities){
        List<TicketType> types = new ArrayList<>();
        for (TicketTypeEntity entity: entities){
            types.add(toType(entity));
        }
        return types;
    }
}
