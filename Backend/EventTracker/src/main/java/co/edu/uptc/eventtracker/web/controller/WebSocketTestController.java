package co.edu.uptc.eventtracker.web.controller;

import co.edu.uptc.eventtracker.web.PaymentStatusHandler;
import co.edu.uptc.eventtracker.web.dto.PaymentStatusMessage;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/tracker/api/ws-test")
public class WebSocketTestController {

    private final PaymentStatusHandler paymentStatusHandler;

    public WebSocketTestController(PaymentStatusHandler paymentStatusHandler) {
        this.paymentStatusHandler = paymentStatusHandler;
    }

    @PostMapping("/notify/{userId}")
    public ResponseEntity<Void> notifyUser(
            @PathVariable String userId,
            @RequestBody(required = false) PaymentStatusMessage message
    ) {
        PaymentStatusMessage payload = message != null
                ? message
                : new PaymentStatusMessage(
                        "APPROVED",
                        "Payment approved (test).",
                        UUID.randomUUID().toString()
                );

        paymentStatusHandler.sendStatus(userId, payload);
        return ResponseEntity.accepted().build();
    }
}
