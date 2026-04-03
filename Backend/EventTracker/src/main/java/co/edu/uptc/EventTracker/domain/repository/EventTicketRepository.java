package co.edu.uptc.EventTracker.domain.repository;

import co.edu.uptc.EventTracker.domain.model.EventTicket;

import java.util.Optional;

public interface EventTicketRepository {
    Optional<EventTicket> findById(Integer id);
    EventTicket save(EventTicket ticket);

}
