package co.edu.uptc.eventtracker.persistence;

import co.edu.uptc.eventtracker.domain.model.Event;
import co.edu.uptc.eventtracker.domain.model.EventCategory;
import co.edu.uptc.eventtracker.domain.model.EventTicket;
import co.edu.uptc.eventtracker.domain.repository.EventRepository;
import co.edu.uptc.eventtracker.persistence.crud.EventJpaRepository;
import co.edu.uptc.eventtracker.persistence.entities.CategoryEntity;
import co.edu.uptc.eventtracker.persistence.entities.EventEntity;
import co.edu.uptc.eventtracker.persistence.entities.EventTicketEntity;
import co.edu.uptc.eventtracker.persistence.enums.EventStatus;
import co.edu.uptc.eventtracker.persistence.exceptions.EventNotFoundException;
import co.edu.uptc.eventtracker.persistence.mapper.CategoryMapper;
import co.edu.uptc.eventtracker.persistence.mapper.EventMapper;
import co.edu.uptc.eventtracker.persistence.mapper.TicketTypeMapper;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@Repository
public class EventRepositoryImpl implements EventRepository {

    private final EventMapper eventMapper;
    private final CategoryMapper categoryMapper;
    private final TicketTypeMapper ticketTypeMapper;
    private final CategoryRepositoryImpl categoryRepository;
    private final EventJpaRepository eventJpaRepository;

    public EventRepositoryImpl(EventMapper eventMapper, CategoryMapper categoryMapper, TicketTypeMapper ticketTypeMapper, CategoryRepositoryImpl categoryRepository, EventJpaRepository eventJpaRepository) {
        this.eventMapper = eventMapper;
        this.categoryMapper = categoryMapper;
        this.ticketTypeMapper = ticketTypeMapper;
        this.categoryRepository = categoryRepository;
        this.eventJpaRepository = eventJpaRepository;
    }

    @Override
    public Event save(Event event) {
        EventEntity entity = eventMapper.toEntity(event);
        
        if (entity.getEventId() != null) {
            EventEntity existing = eventJpaRepository.findById(entity.getEventId()).orElse(null);
            if (existing != null) {
                entity.setFavorites(existing.getFavorites());
                entity.setActive(existing.getActive());
            } else {
                entity.setActive(true);
            }
        } else {
            entity.setActive(true);
        }

        List<CategoryEntity> categoryEntities = new ArrayList<>();

        for(EventCategory category: event.getCategories()){
            EventCategory toPersist = categoryRepository.findById(category.getId()).orElse(null);
            if(toPersist == null){
                categoryEntities.add(null);
            }
            categoryEntities.add(categoryMapper.toEntity(toPersist));
        }
        entity.setCategories(categoryEntities);
        EventEntity persisted = eventJpaRepository.save(entity);
        return eventMapper.toEvent(persisted);
    }

    @Override
    public Optional<Event> findById(Integer id) {
        EventEntity entity = eventJpaRepository.findById(id).orElse(null);
        if(entity == null){
            return Optional.empty();
        }
        return Optional.of(eventMapper.toEvent(entity));
    }

    @Override
    public Event findByEventTicketId(Integer id) {
        return eventJpaRepository.findByTicketsId(id)
                .map(eventMapper::toEvent)
                .orElseThrow(() -> new EventNotFoundException(id));
    }

    @Override
    public List<Event> findAll() {
        return eventMapper.toEvents(eventJpaRepository.findAll());
    }

    @Override
    public void deleteById(Integer id) {
        EventEntity event = eventJpaRepository.findById(id).orElse(null);
        if(event == null){
            throw new RuntimeException();
        }
        event.setActive(false);
        eventJpaRepository.save(event);
    }

    @Override
    public boolean existById(Integer id) {
        return eventJpaRepository.existsById(id);
    }

    @Override
    public List<Event> findActive() {
        return eventMapper.toEvents(eventJpaRepository.findByActiveTrue());
    }

    @Override
    public List<Event> findByName(String name) {
        return eventMapper.toEvents(eventJpaRepository.findByNameContainingIgnoreCase(name));
    }

    @Override
    public List<Event> findByStatus(EventStatus status) {
        return eventMapper.toEvents(eventJpaRepository.findByStatus(status));
    }

    @Override
    public List<Event> findByDateBetween(LocalDateTime start, LocalDateTime end) {
        return eventMapper.toEvents(eventJpaRepository.findByDateBetween(start,end));
    }

    @Override
    public boolean isActive(Integer id) {
        EventEntity entity = eventJpaRepository.findById(id).orElse(null);
        if(entity != null){
            return Boolean.TRUE.equals(entity.getActive());
        }
        return false;
    }

    @Override
    public Event modify(Integer id, Event event) {
        EventEntity entity = eventJpaRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));

        updateBasicEventFields(entity, event);
        updateEventCategories(entity, event);
        updateEventTickets(entity, event);

        return eventMapper.toEvent(eventJpaRepository.save(entity));
    }

    private void updateBasicEventFields(EventEntity entity, Event event) {
        Optional.ofNullable(event.getName()).ifPresent(entity::setName);
        Optional.ofNullable(event.getDescription()).ifPresent(entity::setDescription);
        Optional.ofNullable(event.getDate()).ifPresent(entity::setDate);
        Optional.ofNullable(event.getStatus()).ifPresent(entity::setStatus);
        Optional.ofNullable(event.getImageUrl()).ifPresent(entity::setImageUrl);
    }

    private void updateEventCategories(EventEntity entity, Event event) {
        Optional.ofNullable(event.getCategories()).ifPresent(cats ->
                entity.setCategories(categoryMapper.toEntities(cats))
        );
    }

    private void updateEventTickets(EventEntity entity, Event event) {
        Optional.ofNullable(event.getTickets()).ifPresent(tickets -> {
            List<Integer> incomingIds = extractIncomingTicketIds(tickets);
            removeDeletedTickets(entity, incomingIds);
            addOrModifyTickets(entity, tickets);
        });
    }

    private List<Integer> extractIncomingTicketIds(List<EventTicket> tickets) {
        return tickets.stream()
                .filter(t -> t.getId() != null)
                .map(EventTicket::getId)
                .toList();
    }

    private void removeDeletedTickets(EventEntity entity, List<Integer> incomingIds) {
        entity.getTickets().removeIf(existing -> {
            if (!incomingIds.contains(existing.getId())) {
                validateTicketDeletable(existing);
                return true;
            }
            return false;
        });
    }

    private void validateTicketDeletable(EventTicketEntity ticket) {
        if (ticket.getSoldQuantity() > 0) {
            throw new IllegalStateException(
                    "El ticket '" + ticket.getTicketType().getName() +
                            "' ya tiene ventas y no puede eliminarse"
            );
        }
    }

    private void addOrModifyTickets(EventEntity entity, List<EventTicket> tickets) {
        tickets.forEach(ticket -> {
            if (ticket.getId() == null) {
                addNewTicket(entity, ticket);
            } else {
                modifyExistingTicket(entity, ticket);
            }
        });
    }

    private void addNewTicket(EventEntity entity, EventTicket ticket) {
        EventTicketEntity newTicket = new EventTicketEntity();
        newTicket.setEvent(entity);
        newTicket.setPrice(ticket.getPrice());
        newTicket.setTotalQuantity(ticket.getTotalQuantity());
        newTicket.setSoldQuantity(0);
        newTicket.setTicketType(ticketTypeMapper.toEntity(ticket.getTicketType()));
        entity.getTickets().add(newTicket);
    }

    private void modifyExistingTicket(EventEntity entity, EventTicket ticket) {
        entity.getTickets().stream()
                .filter(t -> t.getId().equals(ticket.getId()))
                .findFirst()
                .ifPresent(existing -> {
                    validateTicketModifiable(existing, ticket);
                    updateTicketFields(existing, ticket);
                });
    }

    private void validateTicketModifiable(EventTicketEntity existing, EventTicket incoming) {
        if (existing.getSoldQuantity() > 0 &&
                (isPriceChanged(existing, incoming) || isQuantityChanged(existing, incoming))) {
            throw new IllegalStateException(
                    "El ticket '" + existing.getTicketType().getName() +
                            "' ya tiene ventas registradas y no puede modificarse"
            );  
        }
    }

    private boolean isPriceChanged(EventTicketEntity existing, EventTicket incoming) {
        return incoming.getPrice() != null && !incoming.getPrice().equals(existing.getPrice());
    }

    private boolean isQuantityChanged(EventTicketEntity existing, EventTicket incoming) {
        return incoming.getTotalQuantity() != null &&
                !incoming.getTotalQuantity().equals(existing.getTotalQuantity());
    }

    private void updateTicketFields(EventTicketEntity existing, EventTicket incoming) {
        Optional.ofNullable(incoming.getPrice()).ifPresent(existing::setPrice);
        Optional.ofNullable(incoming.getTotalQuantity()).ifPresent(existing::setTotalQuantity);
        Optional.ofNullable(incoming.getTicketType())
                .ifPresent(tt -> existing.setTicketType(ticketTypeMapper.toEntity(tt)));
    }
}
