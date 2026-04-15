package co.edu.uptc.EventTracker.persistence;

import co.edu.uptc.EventTracker.domain.model.Event;
import co.edu.uptc.EventTracker.domain.model.EventCategory;
import co.edu.uptc.EventTracker.domain.model.EventTicket;
import co.edu.uptc.EventTracker.domain.repository.EventRepository;
import co.edu.uptc.EventTracker.persistence.crud.EventJpaRepository;
import co.edu.uptc.EventTracker.persistence.entities.CategoryEntity;
import co.edu.uptc.EventTracker.persistence.entities.EventEntity;
import co.edu.uptc.EventTracker.persistence.entities.EventTicketEntity;
import co.edu.uptc.EventTracker.persistence.enums.EventStatus;
import co.edu.uptc.EventTracker.persistence.exceptions.EventNotFoundException;
import co.edu.uptc.EventTracker.persistence.mapper.CategoryMapper;
import co.edu.uptc.EventTracker.persistence.mapper.EventMapper;
import co.edu.uptc.EventTracker.persistence.mapper.TicketTypeMapper;
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
            } else {.
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

        Optional.ofNullable(event.getName()).ifPresent(entity::setName);
        Optional.ofNullable(event.getDescription()).ifPresent(entity::setDescription);
        Optional.ofNullable(event.getDate()).ifPresent(entity::setDate);
        Optional.ofNullable(event.getStatus()).ifPresent(entity::setStatus);
        Optional.ofNullable(event.getImageUrl()).ifPresent(entity::setImageUrl);
        Optional.ofNullable(event.getCategories()).ifPresent(cats ->
                entity.setCategories(categoryMapper.toEntities(cats))
        );
        Optional.ofNullable(event.getTickets()).ifPresent(tickets -> {
            List<Integer> incomingIds = tickets.stream()
                    .filter(t -> t.getId() != null)
                    .map(EventTicket::getId)
                    .toList();

            // Eliminar tickets que no vienen en la lista y no tienen ventas
            entity.getTickets().removeIf(existing -> {
                if (!incomingIds.contains(existing.getId())) {
                    if (existing.getSoldQuantity() > 0) {
                        throw new IllegalStateException(
                                "El ticket '" + existing.getTicketType().getName() +
                                        "' ya tiene ventas y no puede eliminarse"
                        );
                    }
                    return true;
                }
                return false;
            });

            // Agregar o modificar
            tickets.forEach(ticket -> {
                if (ticket.getId() == null) {
                    EventTicketEntity newTicket = new EventTicketEntity();
                    newTicket.setEvent(entity);
                    newTicket.setPrice(ticket.getPrice());
                    newTicket.setTotalQuantity(ticket.getTotalQuantity());
                    newTicket.setSoldQuantity(0);
                    newTicket.setTicketType(ticketTypeMapper.toEntity(ticket.getTicketType()));
                    entity.getTickets().add(newTicket);
                } else {
                    entity.getTickets().stream()
                            .filter(t -> t.getId().equals(ticket.getId()))
                            .findFirst()
                            .ifPresent(existing -> {
                                boolean priceChanged = ticket.getPrice() != null &&
                                        !ticket.getPrice().equals(existing.getPrice());
                                boolean quantityChanged = ticket.getTotalQuantity() != null &&
                                        !ticket.getTotalQuantity().equals(existing.getTotalQuantity());

                                if (existing.getSoldQuantity() > 0 && (priceChanged || quantityChanged)) {
                                    throw new IllegalStateException(
                                            "El ticket '" + existing.getTicketType().getName() +
                                                    "' ya tiene ventas registradas y no puede modificarse"
                                    );
                                }

                                Optional.ofNullable(ticket.getPrice()).ifPresent(existing::setPrice);
                                Optional.ofNullable(ticket.getTotalQuantity()).ifPresent(existing::setTotalQuantity);
                            });
                }
            });
        });
        return eventMapper.toEvent(eventJpaRepository.save(entity));
    }
}
