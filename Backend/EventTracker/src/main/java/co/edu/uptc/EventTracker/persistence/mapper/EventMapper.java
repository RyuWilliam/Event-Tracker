package co.edu.uptc.EventTracker.persistence.mapper;


import ch.qos.logback.core.model.ComponentModel;
import co.edu.uptc.EventTracker.domain.model.Event;
import co.edu.uptc.EventTracker.persistence.entities.EventEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface EventMapper {

    @Mapping(target = "id", source = "eventId")
    Event toEvent (EventEntity entity);
    List<Event> toEvents(List<EventEntity> entities);
    @Mapping(target = "eventId", source = "id")
    EventEntity toEntity(Event event);
    List<EventEntity> toEntities(List<Event> events);
 }
