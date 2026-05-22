package co.edu.uptc.eventtracker.persistence.exceptions;

public class PaymentDeclinedException extends RuntimeException {
    public PaymentDeclinedException(String reason) {
        super("Pago rechazado: " + reason);
    }
}