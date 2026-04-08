package co.edu.uptc.EventTracker.domain.service;

import co.edu.uptc.EventTracker.domain.model.*;
import co.edu.uptc.EventTracker.domain.repository.EventRepository;
import co.edu.uptc.EventTracker.domain.repository.EventTicketRepository;
import co.edu.uptc.EventTracker.domain.repository.TicketRepository;
import co.edu.uptc.EventTracker.domain.repository.UserRepository;
import co.edu.uptc.EventTracker.persistence.exceptions.InsufficientStockException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TicketService {
    private static final Logger log = LoggerFactory.getLogger(TicketService.class);
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final TicketResumeBuilder ticketResumeBuilder;
    private final EventRepository eventRepository;
    private final EventTicketRepository eventTicketRepository;

    public TicketService(UserRepository userRepository, TicketRepository ticketRepository, TicketResumeBuilder ticketResumeBuilder, EventRepository eventRepository, EventTicketRepository eventTicketRepository) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.ticketResumeBuilder = ticketResumeBuilder;
        this.eventRepository = eventRepository;
        this.eventTicketRepository = eventTicketRepository;
    }

    public TicketType createType(TicketType type){
        return ticketRepository.createType(type);
    }
    public TicketType modifyType(Integer id, String name){
        return ticketRepository .modifyType(id,name);
    }
    public Optional<TicketType> getTypeById(Integer id){
        return ticketRepository.getTypeById(id);
    }
    public List<TicketType> findAll(){
        return ticketRepository.findAll();
    }
    public void deleteType(Integer id){
        ticketRepository.deleteType(id);
    }
    public TicketResume registerSale(TicketPurchase request){
        TicketPurchase purchase = buildFromRequest(request);
        Event event = eventRepository.findByEventTicketId(purchase.getEventTicket().getId());
        EventTicket eventTicket = purchase.getEventTicket();
        if(request.getQuantity() > eventTicket.getAvailableQuantity()){
            throw new InsufficientStockException(event.getName());
        }
        eventTicket.setSoldQuantity(eventTicket.getSoldQuantity() + request.getQuantity());
        eventTicketRepository.save(eventTicket);
        TicketResume resume = ticketResumeBuilder.buildFromPurchase(purchase, event, eventTicket);
        savePurchase(purchase);
        return  resume;
    }
    public TicketPurchase savePurchase(TicketPurchase purchase){
        return ticketRepository.savePurchase(purchase);
    }

    private TicketPurchase buildFromRequest(TicketPurchase request){
        User user = userRepository.findById(request.getUser().getId()).orElse(null);
        EventTicket eventTicket = eventTicketRepository.findById(request.getEventTicket().getId()).orElse(null);

        return new TicketPurchase(request.getQuantity(),user,eventTicket);
    }
    public Optional<TicketPurchase> getPurchaseById(Integer id){
        return ticketRepository.getPurchaseById(id);
    }

}
