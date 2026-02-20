package co.edu.uptc.EventTracker.persistence;

import co.edu.uptc.EventTracker.domain.repository.EventRepository;
import co.edu.uptc.EventTracker.persistence.crud.EventJpaRepository;
import co.edu.uptc.EventTracker.persistence.entities.EventEntity;
import co.edu.uptc.EventTracker.persistence.enums.EventStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public class EventRepositoryImpl implements EventRepository {

    private final EventJpaRepository eventJpaRepository;

    public EventRepositoryImpl(EventJpaRepository eventJpaRepository) {
        this.eventJpaRepository = eventJpaRepository;
    }

    @Override
    public EventEntity save(EventEntity event) {
        event.setActive(true);
        return eventJpaRepository.save(event);
    }

    @Override
    public Optional<EventEntity> findById(Integer id) {
        return eventJpaRepository.findById(id);
    }

    @Override
    public List<EventEntity> findAll() {
        return eventJpaRepository.findAll();
    }

    @Override
    public void deleteById(Integer id) {
        EventEntity event = eventJpaRepository.findById(id).orElse(null);
        if(event == null){
            throw new RuntimeException();
        }
        event.setActive(false);
    }

    @Override
    public boolean existById(Integer id) {
        return eventJpaRepository.existsById(id);
    }

    @Override
    public List<EventEntity> findActive() {
        return eventJpaRepository.findByActiveTrue();
    }

    @Override
    public List<EventEntity> findByName(String name) {
        return eventJpaRepository.findByNameContainingIgnoreCase(name);
    }

    @Override
    public List<EventEntity> findByStatus(EventStatus status) {
        return eventJpaRepository.findByStatus(status);
    }

    @Override
    public List<EventEntity> findByDateBetween(LocalDateTime start, LocalDateTime end) {
        return eventJpaRepository.findByDateBetween(start,end);
    }

}
