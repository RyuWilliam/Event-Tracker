package co.edu.uptc.EventTracker.domain.service;

import co.edu.uptc.EventTracker.domain.model.*;
import co.edu.uptc.EventTracker.domain.repository.EventRepository;
import co.edu.uptc.EventTracker.domain.repository.EventTicketRepository;
import co.edu.uptc.EventTracker.domain.repository.TicketRepository;
import co.edu.uptc.EventTracker.domain.repository.UserRepository;
import co.edu.uptc.EventTracker.persistence.exceptions.InsufficientStockException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TicketService {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final TicketResumeBuilder ticketResumeBuilder;
    private final EventRepository eventRepository;
    private final EventTicketRepository eventTicketRepository;

    public TicketService(UserRepository userRepository, TicketRepository ticketRepository,
                         TicketResumeBuilder ticketResumeBuilder, EventRepository eventRepository,
                         EventTicketRepository eventTicketRepository) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.ticketResumeBuilder = ticketResumeBuilder;
        this.eventRepository = eventRepository;
        this.eventTicketRepository = eventTicketRepository;
    }

    public TicketType createType(TicketType type) { return ticketRepository.createType(type); }
    public TicketType modifyType(Integer id, String name) { return ticketRepository.modifyType(id, name); }
    public Optional<TicketType> getTypeById(Integer id) { return ticketRepository.getTypeById(id); }
    public List<TicketType> findAll() { return ticketRepository.findAll(); }
    public void deleteType(Integer id) { ticketRepository.deleteType(id); }

    public TicketResume registerSale(TicketPurchase request) {
        TicketPurchase purchase = buildFromRequest(request);

        Event event = null;
        for (TicketPurchaseItem item : purchase.getItems()) {
            EventTicket eventTicket = item.getEventTicket();
            event = eventRepository.findByEventTicketId(eventTicket.getId());

            if (item.getQuantity() > eventTicket.getAvailableQuantity()) {
                throw new InsufficientStockException(event.getName());
            }
            eventTicket.setSoldQuantity(eventTicket.getSoldQuantity() + item.getQuantity());
            eventTicketRepository.save(eventTicket);
        }

        TicketPurchase saved = savePurchase(purchase);
        return ticketResumeBuilder.buildFromPurchase(saved, event);
    }
    public TicketPurchase savePurchase(TicketPurchase purchase) {
        return ticketRepository.savePurchase(purchase);
    }

    private TicketPurchase buildFromRequest(TicketPurchase request) {
        User user = userRepository.findById(request.getUser().getId()).orElse(null);

        List<TicketPurchaseItem> resolvedItems = request.getItems().stream()
                .map(item -> {
                    EventTicket eventTicket = eventTicketRepository
                            .findById(item.getEventTicket().getId())
                            .orElse(null);
                    return new TicketPurchaseItem(eventTicket, item.getQuantity());
                })
                .toList();

        return new TicketPurchase(user, resolvedItems);
    }

    public Optional<TicketPurchase> getPurchaseById(Integer id) {
        return ticketRepository.getPurchaseById(id);
    }
}