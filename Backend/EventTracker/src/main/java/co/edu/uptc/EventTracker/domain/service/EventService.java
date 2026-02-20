package co.edu.uptc.EventTracker.domain.service;


import co.edu.uptc.EventTracker.domain.repository.EventRepository;
import co.edu.uptc.EventTracker.persistence.entities.EventEntity;
import co.edu.uptc.EventTracker.persistence.enums.EventStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public EventEntity save(EventEntity event){
        return eventRepository.save(event);
    }

    public EventEntity modify(Integer id, EventEntity event){
        EventEntity eventToModify = eventRepository.findById(id).orElse(null);
        if(eventToModify == null){
            throw new RuntimeException();
        }
        eventToModify.setName(event.getName());
        eventToModify.setDescription(event.getDescription());
        eventToModify.setDate(event.getDate());
        eventToModify.setStatus(event.getStatus());
        return eventRepository.save(eventToModify);
    }

    public void deleteEvent (Integer id){
        eventRepository.deleteById(id);
    }

    public EventEntity findById(Integer id){
        return eventRepository.findById(id).orElse(null);
    }

    public List<EventEntity> findAll(){
        return eventRepository.findActive();
    }
    List<EventEntity> findByName(String name){
        return eventRepository.findByName(name);
    }
    List<EventEntity> findByStatus(EventStatus status){
        return eventRepository.findByStatus(status);
    }
    List<EventEntity> findByDateBetween(LocalDateTime start, LocalDateTime end){
        return eventRepository.findByDateBetween(start,end);
    }


}
