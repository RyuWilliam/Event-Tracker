package co.edu.uptc.eventtracker.domain.repository;

import co.edu.uptc.eventtracker.domain.model.EventTicket;

import java.util.Optional;

public interface EventTicketRepository {
    Optional<EventTicket> findById(Integer id);
    EventTicket save(EventTicket ticket);

}
