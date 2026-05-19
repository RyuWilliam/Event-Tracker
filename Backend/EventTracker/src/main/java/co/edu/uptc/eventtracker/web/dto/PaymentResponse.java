package co.edu.uptc.eventtracker.web.dto;

public class PaymentResponse {

    private Status status;
    private String message;

    public PaymentResponse(Status status, String message) {
        this.status = status;
        this.message = message;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    private enum Status {
        PENDING,
        APPROVED,
        REJECTED,
        FAILED
    }
}
