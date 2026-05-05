package co.edu.uptc.eventtracker.web;

import co.edu.uptc.eventtracker.persistence.exceptions.EventNotFoundException;
import co.edu.uptc.eventtracker.persistence.exceptions.EventTicketNullException;
import co.edu.uptc.eventtracker.persistence.exceptions.InsufficientStockException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final String ERROR_KEY = "error";

    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<Map<String, String>> handleInsufficientStock(InsufficientStockException e) {
        return ResponseEntity.badRequest()
                .body(Map.of(ERROR_KEY, e.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalState(IllegalStateException e) {
        return ResponseEntity.badRequest()
                .body(Map.of(ERROR_KEY, e.getMessage()));
    }

    @ExceptionHandler(EventNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleEventNotFound(EventNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of(ERROR_KEY, e.getMessage()));
    }

    @ExceptionHandler(EventTicketNullException.class)
    public ResponseEntity<Map<String, String>> handleEventTicketNull(EventTicketNullException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of(ERROR_KEY, e.getMessage()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(ERROR_KEY, e.getMessage()));
    }
}