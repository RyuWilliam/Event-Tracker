package co.edu.uptc.EventTracker.domain.repository;

import co.edu.uptc.EventTracker.domain.model.EventCategory;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository {

    EventCategory save(EventCategory category);
    List<EventCategory> findAll();
    Optional<EventCategory> findById(Integer id);
    EventCategory edit(Integer id, String name);
    void delete(Integer id);

}
