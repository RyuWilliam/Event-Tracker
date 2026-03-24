package co.edu.uptc.EventTracker.persistence.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "tickets")
public class TicketPurchaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    private UserEntity user;

    @ManyToOne
    private EventTicketEntity eventTicket;

    private Integer quantity;


    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    public EventTicketEntity getEventTicket() {
        return eventTicket;
    }

    public void setEventTicket(EventTicketEntity eventTicket) {
        this.eventTicket = eventTicket;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}