package co.edu.uptc.EventTracker.domain.model;

import co.edu.uptc.EventTracker.persistence.enums.EventStatus;

import java.time.LocalDateTime;

public class Event {

    private Integer id;
    private String name;
    private String description;
    private LocalDateTime date;
    private EventStatus status;

    private Event(){

    }

    public Event(Integer id, String name, String description, LocalDateTime date, EventStatus status) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.date = date;
        this.status = status;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public EventStatus getStatus() {
        return status;
    }

    public void setStatus(EventStatus status) {
        this.status = status;
    }
}
