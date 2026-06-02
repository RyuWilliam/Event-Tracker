package co.edu.uptc.eventtracker.web;

import co.edu.uptc.eventtracker.web.dto.PaymentStatusMessage;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class PaymentStatusHandler {

    private final SimpMessagingTemplate messagingTemplate;

    public PaymentStatusHandler(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendStatus(String userId, PaymentStatusMessage message) {
        messagingTemplate.convertAndSendToUser(userId, "/queue/payment-status", message);
    }
}
