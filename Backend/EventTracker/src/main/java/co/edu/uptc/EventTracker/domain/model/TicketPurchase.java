package co.edu.uptc.EventTracker.domain.model;

public class TicketPurchase {
    private Integer id;
    private EventTicket eventTicket;
    private User user;
    private Integer quantity;


    public TicketPurchase(){

    }

    public TicketPurchase(Integer quantity, User user, EventTicket eventTicket) {
        this.quantity = quantity;
        this.user = user;
        this.eventTicket = eventTicket;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public EventTicket getEventTicket() {
        return eventTicket;
    }

    public void setEventTicket(EventTicket eventTicket) {
        this.eventTicket = eventTicket;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
