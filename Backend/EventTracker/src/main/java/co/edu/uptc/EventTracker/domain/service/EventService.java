package co.edu.uptc.EventTracker.domain.service;


import co.edu.uptc.EventTracker.domain.model.Event;
import co.edu.uptc.EventTracker.domain.repository.EventRepository;
import co.edu.uptc.EventTracker.persistence.enums.EventStatus;
import co.edu.uptc.EventTracker.persistence.exceptions.EventNotActiveException;
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

    public Event save(Event event){
        return eventRepository.save(event);
    }

    public Event modify(Integer id, Event event) {
        return eventRepository.modify(id, event);
    }

    public void deleteEvent (Integer id){
        eventRepository.deleteById(id);
    }

    public Event findById(Integer id){
        return eventRepository.findById(id).orElse(null);
    }

    public List<Event> findAll(){
        return eventRepository.findActive();
    }
    public List<Event> findByName(String name){
        return eventRepository.findByName(name);
    }
    public List<Event> findByStatus(EventStatus status){
        return eventRepository.findByStatus(status);
    }
    public List<Event> findByDateBetween(LocalDateTime start, LocalDateTime end){
        return eventRepository.findByDateBetween(start,end);
    }
    public void addLike(Integer id){
        eventRepository.addLike(id);
    }



}
