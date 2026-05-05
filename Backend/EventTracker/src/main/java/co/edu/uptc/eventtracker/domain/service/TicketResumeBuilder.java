package co.edu.uptc.eventtracker.domain.service;

import co.edu.uptc.eventtracker.domain.model.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TicketResumeBuilder {

    public TicketResume buildFromPurchase(TicketPurchase purchase, Event event) {
        List<TicketPurchaseItem> items = purchase.getItems();

        List<TicketResumeItem> resumeItems = items.stream()
                .map(item -> {
                    TicketResumeItem ri = new TicketResumeItem();
                    ri.setType(item.getEventTicket().getTicketType());
                    ri.setQuantity(item.getQuantity());
                    ri.setSubtotal(item.getEventTicket().getPrice() * item.getQuantity());
                    return ri;
                }).toList();

        int totalQuantity = resumeItems.stream().mapToInt(TicketResumeItem::getQuantity).sum();
        double total = resumeItems.stream().mapToDouble(TicketResumeItem::getSubtotal).sum();

        TicketResume resume = new TicketResume();
        resume.setId(purchase.getId());
        resume.setEventName(event.getName());
        resume.setUserAddress(purchase.getUser().getEmail());
        resume.setTotalQuantity(totalQuantity);
        resume.setTotal(total);
        resume.setItems(resumeItems);

        return resume;
    }
}