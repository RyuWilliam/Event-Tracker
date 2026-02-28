package co.edu.uptc.EventTracker.persistence;

import co.edu.uptc.EventTracker.domain.model.Event;
import co.edu.uptc.EventTracker.domain.model.EventCategory;
import co.edu.uptc.EventTracker.domain.repository.EventRepository;
import co.edu.uptc.EventTracker.domain.service.ImageService;
import co.edu.uptc.EventTracker.persistence.crud.EventJpaRepository;
import co.edu.uptc.EventTracker.persistence.entities.CategoryEntity;
import co.edu.uptc.EventTracker.persistence.entities.EventEntity;
import co.edu.uptc.EventTracker.persistence.enums.EventStatus;
import co.edu.uptc.EventTracker.persistence.mapper.CategoryMapper;
import co.edu.uptc.EventTracker.persistence.mapper.EventMapper;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@Repository
public class EventRepositoryImpl implements EventRepository {

    private final EventMapper eventMapper;
    private final CategoryMapper categoryMapper;
    private final CategoryRepositoryImpl categoryRepository;
    private final EventJpaRepository eventJpaRepository;
    private final ImageService imageService;

    public EventRepositoryImpl(EventMapper eventMapper, CategoryMapper categoryMapper, CategoryRepositoryImpl categoryRepository, EventJpaRepository eventJpaRepository, ImageService imageService) {
        this.eventMapper = eventMapper;
        this.categoryMapper = categoryMapper;
        this.categoryRepository = categoryRepository;
        this.eventJpaRepository = eventJpaRepository;
        this.imageService = imageService;
    }

    @Override
    public Event save(Event event) {
        EventEntity entity = eventMapper.toEntity(event);
        entity.setActive(true);
        entity.setLikes(0);
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
    public List<Event> findAll() {
        return eventMapper.toEvents(eventJpaRepository.findAll());
    }

    @Override
    public void deleteById(Integer id) {
        EventEntity event = eventJpaRepository.findById(id).orElse(null);
        if(event == null){
            throw new RuntimeException();
        }
        if (event.getImageUrl() != null) {
            imageService.deleteImageFile(event.getImageUrl());
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
            return entity.getActive();
        }
        return false;
    }

    @Override
    public void addLike(Integer id) {
        EventEntity entity = eventJpaRepository.findById(id).orElse(null);
        if(entity != null){
            entity.setLikes(entity.getLikes()+1);
            eventJpaRepository.save(entity);
        }
    }

    public EventEntity saveRaw(EventEntity event){
        return eventJpaRepository.save(event);
    }

}
