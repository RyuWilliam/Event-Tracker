package co.edu.uptc.eventtracker.domain.model;

public class TicketPurchaseItem {
    private Integer id;
    private EventTicket eventTicket;
    private Integer quantity;

    public TicketPurchaseItem() {}

    public TicketPurchaseItem(EventTicket eventTicket, Integer quantity) {
        this.eventTicket = eventTicket;
        this.quantity = quantity;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public EventTicket getEventTicket() { return eventTicket; }
    public void setEventTicket(EventTicket eventTicket) { this.eventTicket = eventTicket; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}