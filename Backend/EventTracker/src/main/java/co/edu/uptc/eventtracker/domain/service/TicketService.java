package co.edu.uptc.eventtracker.domain.service;

import co.edu.uptc.eventtracker.domain.model.*;
import co.edu.uptc.eventtracker.domain.repository.*;
import co.edu.uptc.eventtracker.persistence.exceptions.InsufficientStockException;
import co.edu.uptc.eventtracker.persistence.exceptions.PaymentDeclinedException;
import co.edu.uptc.eventtracker.persistence.exceptions.QrException;
import co.edu.uptc.eventtracker.web.PaymentClient;
import co.edu.uptc.eventtracker.web.dto.PaymentRequest;
import co.edu.uptc.eventtracker.web.dto.PaymentResponse;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TicketService {

    private static final Logger log = LoggerFactory.getLogger(TicketService.class);
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final TicketResumeBuilder ticketResumeBuilder;
    private final PurchaseRepository purchaseRepository;
    private final EventRepository eventRepository;
    private final EventTicketRepository eventTicketRepository;
    private final PaymentClient paymentClient;

    public TicketService(UserRepository userRepository, TicketRepository ticketRepository,
                         TicketResumeBuilder ticketResumeBuilder, PurchaseRepository purchaseRepository, EventRepository eventRepository,
                         EventTicketRepository eventTicketRepository, PaymentClient paymentClient) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.ticketResumeBuilder = ticketResumeBuilder;
        this.purchaseRepository = purchaseRepository;
        this.eventRepository = eventRepository;
        this.eventTicketRepository = eventTicketRepository;
        this.paymentClient = paymentClient;
    }

    public TicketType createType(TicketType type) { return ticketRepository.createType(type); }
    public TicketType modifyType(Integer id, String name) { return ticketRepository.modifyType(id, name); }
    public Optional<TicketType> getTypeById(Integer id) { return ticketRepository.getTypeById(id); }
    public List<TicketType> findAll() { return ticketRepository.findAll(); }
    public void deleteType(Integer id) { ticketRepository.deleteType(id); }

    public TicketResume registerSale(TicketPurchase request) {
        TicketPurchase purchase = buildFromRequest(request);

        Event event = null;
        for (TicketPurchaseItem item : purchase.getItems()) {
            EventTicket eventTicket = item.getEventTicket();
            event = eventRepository.findByEventTicketId(eventTicket.getId());

            if (item.getQuantity() > eventTicket.getAvailableQuantity()) {
                throw new InsufficientStockException(event.getName());
            }
            eventTicket.setSoldQuantity(eventTicket.getSoldQuantity() + item.getQuantity());
            eventTicketRepository.save(eventTicket);
        }

        TicketPurchase saved = savePurchase(purchase);
        return ticketResumeBuilder.buildFromPurchase(saved, event);
    }
    public TicketPurchase savePurchase(TicketPurchase purchase) {
        return ticketRepository.savePurchase(purchase);
    }

    private TicketPurchase buildFromRequest(TicketPurchase request) {
        User user = userRepository.findById(request.getUser().getId()).orElse(null);

        List<TicketPurchaseItem> resolvedItems = request.getItems().stream()
                .map(item -> {
                    EventTicket eventTicket = eventTicketRepository
                            .findById(item.getEventTicket().getId())
                            .orElse(null);
                    return new TicketPurchaseItem(eventTicket, item.getQuantity());
                })
                .toList();

        return new TicketPurchase(user, resolvedItems);
    }

    public Optional<TicketPurchase> getPurchaseById(Integer id) {
        return ticketRepository.getPurchaseById(id);
    }

    public List<TicketResume> getTickets(Integer id) {
        List<TicketPurchase> purchases = purchaseRepository.findByUserId(id);
        List<TicketResume> tickets = new ArrayList<>();
        for (TicketPurchase purchase : purchases) {
            Event event = eventRepository.findByEventTicketId(
                    purchase.getItems().get(0).getEventTicket().getId()
            );
            tickets.add(ticketResumeBuilder.buildFromPurchase(purchase, event));
        }
        return tickets;
    }

    public byte[] generateQrFromPurchase(TicketPurchase purchase) {
        Event event = eventRepository.findByEventTicketId(
                purchase.getItems().get(0).getEventTicket().getId()
        );
        TicketResume resume = ticketResumeBuilder.buildFromPurchase(purchase, event);
        return generateFromTicketResume(resume);
    }

    public byte[] generateFromTicketResume(TicketResume resume) {
        String content = buildContent(resume);
        try {
            QRCodeWriter qrWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrWriter.encode(content, BarcodeFormat.QR_CODE, 300, 300);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new QrException(e);
        }
    }

    private String buildContent(TicketResume resume) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Evento: %s | Email: %s | Total: $%.2f%n",
                resume.getEventName(),
                resume.getUserAddress(),
                resume.getTotal()));

        for (TicketResumeItem item : resume.getItems()) {
            sb.append(String.format("  - %s x%d → $%.2f%n",
                    item.getType().getName(),
                    item.getQuantity(),
                    item.getSubtotal()));
        }

        return sb.toString();
    }
    public TicketResume processPaymentAndRegisterSale(PaymentRequest paymentRequest,
                                                      TicketPurchase purchase) {
        List<TicketPurchaseItem> resolvedItems = purchase.getItems().stream()
                .map(item -> {
                    EventTicket eventTicket = eventTicketRepository
                            .findById(item.getEventTicket().getId())
                            .orElse(null);
                    return new TicketPurchaseItem(eventTicket, item.getQuantity());
                })
                .toList();

        double realAmount = resolvedItems.stream()
                .mapToDouble(item -> item.getEventTicket().getPrice() * item.getQuantity())
                .sum();

        paymentRequest.setAmount(realAmount);

        log.info("Iniciando compra — userId: {} — email: {} — items: {} — totalCalculado: {}",
                purchase.getUser() != null ? purchase.getUser().getId() : "null",
                paymentRequest.getUserEmail(),
                resolvedItems.size(),
                realAmount);

        PaymentResponse paymentResponse = paymentClient.processPayment(paymentRequest);

        if (paymentResponse == null || !"APPROVED".equalsIgnoreCase(paymentResponse.getStatus())) {
            String reason = paymentResponse != null ? paymentResponse.getReason() : "Sin respuesta del servicio de pagos";
            log.warn("Pago no aprobado — status: {} — reason: '{}'",
                    paymentResponse != null ? paymentResponse.getStatus() : "NULL",
                    reason);
            throw new PaymentDeclinedException(reason);
        }

        log.info("Pago aprobado — registrando venta");
        TicketResume resume = registerSale(purchase);
        log.info("Venta registrada — evento: '{}' — total: {} — email: {}",
                resume.getEventName(),
                resume.getTotal(),
                resume.getUserAddress());

        return resume;
    }
}