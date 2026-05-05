package co.edu.uptc.eventtracker.persistence.mapper;

import co.edu.uptc.eventtracker.domain.model.EventCategory;
import co.edu.uptc.eventtracker.persistence.entities.CategoryEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class CategoryMapper {
    public EventCategory toCategory(CategoryEntity entity){
        EventCategory category = new EventCategory();
        category.setId(entity.getId());
        category.setName(entity.getName());
        return category;
    }
    public List<EventCategory> toCategories(List<CategoryEntity> entities){
        List<EventCategory> categories = new ArrayList<>();
        for (CategoryEntity entity: entities){
            categories.add(toCategory(entity));
        }
        return categories;
    }
    public CategoryEntity toEntity(EventCategory category) {
        CategoryEntity entity = new CategoryEntity();
        entity.setId(category.getId());
        entity.setName(category.getName());
        return entity;
    }
    public List<CategoryEntity> toEntities(List<EventCategory> categories){
        List<CategoryEntity> entities = new ArrayList<>();
        for (EventCategory category: categories){
            entities.add(toEntity(category));
        }
        return entities;
    }
    }


