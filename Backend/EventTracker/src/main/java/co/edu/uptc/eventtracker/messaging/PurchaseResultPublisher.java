package co.edu.uptc.eventtracker.messaging;

import co.edu.uptc.eventtracker.config.RabbitConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

@Component
public class PurchaseResultPublisher {

    private final RabbitTemplate rabbitTemplate;

    public PurchaseResultPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publish(PurchaseResultEvent payload, String correlationId) {
        EventEnvelope<PurchaseResultEvent> envelope = new EventEnvelope<>();
        envelope.setEventId(UUID.randomUUID().toString());
        envelope.setEventType("purchase.result");
        envelope.setEventVersion("v1");
        envelope.setSource("event-tracker");
        envelope.setCorrelationId(correlationId);
        envelope.setTraceId(correlationId);
        envelope.setOccurredAt(Instant.now());
        envelope.setPayload(payload);

        rabbitTemplate.convertAndSend(
                RabbitConfig.NOTIFICATIONS_EXCHANGE,
                RabbitConfig.RK_PURCHASE_RESULT,
                envelope
        );
    }
}