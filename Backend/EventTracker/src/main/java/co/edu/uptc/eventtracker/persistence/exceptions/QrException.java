package co.edu.uptc.eventtracker.persistence.exceptions;

public class QrException extends RuntimeException {
    public QrException(Exception e) {
        super("Error generando QR" + e);
    }
}
