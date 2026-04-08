package co.edu.uptc.EventTracker.persistence;

import co.edu.uptc.EventTracker.domain.model.TicketPurchase;
import co.edu.uptc.EventTracker.domain.repository.PurchaseRepository;
import co.edu.uptc.EventTracker.persistence.crud.PurchaseJpaRepository;
import co.edu.uptc.EventTracker.persistence.mapper.PurchaseMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class PurchaseRepositoryImpl implements PurchaseRepository {
    private final PurchaseJpaRepository purchaseJpaRepository;
    private final PurchaseMapper purchaseMapper;

    public PurchaseRepositoryImpl(PurchaseJpaRepository purchaseJpaRepository, PurchaseMapper purchaseMapper) {
        this.purchaseJpaRepository = purchaseJpaRepository;
        this.purchaseMapper = purchaseMapper;
    }

    @Override
    public List<TicketPurchase> findByUserId(Integer id) {
        return purchaseMapper.toPurchases(purchaseJpaRepository.findByUserId(id));
    }
}
