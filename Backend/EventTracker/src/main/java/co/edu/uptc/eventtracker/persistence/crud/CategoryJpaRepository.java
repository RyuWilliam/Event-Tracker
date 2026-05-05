package co.edu.uptc.eventtracker.persistence.crud;

import co.edu.uptc.eventtracker.persistence.entities.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryJpaRepository extends JpaRepository<CategoryEntity, Integer> {
}
