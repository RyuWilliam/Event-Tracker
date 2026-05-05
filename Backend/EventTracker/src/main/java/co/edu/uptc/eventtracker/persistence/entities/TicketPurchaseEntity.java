package co.edu.uptc.eventtracker.persistence.entities;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "tickets")
public class TicketPurchaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    private UserEntity user;

    @OneToMany(mappedBy = "ticketPurchase", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TicketPurchaseItemEntity> items;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public UserEntity getUser() { return user; }
    public void setUser(UserEntity user) { this.user = user; }

    public List<TicketPurchaseItemEntity> getItems() { return items; }
    public void setItems(List<TicketPurchaseItemEntity> items) { this.items = items; }
}