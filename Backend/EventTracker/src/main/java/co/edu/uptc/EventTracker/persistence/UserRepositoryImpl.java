package co.edu.uptc.EventTracker.persistence;

import co.edu.uptc.EventTracker.domain.model.User;
import co.edu.uptc.EventTracker.domain.repository.UserRepository;
import co.edu.uptc.EventTracker.persistence.crud.EventJpaRepository;
import co.edu.uptc.EventTracker.persistence.crud.UserJpaRepository;
import co.edu.uptc.EventTracker.persistence.entities.Favorite;
import co.edu.uptc.EventTracker.persistence.entities.UserEntity;
import co.edu.uptc.EventTracker.persistence.entities.EventEntity;
import co.edu.uptc.EventTracker.persistence.mapper.UserMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@Transactional
public class UserRepositoryImpl implements UserRepository {

    private final UserJpaRepository userJpaRepository;
    private final EventJpaRepository eventJpaRepository;
    private final UserMapper userMapper;

    public UserRepositoryImpl(UserJpaRepository userJpaRepository,
                              EventJpaRepository eventJpaRepository,
                              UserMapper userMapper) {
        this.userJpaRepository = userJpaRepository;
        this.eventJpaRepository = eventJpaRepository;
        this.userMapper = userMapper;
    }

    @Override
    public Optional<User> findById(Integer id) {
        return userJpaRepository.findById(id)
                .map(userMapper::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userJpaRepository.findByEmail(email)
                .map(userMapper::toDomain);
    }

    @Override
    public List<User> findAll() {
        return userJpaRepository.findAll()
                .stream()
                .map(userMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public User save(User user) {

        UserEntity entity;

        if (user.getId() != null) {

            entity = userJpaRepository.findById(user.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            entity.setName(user.getName());
            entity.setEmail(user.getEmail());
            entity.setRole(user.getRole());

        } else {
            entity = userMapper.toEntity(user);
        }

        UserEntity saved = userJpaRepository.save(entity);

        return userMapper.toDomain(saved);
    }

    @Override
    public void deleteById(Integer id) {
        userJpaRepository.deleteById(id);
    }


    @Override
    public void addFavorite(Integer userId, Integer eventId) {

        UserEntity user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean alreadyExists = user.getFavorites()
                .stream()
                .anyMatch(f -> f.getEvent().getEventId().equals(eventId));

        if (alreadyExists) {
            return;
        }

        EventEntity event = eventJpaRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        if(event.getActive() == false){
            throw new RuntimeException("Event not active");
        }
        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setEvent(event);

        user.getFavorites().add(favorite);

        userJpaRepository.save(user);
    }

    @Override
    public void removeFavorite(Integer userId, Integer eventId) {

        UserEntity user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.getFavorites()
                .removeIf(f -> f.getEvent().getEventId().equals(eventId));

        userJpaRepository.save(user);
    }

    @Override
    public Map<String, Long> getFavoriteReport() {

        return userJpaRepository.findAll()
                .stream()
                .flatMap(user -> user.getFavorites().stream())
                .collect(Collectors.groupingBy(
                        f -> f.getEvent().getName(),
                        Collectors.counting()
                ))
                .entrySet()
                .stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));
    }
}