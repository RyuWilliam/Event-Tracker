package co.edu.uptc.EventTracker.persistence;

import co.edu.uptc.EventTracker.domain.model.EventTicket;
import co.edu.uptc.EventTracker.domain.repository.EventTicketRepository;
import co.edu.uptc.EventTracker.persistence.crud.EventTicketJpaRepository;
import co.edu.uptc.EventTracker.persistence.entities.EventTicketEntity;
import co.edu.uptc.EventTracker.persistence.exceptions.EventTicketNullException;
import co.edu.uptc.EventTracker.persistence.mapper.TicketMapper;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class EventTicketRepositoryImpl implements EventTicketRepository {

    private final TicketMapper ticketMapper;


    private final EventTicketJpaRepository ticketJpaRepository;

    public EventTicketRepositoryImpl(TicketMapper ticketMapper, EventTicketJpaRepository ticketJpaRepository) {
        this.ticketMapper = ticketMapper;
        this.ticketJpaRepository = ticketJpaRepository;
    }

    @Override
    public Optional<EventTicket> findById(Integer id) {
        EventTicketEntity entity = ticketJpaRepository.findById(id).orElse(null);
        if(entity == null){
            throw new EventTicketNullException(id);
        }
        return Optional.of(ticketMapper.toEventTicket(entity));
    }

    @Override
    public EventTicket save(EventTicket eventTicket) {
        EventTicketEntity entity = ticketJpaRepository
                .findById(eventTicket.getId())
                .orElseThrow();
        // Solo actualiza los campos que cambian
        entity.setSoldQuantity(eventTicket.getSoldQuantity());
        entity.setTotalQuantity(eventTicket.getTotalQuantity());
        entity.setPrice(eventTicket.getPrice());

        EventTicketEntity saved = ticketJpaRepository.save(entity);
        return ticketMapper.toEventTicket(saved);
    }
}
