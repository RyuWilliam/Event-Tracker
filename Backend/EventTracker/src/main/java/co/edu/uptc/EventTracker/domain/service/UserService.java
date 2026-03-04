package co.edu.uptc.EventTracker.domain.service;

import co.edu.uptc.EventTracker.domain.model.Event;
import co.edu.uptc.EventTracker.domain.model.User;
import co.edu.uptc.EventTracker.domain.repository.UserRepository;
import co.edu.uptc.EventTracker.persistence.exceptions.UserNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public User findById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public void delete(Integer id) {
        userRepository.deleteById(id);
    }

    public void addFavorite(Integer userId, Integer eventId) {

        if (!userRepository.findById(userId).isPresent()) {
            throw new UserNotFoundException("User not found");
        }

        userRepository.addFavorite(userId, eventId);
    }

    public void removeFavorite(Integer userId, Integer eventId) {

        if (!userRepository.findById(userId).isPresent()) {
            throw new UserNotFoundException("User not found");
        }

        userRepository.removeFavorite(userId, eventId);
    }

    public List<Event> getFavorites(Integer id){

        User user  = userRepository.findById(id).orElse(null);
        if(user == null){
            throw new UserNotFoundException("user not found");
        }
        return user.getFavoriteEvents();
    }

    public Map<Integer, Long> getFavoriteReport() {
        return userRepository.getFavoriteReport();
    }
}