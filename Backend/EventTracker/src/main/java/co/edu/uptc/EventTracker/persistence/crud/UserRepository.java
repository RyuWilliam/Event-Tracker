package co.edu.uptc.EventTracker.persistence.crud;

import co.edu.uptc.EventTracker.persistence.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
}