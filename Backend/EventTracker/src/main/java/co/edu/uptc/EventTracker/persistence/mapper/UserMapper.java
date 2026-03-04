package co.edu.uptc.EventTracker.persistence.mapper;

import co.edu.uptc.EventTracker.domain.model.Event;
import co.edu.uptc.EventTracker.domain.model.User;
import co.edu.uptc.EventTracker.persistence.entities.Favorite;
import co.edu.uptc.EventTracker.persistence.entities.UserEntity;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    private final EventMapper eventMapper;

    public UserMapper(EventMapper eventMapper) {
        this.eventMapper = eventMapper;
    }

    public User toDomain(UserEntity entity) {

        List<Event> favorites = entity.getFavorites() == null
                ? Collections.emptyList()
                : entity.getFavorites()
                .stream()
                .map(Favorite::getEvent)
                .map(eventMapper::toEvent)
                .collect(Collectors.toList());

        return new User(
                entity.getId(),
                entity.getName(),
                entity.getEmail(),
                entity.getRole(),
                favorites
        );
    }

    public UserEntity toEntity(User domain) {

        UserEntity entity = new UserEntity();

        entity.setId(domain.getId());
        entity.setName(domain.getName());
        entity.setEmail(domain.getEmail());
        entity.setRole(domain.getRole());

        if (domain.getFavoriteEvents() != null) {

            List<Favorite> favorites = domain.getFavoriteEvents()
                    .stream()
                    .map(event -> {
                        Favorite favorite = new Favorite();
                        favorite.setUser(entity);
                        favorite.setEvent(eventMapper.toEntity(event));
                        return favorite;
                    })
                    .collect(Collectors.toList());

            entity.setFavorites(favorites);
        }

        return entity;
    }
}