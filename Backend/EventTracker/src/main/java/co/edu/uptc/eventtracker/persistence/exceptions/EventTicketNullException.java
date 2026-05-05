package co.edu.uptc.eventtracker.persistence.exceptions;

public class EventTicketNullException extends RuntimeException {
    public EventTicketNullException(Integer id) {
        super("El ticket del evento con id " + id + " no existe");
    }
}
