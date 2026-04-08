package co.edu.uptc.EventTracker.domain.service;

import co.edu.uptc.EventTracker.domain.model.Event;
import co.edu.uptc.EventTracker.domain.model.EventTicket;
import co.edu.uptc.EventTracker.domain.model.TicketPurchase;
import co.edu.uptc.EventTracker.domain.model.TicketResume;
import org.springframework.stereotype.Component;

@Component
public class TicketResumeBuilder {

    public TicketResume buildFromPurchase(TicketPurchase purchase, Event event, EventTicket eventTicket) {
        TicketResume resume = new TicketResume();
        resume.setId(purchase.getId());
        resume.setQuantity(purchase.getQuantity());
        resume.setEventName(event.getName());
        resume.setTotal(eventTicket.getPrice() * purchase.getQuantity());
        resume.setUserAddress(purchase.getUser().getEmail());
        resume.setType(eventTicket.getTicketType());
        return resume;
    }
}