package co.edu.uptc.EventTracker.domain.repository;

import co.edu.uptc.EventTracker.domain.model.TicketPurchase;

import java.util.List;

public interface PurchaseRepository {

    List<TicketPurchase> findByUserId(Integer id);
 }
