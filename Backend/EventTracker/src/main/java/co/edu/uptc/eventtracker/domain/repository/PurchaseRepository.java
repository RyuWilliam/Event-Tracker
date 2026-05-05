package co.edu.uptc.eventtracker.domain.repository;

import co.edu.uptc.eventtracker.domain.model.TicketPurchase;

import java.util.List;

public interface PurchaseRepository {

    List<TicketPurchase> findByUserId(Integer id);
 }
