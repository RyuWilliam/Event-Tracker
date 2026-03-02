package co.edu.uptc.EventTracker.persistence.exceptions;

public class EventNotFoundException extends RuntimeException{
    public EventNotFoundException(Integer eventId){
        super("No se ha encontrado el evento con id " + eventId);
    }
}
