package co.edu.uptc.eventtracker.messaging;

import java.time.Instant;

public class EventEnvelope<T> {
    private String eventId;
    private String eventType;
    private String eventVersion;
    private String source;
    private String correlationId;
    private String traceId;
    private Instant occurredAt;
    private T payload;

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getEventVersion() { return eventVersion; }
    public void setEventVersion(String eventVersion) { this.eventVersion = eventVersion; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public String getTraceId() { return traceId; }
    public void setTraceId(String traceId) { this.traceId = traceId; }

    public Instant getOccurredAt() { return occurredAt; }
    public void setOccurredAt(Instant occurredAt) { this.occurredAt = occurredAt; }

    public T getPayload() { return payload; }
    public void setPayload(T payload) { this.payload = payload; }
}