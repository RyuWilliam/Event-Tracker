package co.edu.uptc.eventtracker.domain.service;


import co.edu.uptc.eventtracker.domain.model.Event;
import co.edu.uptc.eventtracker.domain.repository.EventRepository;
import co.edu.uptc.eventtracker.persistence.enums.EventStatus;
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

    public void refreshStatus(){
        for (Event event: eventRepository.findAll()){
            if(event.getDate().isBefore(LocalDateTime.now())){
                event.setStatus(EventStatus.FINISHED);
                eventRepository.save(event);
            }
        }
    }

    public List<Event> getMostPopular() {
        return eventRepository.findByStatus(EventStatus.ACTIVE).stream()
                .sorted((e1, e2) -> Double.compare(
                        getTotalSales(e2),
                        getTotalSales(e1)
                ))
                .limit(5)
                .toList();
    }

    private double getTotalSales(Event event) {
        if (event.getTickets() == null) return 0;

        return event.getTickets().stream()
                .mapToDouble(ticket ->
                        ticket.getSoldQuantity() * ticket.getPrice()
                )
                .sum();
    }


    public double getTotalSales() {
        return eventRepository.findAll().stream()
                .flatMap(event -> event.getTickets().stream())
                .mapToDouble(ticket ->
                        ticket.getSoldQuantity() * ticket.getPrice()
                )
                .sum();
    }




}
