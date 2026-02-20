package co.edu.uptc.EventTracker.persistence.crud;

import co.edu.uptc.EventTracker.persistence.entities.EventEntity;
import co.edu.uptc.EventTracker.persistence.enums.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface EventJpaRepository extends JpaRepository<EventEntity, Integer> {

    List<EventEntity> findByActiveTrue();

    List<EventEntity> findByNameContainingIgnoreCase(String name);

    List<EventEntity> findByCategoryIgnoreCase(String category);

    List<EventEntity> findByStatus(EventStatus status);

    List<EventEntity> findByDateBetween(LocalDateTime start, LocalDateTime end);

}
