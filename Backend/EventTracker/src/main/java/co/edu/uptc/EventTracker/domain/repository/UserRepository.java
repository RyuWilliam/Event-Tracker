package co.edu.uptc.EventTracker.domain.repository;

import co.edu.uptc.EventTracker.domain.model.User;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface UserRepository {

    Optional<User> findById(Integer id);

    Optional<User> findByEmail(String email);

    List<User> findAll();

    User save(User user);

    void deleteById(Integer id);

    void addFavorite(Integer userId, Integer eventId);

    void removeFavorite(Integer userId, Integer eventId);

    Map<String, Long> getFavoriteReport();
}