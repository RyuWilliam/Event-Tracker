package co.edu.uptc.EventTracker.domain.service;

import co.edu.uptc.EventTracker.domain.model.Event;
import co.edu.uptc.EventTracker.domain.model.EventTicket;
import co.edu.uptc.EventTracker.domain.model.TicketPurchase;
import co.edu.uptc.EventTracker.domain.model.TicketResume;
import co.edu.uptc.EventTracker.domain.repository.EventRepository;
import co.edu.uptc.EventTracker.domain.repository.PurchaseRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class UserTicketService {
    private final TicketResumeBuilder ticketResumeBuilder;
    private final PurchaseRepository purchaseRepository;
    private final EventRepository eventRepository;

    public UserTicketService(TicketResumeBuilder ticketResumeBuilder, PurchaseRepository purchaseRepository, EventRepository eventRepository) {
        this.ticketResumeBuilder = ticketResumeBuilder;
        this.purchaseRepository = purchaseRepository;
        this.eventRepository = eventRepository;
    }

    public List<TicketResume> getTickets(Integer id){
        List<TicketPurchase> purchases = purchaseRepository.findByUserId(id);
        List<TicketResume> tickets = new ArrayList<>();
        for(TicketPurchase purchase: purchases){
            Event event = eventRepository.findByEventTicketId(purchase.getEventTicket().getId());
            EventTicket eventTicket = purchase.getEventTicket();
            tickets.add(ticketResumeBuilder.buildFromPurchase(purchase,event,eventTicket));
        }
        return tickets;
    }

    public byte[] generateQrFromPurchase(TicketPurchase purchase) {
        Event event = eventRepository.findByEventTicketId(purchase.getEventTicket().getId());
        EventTicket eventTicket = purchase.getEventTicket();
        TicketResume resume = ticketResumeBuilder.buildFromPurchase(purchase, event, eventTicket);
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
            throw new RuntimeException("Error generando QR", e);
        }
    }


    private String buildContent(TicketResume resume) {
        return String.format(
                "Evento: %s | Tipo: %s | Cantidad: %d | Total: $%.2f | Email: %s",
                resume.getEventName(),
                resume.getType().getName(),
                resume.getQuantity(),
                resume.getTotal(),
                resume.getUserAddress()
        );
    }
}