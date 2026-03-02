package co.edu.uptc.EventTracker.persistence.crud;

import co.edu.uptc.EventTracker.persistence.entities.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryJpaRepository extends JpaRepository<CategoryEntity, Integer> {
}
