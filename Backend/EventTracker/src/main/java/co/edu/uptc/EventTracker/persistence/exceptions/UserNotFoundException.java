package co.edu.uptc.EventTracker.persistence.exceptions;

public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(Integer id) {
        super("Usuario con id " + id + " no encontrado");
    }
}