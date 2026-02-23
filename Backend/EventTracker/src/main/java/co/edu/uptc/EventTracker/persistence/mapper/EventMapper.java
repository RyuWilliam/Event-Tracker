package co.edu.uptc.EventTracker.persistence.mapper;


import ch.qos.logback.core.model.ComponentModel;
import co.edu.uptc.EventTracker.domain.model.Event;
import co.edu.uptc.EventTracker.domain.model.EventCategory;
import co.edu.uptc.EventTracker.persistence.entities.CategoryEntity;
import co.edu.uptc.EventTracker.persistence.entities.EventEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class EventMapper {

    private final CategoryMapper categoryMapper;

    public EventMapper(CategoryMapper categoryMapper) {
        this.categoryMapper = categoryMapper;
    }

    public Event toEvent (EventEntity entity){
        if(entity == null){
            return null;
        }
        Event event = new Event();
        event.setId(entity.getEventId());
        event.setDate(entity.getDate());
        event.setName(entity.getName());
        event.setStatus(entity.getStatus());
        event.setLikes(entity.getLikes());
        event.setDescription(entity.getDescription());
        event.setCategories(categoryMapper.toCategories(entity.getCategories()));
        return event;
    }
    public List<Event> toEvents(List<EventEntity> entities){
        List<Event> events = new ArrayList<>();
        if (entities == null) {
            return events;
        }
        for (EventEntity entity: entities){
            events.add(toEvent(entity));
        }
        return events;
    }

    public EventEntity toEntity(Event event){
        if (event == null) {
            return null;
        }

        EventEntity entity = new EventEntity();
        entity.setEventId(event.getId());
        entity.setDate(event.getDate());
        entity.setName(event.getName());
        entity.setStatus(event.getStatus());
        entity.setLikes(event.getLikes());
        entity.setDescription(event.getDescription());

        if (event.getCategories() != null) {
            entity.setCategories(
                    categoryMapper.toEntities(event.getCategories())
            );
        } else {
            entity.setCategories(new ArrayList<>());
        }

        return entity;

    }
    public List<EventEntity> toEntities(List<Event> events){
        List<EventEntity> entities = new ArrayList<>();

        if (events == null) {
            return entities;
        }

        for (Event event : events) {
            entities.add(toEntity(event));
        }

        return entities;
    }

 }
