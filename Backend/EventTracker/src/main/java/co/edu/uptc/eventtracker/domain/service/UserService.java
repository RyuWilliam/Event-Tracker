package co.edu.uptc.eventtracker.domain.service;

import co.edu.uptc.eventtracker.domain.model.Event;
import co.edu.uptc.eventtracker.domain.model.User;
import co.edu.uptc.eventtracker.domain.repository.UserRepository;
import co.edu.uptc.eventtracker.persistence.exceptions.UserNotFoundException;
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
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public void delete(Integer id) {
        userRepository.deleteById(id);
    }

    public void addFavorite(Integer userId, Integer eventId) {

        if (!userRepository.findById(userId).isPresent()) {
            throw new UserNotFoundException(userId);
        }

        userRepository.addFavorite(userId, eventId);
    }

    public void removeFavorite(Integer userId, Integer eventId) {

        if (!userRepository.findById(userId).isPresent()) {
            throw new UserNotFoundException(userId);
        }

        userRepository.removeFavorite(userId, eventId);
    }

    public List<Event> getFavorites(Integer id){

        User user  = userRepository.findById(id).orElse(null);
        if(user == null){
            throw new UserNotFoundException(id);
        }
        return user.getFavoriteEvents();
    }

    public Map<String, Long> getFavoriteReport() {
        return userRepository.getFavoriteReport();
    }
}