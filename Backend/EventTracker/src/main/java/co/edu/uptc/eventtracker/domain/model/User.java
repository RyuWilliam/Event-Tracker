package co.edu.uptc.eventtracker.domain.model;

import co.edu.uptc.eventtracker.persistence.enums.Role;

import java.util.List;

public class User {

    private Integer id;
    private String name;
    private String email;
    private Role role;
    private List<Event> favoriteEvents;

    public User() {
    }

    public User(Integer id, String name, String email, Role role, List<Event> favoriteEvents) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.favoriteEvents = favoriteEvents;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public List<Event> getFavoriteEvents() {
        return favoriteEvents;
    }

    public void setFavoriteEvents(List<Event> favoriteEvents) {
        this.favoriteEvents = favoriteEvents;
    }
}