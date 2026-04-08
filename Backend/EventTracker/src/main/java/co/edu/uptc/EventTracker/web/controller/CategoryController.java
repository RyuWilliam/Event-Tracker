package co.edu.uptc.EventTracker.web.controller;


import co.edu.uptc.EventTracker.domain.model.EventCategory;
import co.edu.uptc.EventTracker.domain.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/categories")
public class CategoryController {



    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    public ResponseEntity<EventCategory> save(@RequestBody EventCategory category){
        return ResponseEntity.ok(categoryService.save(category));
    }

    @GetMapping
    public ResponseEntity<List<EventCategory>> findAll(){
        return ResponseEntity.ok(categoryService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<EventCategory>> findById(@PathVariable Integer id){
        return ResponseEntity.ok(categoryService.findById(id));
    }
    @PutMapping("/{id}")
    public ResponseEntity<EventCategory> edit(@PathVariable Integer id, @RequestParam String name){
        return ResponseEntity.ok(categoryService.edit(id,name));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id){
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }





}
