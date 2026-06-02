package co.edu.uptc.eventtracker.web;

import co.edu.uptc.eventtracker.web.dto.PaymentRequest;
import co.edu.uptc.eventtracker.web.dto.PaymentResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class PaymentClient {

    private final RestTemplate restTemplate;

    @Value("${payment.service.url}")
    private String paymentServiceUrl;

    @Value("${payment.service.api-key}")
    private String apiKey;

    public PaymentClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public PaymentResponse processPayment(PaymentRequest request) {
        String url = paymentServiceUrl + "/payments/process";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("API-Key", apiKey);

        HttpEntity<PaymentRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<PaymentResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                PaymentResponse.class
        );

        return response.getBody();
    }
}
