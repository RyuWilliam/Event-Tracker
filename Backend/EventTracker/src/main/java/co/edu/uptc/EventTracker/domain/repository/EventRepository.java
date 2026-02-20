package co.edu.uptc.EventTracker.domain.repository;

import co.edu.uptc.EventTracker.persistence.entities.EventEntity;

import java.util.List;
import java.util.Optional;

public interface EventRepository {

    EventEntity save(EventEntity event);
    Optional<EventEntity> findById(Integer id);
    List<EventEntity> findAll();
    void deleteById(Integer id);
    boolean existById(Integer id);


}
