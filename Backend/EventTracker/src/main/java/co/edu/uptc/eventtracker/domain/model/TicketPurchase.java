package co.edu.uptc.eventtracker.domain.model;

import java.util.List;

public class TicketPurchase {
    private Integer id;
    private User user;
    private List<TicketPurchaseItem> items;

    public TicketPurchase() {}

    public TicketPurchase(User user, List<TicketPurchaseItem> items) {
        this.user = user;
        this.items = items;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public List<TicketPurchaseItem> getItems() { return items; }
    public void setItems(List<TicketPurchaseItem> items) { this.items = items; }
}