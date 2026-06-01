package co.edu.uptc.eventtracker.web;

import co.edu.uptc.eventtracker.infrastructure.filter.TraceIdHolder;
import co.edu.uptc.eventtracker.web.dto.PaymentRequest;
import co.edu.uptc.eventtracker.web.dto.PaymentResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class PaymentClient {

    private static final Logger log = LoggerFactory.getLogger(PaymentClient.class);

    private final RestTemplate restTemplate;
    private final TraceIdHolder traceIdHolder;

    @Value("${payment.service.url}")
    private String paymentServiceUrl;

    @Value("${payment.service.api-key}")
    private String apiKey;

    public PaymentClient(RestTemplate restTemplate, TraceIdHolder traceIdHolder) {
        this.restTemplate = restTemplate;
        this.traceIdHolder = traceIdHolder;
    }

    public PaymentResponse processPayment(PaymentRequest request) {
        String url = paymentServiceUrl + "/payments/process";
        String traceId = traceIdHolder.get();
        long start = System.currentTimeMillis();

        log.info("Enviando pago a pasarela — url: {} — email: {} — amount: {} — cardType: {} — cardLast4: {} — traceId: {}",
                url,
                request.getUserEmail(),
                request.getAmount(),
                request.getCard() != null ? request.getCard().getCardType() : "null",
                request.getCard() != null ? last4(request.getCard().getCardNumber()) : "null",
                traceId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("API-Key", apiKey);
        headers.set("X-Trace-Id", traceId); // ← propaga la traza a la pasarela

        HttpEntity<PaymentRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<PaymentResponse> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, PaymentResponse.class);

            PaymentResponse body = response.getBody();
            long latency = System.currentTimeMillis() - start;

            log.info("Respuesta de pasarela — httpStatus: {} — paymentStatus: {} — reason: '{}' — latencia: {}ms",
                    response.getStatusCode().value(),
                    body != null ? body.getStatus() : "NULL",
                    body != null ? body.getReason() : "-",
                    latency);

            return body;

        } catch (Exception e) {
            long latency = System.currentTimeMillis() - start;
            log.error("Error llamando a pasarela — url: {} — error: {} — latencia: {}ms",
                    url, e.getMessage(), latency);
            throw e;
        }
    }

    private String last4(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 4) return "????";
        return cardNumber.substring(cardNumber.length() - 4);
    }
}