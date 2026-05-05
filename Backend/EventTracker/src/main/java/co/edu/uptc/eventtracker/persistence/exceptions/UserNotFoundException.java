package co.edu.uptc.eventtracker.persistence.exceptions;

public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(Integer id) {
        super("Usuario con id " + id + " no encontrado");
    }
}