package co.edu.uptc.EventTracker.persistence.crud;

import co.edu.uptc.EventTracker.persistence.entities.EventEntity;
import co.edu.uptc.EventTracker.persistence.enums.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EventJpaRepository extends JpaRepository<EventEntity, Integer> {

    List<EventEntity> findByActiveTrue();

    List<EventEntity> findByNameContainingIgnoreCase(String name);

    Optional<EventEntity> findByTicketsId(Integer id);


    List<EventEntity> findByStatus(EventStatus status);

    List<EventEntity> findByDateBetween(LocalDateTime start, LocalDateTime end);

}
