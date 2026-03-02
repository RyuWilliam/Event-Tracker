package co.edu.uptc.EventTracker.persistence.exceptions;

public class EventNotActiveException extends RuntimeException {
    public EventNotActiveException(Integer id) {
        super("Evento con id " + id + " inactivo");
    }
}
