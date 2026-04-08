package co.edu.uptc.EventTracker.persistence.mapper;


import co.edu.uptc.EventTracker.domain.model.EventTicket;
import co.edu.uptc.EventTracker.persistence.entities.EventTicketEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class TicketMapper {
    private final TicketTypeMapper ticketTypeMapper;

    public TicketMapper(TicketTypeMapper ticketTypeMapper) {
        this.ticketTypeMapper = ticketTypeMapper;
    }


    public EventTicketEntity toEntity(EventTicket ticket){
        EventTicketEntity entity = new EventTicketEntity();
        entity.setId(ticket.getId());
        entity.setPrice(ticket.getPrice());
        entity.setTicketType(ticketTypeMapper.toEntity(ticket.getTicketType()));
        entity.setTotalQuantity(ticket.getTotalQuantity());
        entity.setSoldQuantity(ticket.getSoldQuantity());
        return entity;
    }

    public List<EventTicketEntity> toEntities(List<EventTicket> tickets){
        List<EventTicketEntity> entities = new ArrayList<>();
        for(EventTicket ticket: tickets){
            entities.add(toEntity(ticket));
        }
        return entities;
    }

    public EventTicket toEventTicket(EventTicketEntity entity){
        EventTicket ticket = new EventTicket();
        ticket.setTicketType(ticketTypeMapper.toType(entity.getTicketType()));
        ticket.setId(entity.getId());
        ticket.setPrice(entity.getPrice());
        ticket.setSoldQuantity(entity.getSoldQuantity());
        ticket.setTotalQuantity(entity.getTotalQuantity());
        return ticket;
    }

    public List<EventTicket> toEventTickets(List<EventTicketEntity> entities) {
        if (entities == null) {
            return List.of();
        }

        return entities.stream()
                .map(this::toEventTicket)
                .toList();
    }



}
