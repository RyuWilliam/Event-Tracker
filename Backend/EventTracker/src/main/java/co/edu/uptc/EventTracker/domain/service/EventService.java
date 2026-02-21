package co.edu.uptc.EventTracker.domain.service;


import co.edu.uptc.EventTracker.domain.repository.EventRepository;
import co.edu.uptc.EventTracker.persistence.entities.EventEntity;
import co.edu.uptc.EventTracker.persistence.enums.EventStatus;
import co.edu.uptc.EventTracker.persistence.exceptions.EventNotFoundException;
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

    public EventEntity modify(Integer id, EventEntity event) {

        EventEntity eventToModify = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));

        if (event.getName() != null) {
            eventToModify.setName(event.getName());
        }
        if (event.getDescription() != null) {
            eventToModify.setDescription(event.getDescription());
        }
        if (event.getDate() != null) {
            eventToModify.setDate(event.getDate());
        }
        if (event.getStatus() != null) {
            eventToModify.setStatus(event.getStatus());
        }

        if (event.getActive() != null) {
            eventToModify.setActive(event.getActive());
        }

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
    public List<EventEntity> findByName(String name){
        return eventRepository.findByName(name);
    }
    public List<EventEntity> findByStatus(EventStatus status){
        return eventRepository.findByStatus(status);
    }
    public List<EventEntity> findByDateBetween(LocalDateTime start, LocalDateTime end){
        return eventRepository.findByDateBetween(start,end);
    }


}
