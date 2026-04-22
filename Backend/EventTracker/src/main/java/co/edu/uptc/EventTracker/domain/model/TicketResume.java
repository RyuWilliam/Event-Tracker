package co.edu.uptc.EventTracker.domain.model;

import java.util.List;

public class TicketResume {
    private Integer id;
    private String eventName;
    private String userAddress;
    private Integer totalQuantity;
    private Double total;
    private List<TicketResumeItem> items;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public String getUserAddress() {
        return userAddress;
    }

    public void setUserAddress(String userAddress) {
        this.userAddress = userAddress;
    }

    public Integer getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(Integer totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public List<TicketResumeItem> getItems() {
        return items;
    }

    public void setItems(List<TicketResumeItem> items) {
        this.items = items;
    }
}