package co.edu.uptc.EventTracker;

import co.edu.uptc.EventTracker.domain.model.*;
import co.edu.uptc.EventTracker.domain.repository.*;
import co.edu.uptc.EventTracker.domain.service.TicketResumeBuilder;
import co.edu.uptc.EventTracker.domain.service.TicketService;
import co.edu.uptc.EventTracker.persistence.exceptions.InsufficientStockException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private TicketRepository ticketRepository;
    @Mock private TicketResumeBuilder ticketResumeBuilder;
    @Mock private PurchaseRepository purchaseRepository;
    @Mock private EventRepository eventRepository;
    @Mock private EventTicketRepository eventTicketRepository;

    @InjectMocks
    private TicketService ticketService;

    // ── objetos de dominio reutilizables ──────────────────────────
    private User user;
    private Event event;
    private EventTicket eventTicket;
    private TicketPurchaseItem item;
    private TicketPurchase request;
    private TicketResume resume;

    @BeforeEach
    void setUp() {
        // Usuario
        user = new User();
        user.setId(1);
        user.setEmail("juan@mail.com");

        // Evento
        event = new Event();
        event.setId(10);
        event.setName("Festival");

        // Ticket de evento: 100 totales, 40 vendidos → 60 disponibles
        eventTicket = new EventTicket();
        eventTicket.setId(5);
        eventTicket.setTotalQuantity(100);
        eventTicket.setSoldQuantity(40);
        eventTicket.setPrice(50.0);

        // Tipo de ticket para el resume
        TicketType type = new TicketType();
        type.setName("General");
        eventTicket.setTicketType(type);

        // Item del request (solo trae id del eventTicket)
        EventTicket refTicket = new EventTicket();
        refTicket.setId(5);
        item = new TicketPurchaseItem(refTicket, 2);

        // Request completo
        request = new TicketPurchase(user, List.of(item));

        // Resume de respuesta
        resume = new TicketResume();
        resume.setEventName("Festival");
        resume.setUserAddress("juan@mail.com");
        resume.setTotal(100.0);
        resume.setTotalQuantity(2);

        TicketResumeItem resumeItem = new TicketResumeItem();
        resumeItem.setType(type);
        resumeItem.setQuantity(2);
        resumeItem.setSubtotal(100.0);
        resume.setItems(List.of(resumeItem));
    }

    @Test
    @DisplayName("registerSale: compra exitosa retorna el resume y actualiza el stock")
    void registerSale_StockSuficiente_RetornaResumeYActualizaStock() {
        // Arrange
        given(userRepository.findById(1)).willReturn(Optional.of(user));
        given(eventTicketRepository.findById(5)).willReturn(Optional.of(eventTicket));
        given(eventRepository.findByEventTicketId(5)).willReturn(event);
        given(eventTicketRepository.save(eventTicket)).willReturn(eventTicket);

        TicketPurchase savedPurchase = new TicketPurchase(user, List.of(item));
        savedPurchase.setId(99);
        given(ticketRepository.savePurchase(any(TicketPurchase.class))).willReturn(savedPurchase);
        given(ticketResumeBuilder.buildFromPurchase(savedPurchase, event)).willReturn(resume);

        // Act
        TicketResume result = ticketService.registerSale(request);

        // Assert — el resume retornado es correcto
        assertThat(result.getEventName()).isEqualTo("Festival");
        assertThat(result.getTotal()).isEqualTo(100.0);

        // El stock se actualizó: 40 + 2 = 42
        assertThat(eventTicket.getSoldQuantity()).isEqualTo(42);

        // Se guardó el eventTicket con el nuevo stock
        then(eventTicketRepository).should(times(1)).save(eventTicket);

        // Se persistió la compra
        then(ticketRepository).should(times(1)).savePurchase(any(TicketPurchase.class));
    }

    @Test
    @DisplayName("registerSale: debe lanzar InsufficientStockException cuando la cantidad supera el stock")
    void registerSale_StockInsuficiente_LanzaExcepcion() {
        // Arrange — solo quedan 60 disponibles pero piden 61
        EventTicket refTicket = new EventTicket();
        refTicket.setId(5);
        TicketPurchaseItem itemExcesivo = new TicketPurchaseItem(refTicket, 61);
        TicketPurchase requestExcesivo = new TicketPurchase(user, List.of(itemExcesivo));

        given(userRepository.findById(1)).willReturn(Optional.of(user));
        given(eventTicketRepository.findById(5)).willReturn(Optional.of(eventTicket));
        given(eventRepository.findByEventTicketId(5)).willReturn(event);

        // Act & Assert
        assertThatThrownBy(() -> ticketService.registerSale(requestExcesivo))
                .isInstanceOf(InsufficientStockException.class);

        // El stock NO debe haberse modificado ni guardado
        assertThat(eventTicket.getSoldQuantity()).isEqualTo(40);
        then(eventTicketRepository).should(never()).save(any());
        then(ticketRepository).should(never()).savePurchase(any());
    }

    @Test
    @DisplayName("registerSale: compra con exactamente el stock disponible debe ser exitosa")
    void registerSale_CantidadExactaAlStock_EsExitosa() {
        // Arrange — piden exactamente los 60 disponibles
        EventTicket refTicket = new EventTicket();
        refTicket.setId(5);
        TicketPurchaseItem itemExacto = new TicketPurchaseItem(refTicket, 60);
        TicketPurchase requestExacto = new TicketPurchase(user, List.of(itemExacto));

        given(userRepository.findById(1)).willReturn(Optional.of(user));
        given(eventTicketRepository.findById(5)).willReturn(Optional.of(eventTicket));
        given(eventRepository.findByEventTicketId(5)).willReturn(event);
        given(eventTicketRepository.save(eventTicket)).willReturn(eventTicket);

        TicketPurchase savedPurchase = new TicketPurchase(user, List.of(itemExacto));
        given(ticketRepository.savePurchase(any())).willReturn(savedPurchase);
        given(ticketResumeBuilder.buildFromPurchase(any(), any())).willReturn(resume);

        // Act — no debe lanzar excepción
        TicketResume result = ticketService.registerSale(requestExacto);

        assertThat(result).isNotNull();
        assertThat(eventTicket.getSoldQuantity()).isEqualTo(100); // 40 + 60
    }

    @Test
    @DisplayName("registerSale: múltiples items actualizan el stock de cada eventTicket")
    void registerSale_MultiplesItems_ActualizaStockDeCadaUno() {
        // Arrange — dos tipos de ticket distintos
        EventTicket ticket2 = new EventTicket();
        ticket2.setId(6);
        ticket2.setTotalQuantity(50);
        ticket2.setSoldQuantity(10);
        ticket2.setPrice(100.0);
        TicketType type2 = new TicketType();
        type2.setName("VIP");
        ticket2.setTicketType(type2);

        EventTicket ref1 = new EventTicket(); ref1.setId(5);
        EventTicket ref2 = new EventTicket(); ref2.setId(6);
        TicketPurchaseItem item1 = new TicketPurchaseItem(ref1, 2);
        TicketPurchaseItem item2 = new TicketPurchaseItem(ref2, 3);
        TicketPurchase requestMultiple = new TicketPurchase(user, List.of(item1, item2));

        given(userRepository.findById(1)).willReturn(Optional.of(user));
        given(eventTicketRepository.findById(5)).willReturn(Optional.of(eventTicket));
        given(eventTicketRepository.findById(6)).willReturn(Optional.of(ticket2));
        given(eventRepository.findByEventTicketId(any())).willReturn(event);
        given(eventTicketRepository.save(any())).willAnswer(inv -> inv.getArgument(0));
        given(ticketRepository.savePurchase(any())).willReturn(requestMultiple);
        given(ticketResumeBuilder.buildFromPurchase(any(), any())).willReturn(resume);

        // Act
        ticketService.registerSale(requestMultiple);

        // Assert — ambos tickets actualizaron su stock
        assertThat(eventTicket.getSoldQuantity()).isEqualTo(42);  // 40 + 2
        assertThat(ticket2.getSoldQuantity()).isEqualTo(13);      // 10 + 3
        then(eventTicketRepository).should(times(2)).save(any());
    }
    @Test
    @DisplayName("getTickets: debe retornar la lista de resumes del usuario")
    void getTickets_UsuarioConCompras_RetornaResumes() {
        TicketPurchase purchase1 = new TicketPurchase(user, List.of(item));
        purchase1.setId(1);

        given(purchaseRepository.findByUserId(1)).willReturn(List.of(purchase1));
        given(eventRepository.findByEventTicketId(5)).willReturn(event);
        given(ticketResumeBuilder.buildFromPurchase(purchase1, event)).willReturn(resume);

        List<TicketResume> result = ticketService.getTickets(1);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEventName()).isEqualTo("Festival");
    }

    @Test
    @DisplayName("getTickets: usuario sin compras retorna lista vacía")
    void getTickets_UsuarioSinCompras_RetornaListaVacia() {
        given(purchaseRepository.findByUserId(99)).willReturn(List.of());

        List<TicketResume> result = ticketService.getTickets(99);

        assertThat(result).isEmpty();
        then(eventRepository).should(never()).findByEventTicketId(any());
    }
    @Test
    @DisplayName("createType: debe delegar al repositorio y retornar el tipo creado")
    void createType_TipoValido_RetornaTipoCreado() {
        TicketType input  = new TicketType(); input.setName("VIP");
        TicketType saved  = new TicketType(); saved.setId(1); saved.setName("VIP");

        given(ticketRepository.createType(input)).willReturn(saved);

        TicketType result = ticketService.createType(input);

        assertThat(result.getId()).isEqualTo(1);
        assertThat(result.getName()).isEqualTo("VIP");
    }

    @Test
    @DisplayName("modifyType: debe delegar con id y nombre correctos")
    void modifyType_IdYNombreValidos_RetornaTipoModificado() {
        TicketType modificado = new TicketType(); modificado.setId(1); modificado.setName("Premium");
        given(ticketRepository.modifyType(1, "Premium")).willReturn(modificado);

        TicketType result = ticketService.modifyType(1, "Premium");

        assertThat(result.getName()).isEqualTo("Premium");
    }

    @Test
    @DisplayName("deleteType: debe delegar al repositorio con el id correcto")
    void deleteType_IdValido_LlamaRepositorio() {
        ticketService.deleteType(1);
        then(ticketRepository).should(times(1)).deleteType(1);
    }

    @Test
    @DisplayName("getTypeById: debe retornar el tipo cuando existe")
    void getTypeById_TipoExiste_RetornaOptionalConTipo() {
        TicketType type = new TicketType(); type.setId(1); type.setName("VIP");
        given(ticketRepository.getTypeById(1)).willReturn(Optional.of(type));

        Optional<TicketType> result = ticketService.getTypeById(1);

        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("VIP");
    }
    @Test
    @DisplayName("generateFromTicketResume: debe retornar un array de bytes no vacío con imagen PNG")
    void generateFromTicketResume_ResumeValido_RetornaBytesQR() {
        // Act
        byte[] qr = ticketService.generateFromTicketResume(resume);

        // Assert — el resultado es un PNG válido (los primeros 4 bytes son la firma PNG)
        assertThat(qr).isNotEmpty();
        assertThat(qr[0]).isEqualTo((byte) 0x89);   // firma PNG: \x89PNG
        assertThat(qr[1]).isEqualTo((byte) 0x50);   // P
        assertThat(qr[2]).isEqualTo((byte) 0x4E);   // N
        assertThat(qr[3]).isEqualTo((byte) 0x47);   // G
    }

    @Test
    @DisplayName("generateQrFromPurchase: debe construir el resume y generar el QR")
    void generateQrFromPurchase_CompraValida_RetornaBytesQR() {
        TicketPurchase purchase = new TicketPurchase(user, List.of(item));

        given(eventRepository.findByEventTicketId(5)).willReturn(event);
        given(ticketResumeBuilder.buildFromPurchase(purchase, event)).willReturn(resume);

        byte[] qr = ticketService.generateQrFromPurchase(purchase);

        assertThat(qr).isNotEmpty();
        then(ticketResumeBuilder).should(times(1)).buildFromPurchase(purchase, event);
    }
}