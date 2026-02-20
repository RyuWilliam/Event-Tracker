package co.edu.uptc.EventTracker.domain.repository;

import co.edu.uptc.EventTracker.persistence.entities.EventEntity;
import co.edu.uptc.EventTracker.persistence.enums.EventStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EventRepository {

    EventEntity save(EventEntity event);
    Optional<EventEntity> findById(Integer id);
    List<EventEntity> findAll();
    void deleteById(Integer id);
    boolean existById(Integer id);
    List<EventEntity> findActive();
    List<EventEntity> findByName(String name);
    List<EventEntity> findByStatus(EventStatus status);
    List<EventEntity> findByDateBetween(LocalDateTime start, LocalDateTime end);



}
