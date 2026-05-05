    package co.edu.uptc.eventtracker.persistence;

    import co.edu.uptc.eventtracker.domain.model.TicketPurchase;
    import co.edu.uptc.eventtracker.domain.model.TicketType;
    import co.edu.uptc.eventtracker.domain.repository.TicketRepository;
    import co.edu.uptc.eventtracker.persistence.crud.PurchaseJpaRepository;
    import co.edu.uptc.eventtracker.persistence.crud.TicketTypeJpaRepository;
    import co.edu.uptc.eventtracker.persistence.entities.TicketPurchaseEntity;
    import co.edu.uptc.eventtracker.persistence.entities.TicketTypeEntity;
    import co.edu.uptc.eventtracker.persistence.exceptions.TypeNotFoundException;
    import co.edu.uptc.eventtracker.persistence.mapper.PurchaseMapper;
    import co.edu.uptc.eventtracker.persistence.mapper.TicketTypeMapper;
    import org.springframework.stereotype.Repository;

    import java.util.List;
    import java.util.Optional;

    @Repository
    public class TicketRepositoryImpl implements TicketRepository {
        private final TicketTypeJpaRepository ticketTypeJpaRepository;
        private final PurchaseJpaRepository purchaseRepository;
        private final PurchaseMapper purchaseMapper;
        private final TicketTypeMapper typeMapper;

        public TicketRepositoryImpl(TicketTypeJpaRepository ticketTypeJpaRepository, PurchaseJpaRepository purchaseRepository, PurchaseMapper purchaseMapper, TicketTypeMapper typeMapper) {
            this.ticketTypeJpaRepository = ticketTypeJpaRepository;
            this.purchaseRepository = purchaseRepository;
            this.purchaseMapper = purchaseMapper;

            this.typeMapper = typeMapper;
        }

        @Override
        public TicketType createType(TicketType type) {
            TicketTypeEntity entity = typeMapper.toEntity(type);
            return typeMapper.toType(ticketTypeJpaRepository.save(entity));
        }

        @Override
        public TicketType modifyType(Integer id, String name) {
            TicketTypeEntity entity = ticketTypeJpaRepository.findById(id).orElse(null);
            if(entity == null){
                throw new TypeNotFoundException(id);

            }
            entity.setName(name);
            ticketTypeJpaRepository.save(entity);
            return typeMapper.toType(entity);
        }

        @Override
        public List<TicketType> findAll() {
            return typeMapper.toTypes(ticketTypeJpaRepository.findAll());
        }

        @Override
        public Optional<TicketType> getTypeById(Integer id) {
            Optional<TicketTypeEntity> entity = ticketTypeJpaRepository.findById(id);
            return entity.map(typeMapper::toType);
        }

        @Override
        public void deleteType(Integer id) {
            ticketTypeJpaRepository.deleteById(id);
        }

        @Override
        public TicketPurchase savePurchase(TicketPurchase purchase) {
            TicketPurchaseEntity entity = purchaseMapper.toEntity(purchase);
            return purchaseMapper.toPurchase(purchaseRepository.save(entity));
        }

        @Override
        public Optional<TicketPurchase> getPurchaseById(Integer id) {
            Optional<TicketPurchaseEntity> entity = purchaseRepository.findById(id);
            return entity.map(purchaseMapper::toPurchase);
        }
    }
