package co.edu.uptc.eventtracker.web.dto;

public class PaymentStatusMessage {
    private String status;
    private String userMessage;
    private String correlationId;

    public PaymentStatusMessage() {
    }

    public PaymentStatusMessage(String status, String userMessage, String correlationId) {
        this.status = status;
        this.userMessage = userMessage;
        this.correlationId = correlationId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getUserMessage() {
        return userMessage;
    }

    public void setUserMessage(String userMessage) {
        this.userMessage = userMessage;
    }

    public String getCorrelationId() {
        return correlationId;
    }

    public void setCorrelationId(String correlationId) {
        this.correlationId = correlationId;
    }
}
