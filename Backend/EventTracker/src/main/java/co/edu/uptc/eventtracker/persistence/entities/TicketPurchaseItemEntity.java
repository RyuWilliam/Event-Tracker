package co.edu.uptc.eventtracker.persistence.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "ticket_purchase_items")
public class TicketPurchaseItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "ticket_purchase_id")
    private TicketPurchaseEntity ticketPurchase;

    @ManyToOne
    @JoinColumn(name = "event_ticket_id")
    private EventTicketEntity eventTicket;

    private Integer quantity;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public TicketPurchaseEntity getTicketPurchase() { return ticketPurchase; }
    public void setTicketPurchase(TicketPurchaseEntity ticketPurchase) { this.ticketPurchase = ticketPurchase; }

    public EventTicketEntity getEventTicket() { return eventTicket; }
    public void setEventTicket(EventTicketEntity eventTicket) { this.eventTicket = eventTicket; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}