package co.edu.uptc.eventtracker.persistence.crud;

import co.edu.uptc.eventtracker.persistence.entities.UserEntity;
import co.edu.uptc.eventtracker.persistence.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserJpaRepository extends JpaRepository<UserEntity, Integer> {
    Optional<UserEntity> findByEmail(String email);
    long countByRole(Role role);
}