// co.edu.uptc.eventtracker.web.dto.PaymentResponse.java
package co.edu.uptc.eventtracker.web.dto;

public class PaymentResponse {
    private String status;
    private String reason;  // ← era "message", cámbialo a "reason"

    public PaymentResponse() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}