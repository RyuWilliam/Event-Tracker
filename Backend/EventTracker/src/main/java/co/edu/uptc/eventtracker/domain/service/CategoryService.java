package co.edu.uptc.eventtracker.domain.service;

import co.edu.uptc.eventtracker.domain.model.EventCategory;
import co.edu.uptc.eventtracker.domain.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;


    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public EventCategory save(EventCategory category){
        return categoryRepository.save(category);
    }

    public List<EventCategory> findAll(){
        return categoryRepository.findAll();
    }

    public Optional<EventCategory> findById(Integer id){
        return categoryRepository.findById(id);
    }

    public EventCategory edit(Integer id, String name){
        return categoryRepository.edit(id,name);
    }
    public void delete (Integer id){
        categoryRepository.delete(id);
    }




}
