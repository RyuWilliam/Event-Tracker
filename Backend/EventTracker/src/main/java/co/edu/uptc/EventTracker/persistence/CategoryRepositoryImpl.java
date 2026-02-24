package co.edu.uptc.EventTracker.persistence;

import co.edu.uptc.EventTracker.domain.model.EventCategory;
import co.edu.uptc.EventTracker.domain.repository.CategoryRepository;
import co.edu.uptc.EventTracker.persistence.crud.CategoryJpaRepository;
import co.edu.uptc.EventTracker.persistence.entities.CategoryEntity;
import co.edu.uptc.EventTracker.persistence.mapper.CategoryMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class CategoryRepositoryImpl implements CategoryRepository {

    private final CategoryMapper categoryMapper;
    private final CategoryJpaRepository categoryJpaRepository;

    public CategoryRepositoryImpl(CategoryMapper categoryMapper, CategoryJpaRepository categoryJpaRepository) {
        this.categoryMapper = categoryMapper;
        this.categoryJpaRepository = categoryJpaRepository;
    }

    @Override
    public EventCategory save(EventCategory category) {
        CategoryEntity entity= categoryMapper.toEntity(category);
        CategoryEntity persisted = categoryJpaRepository.save(entity);
        return categoryMapper.toCategory(persisted);
    }

    @Override
    public List<EventCategory> findAll() {
        return categoryMapper.toCategories(categoryJpaRepository.findAll());
    }

    @Override
    public Optional<EventCategory> findById(Integer id) {
        CategoryEntity entity = categoryJpaRepository.findById(id).orElse(null);

        if(entity == null){
            return Optional.empty();
        }

        return Optional.of(categoryMapper.toCategory(entity));
    }

    @Override
    public EventCategory edit(Integer id, String name) {
        CategoryEntity entity = categoryJpaRepository.findById(id).orElse(null);
        if(entity == null){
            return null;
        }
        entity.setName(name);
        return categoryMapper.toCategory(categoryJpaRepository.save(entity));
    }

    @Override
    public void delete(Integer id) {
        categoryJpaRepository.deleteById(id);
    }
}
