package co.edu.uptc.EventTracker.domain.service;

import co.edu.uptc.EventTracker.domain.model.Event;
import co.edu.uptc.EventTracker.domain.model.EventTicket;
import co.edu.uptc.EventTracker.domain.model.TicketPurchase;
import co.edu.uptc.EventTracker.domain.model.TicketResume;
import co.edu.uptc.EventTracker.domain.repository.EventRepository;
import co.edu.uptc.EventTracker.domain.repository.PurchaseRepository;
import co.edu.uptc.EventTracker.domain.repository.UserRepository;
import co.edu.uptc.EventTracker.persistence.crud.PurchaseJpaRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserTicketService {
    private final TicketResumeBuilder ticketResumeBuilder;
    private final PurchaseRepository purchaseRepository;
    private final EventRepository eventRepository;

    public UserTicketService(TicketResumeBuilder ticketResumeBuilder, PurchaseRepository purchaseRepository, EventRepository eventRepository) {
        this.ticketResumeBuilder = ticketResumeBuilder;
        this.purchaseRepository = purchaseRepository;
        this.eventRepository = eventRepository;
    }

    public List<TicketResume> getTickets(Integer id){
        List<TicketPurchase> purchases = purchaseRepository.findByUserId(id);
        List<TicketResume> tickets = new ArrayList<>();
        for(TicketPurchase purchase: purchases){
            Event event = eventRepository.findByEventTicketId(purchase.getEventTicket().getId());
            EventTicket eventTicket = purchase.getEventTicket();
            tickets.add(ticketResumeBuilder.buildFromPurchase(purchase,event,eventTicket));
        }
        return tickets;
    }
}