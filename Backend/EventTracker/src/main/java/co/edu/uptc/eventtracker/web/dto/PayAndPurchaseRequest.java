package co.edu.uptc.eventtracker.web.dto;

import co.edu.uptc.eventtracker.domain.model.TicketPurchaseItem;
import java.util.List;

public class PayAndPurchaseRequest {
    private PaymentRequest payment;
    private List<TicketPurchaseItem> items;

    public PaymentRequest getPayment() { return payment; }
    public void setPayment(PaymentRequest payment) { this.payment = payment; }

    public List<TicketPurchaseItem> getItems() { return items; }
    public void setItems(List<TicketPurchaseItem> items) { this.items = items; }
}