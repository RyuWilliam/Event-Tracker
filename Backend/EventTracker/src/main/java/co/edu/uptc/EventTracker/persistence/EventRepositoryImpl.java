package co.edu.uptc.EventTracker.persistence;

import co.edu.uptc.EventTracker.domain.model.Event;
import co.edu.uptc.EventTracker.domain.repository.EventRepository;
import co.edu.uptc.EventTracker.persistence.crud.EventJpaRepository;
import co.edu.uptc.EventTracker.persistence.entities.EventEntity;
import co.edu.uptc.EventTracker.persistence.enums.EventStatus;
import co.edu.uptc.EventTracker.persistence.mapper.EventMapper;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Repository
public class EventRepositoryImpl implements EventRepository {

    private final EventMapper eventMapper;

    private final EventJpaRepository eventJpaRepository;

    public EventRepositoryImpl(EventMapper eventMapper, EventJpaRepository eventJpaRepository) {
        this.eventMapper = eventMapper;
        this.eventJpaRepository = eventJpaRepository;
    }

    @Override
    public Event save(Event event) {
        EventEntity entity = eventMapper.toEntity(event);
        entity.setActive(true);
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
        return entity.getActive();
    }

}
