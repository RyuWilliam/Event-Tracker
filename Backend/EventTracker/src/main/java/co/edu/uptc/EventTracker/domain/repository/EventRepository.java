package co.edu.uptc.EventTracker.domain.repository;

import co.edu.uptc.EventTracker.domain.model.Event;
import co.edu.uptc.EventTracker.persistence.entities.EventEntity;
import co.edu.uptc.EventTracker.persistence.enums.EventStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EventRepository {

    Event save(Event event);
    Optional<Event> findById(Integer id);
    List<Event> findAll();
    void deleteById(Integer id);
    boolean existById(Integer id);
    List<Event> findActive();
    List<Event> findByName(String name);
    List<Event> findByStatus(EventStatus status);
    List<Event> findByDateBetween(LocalDateTime start, LocalDateTime end);
    boolean isActive(Integer id);
    void addLike(Integer id);
}
