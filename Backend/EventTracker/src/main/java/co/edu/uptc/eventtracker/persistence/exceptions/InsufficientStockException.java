package co.edu.uptc.eventtracker.persistence.exceptions;

public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(String name) {
        super("No hay suficiente stock para las boletas del evento " + name);
    }
}
