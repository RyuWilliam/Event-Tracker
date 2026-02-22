package co.edu.uptc.EventTracker.web.controller;

import co.edu.uptc.EventTracker.domain.model.Event;
import co.edu.uptc.EventTracker.domain.service.EventService;
import co.edu.uptc.EventTracker.persistence.entities.EventEntity;
import co.edu.uptc.EventTracker.persistence.enums.EventStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAll() {
        return ResponseEntity.ok(eventService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getById(@PathVariable Integer id) {
        Event event = eventService.findById(id);
        if (event == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(event);
    }

    @PostMapping
    public ResponseEntity<Event> create(@RequestBody Event event) {
        return ResponseEntity.ok(eventService.save(event));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> update(
            @PathVariable Integer id,
            @RequestBody Event event) {
        return ResponseEntity.ok(eventService.modify(id, event));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/filter/name")
    public ResponseEntity<List<Event>> findByName(
            @RequestParam String name) {
        return ResponseEntity.ok(eventService.findByName(name));
    }

    @GetMapping("/filter/status")
    public ResponseEntity<List<Event>> findByStatus(
            @RequestParam EventStatus status) {
        return ResponseEntity.ok(eventService.findByStatus(status));
    }

    @GetMapping("/filter/date")
    public ResponseEntity<List<Event>> findByDateRange(
            @RequestParam
            LocalDateTime start,
            @RequestParam
            LocalDateTime end) {

        return ResponseEntity.ok(eventService.findByDateBetween(start, end));
    }
}