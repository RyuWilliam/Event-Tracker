package co.edu.uptc.eventtracker.persistence.exceptions;

public class TypeNotFoundException extends RuntimeException {
    public TypeNotFoundException(Integer id) {
        super("Tipo de evento no encontrado " + id);
    }
}
