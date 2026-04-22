package co.edu.uptc.EventTracker.service;

import co.edu.uptc.EventTracker.domain.model.Event;
import co.edu.uptc.EventTracker.domain.model.EventTicket;
import co.edu.uptc.EventTracker.domain.repository.EventRepository;
import co.edu.uptc.EventTracker.domain.service.EventService;
import co.edu.uptc.EventTracker.persistence.enums.EventStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private EventService eventService;

    // Helpers para construir eventos de prueba
    private Event buildEvent(Integer id, String name, EventStatus status, LocalDateTime date) {
        Event e = new Event();
        e.setId(id);
        e.setName(name);
        e.setStatus(status);
        e.setDate(date);
        return e;
    }

    private EventTicket buildTicket(int sold, double price) {
        EventTicket t = new EventTicket();
        t.setSoldQuantity(sold);
        t.setPrice(price);
        return t;
    }

    @Test
    @DisplayName("save: debe delegar al repositorio y retornar el evento guardado")
    void save_EventoValido_RetornaEventoGuardado() {
        // Arrange
        Event input = buildEvent(null, "Concierto", EventStatus.ACTIVE, LocalDateTime.now().plusDays(5));
        Event saved  = buildEvent(1,    "Concierto", EventStatus.ACTIVE, LocalDateTime.now().plusDays(5));

        given(eventRepository.save(input)).willReturn(saved);

        // Act
        Event result = eventService.save(input);

        // Assert
        assertThat(result.getId()).isEqualTo(1);
        then(eventRepository).should(times(1)).save(input);
    }

    @Test
    @DisplayName("modify: debe delegar al repositorio con el id y evento correctos")
    void modify_IdYEventoValidos_RetornaEventoModificado() {
        Event cambios   = buildEvent(null, "Concierto Editado", EventStatus.ACTIVE, LocalDateTime.now().plusDays(5));
        Event modificado = buildEvent(1,  "Concierto Editado", EventStatus.ACTIVE, LocalDateTime.now().plusDays(5));

        given(eventRepository.modify(1, cambios)).willReturn(modificado);

        Event result = eventService.modify(1, cambios);

        assertThat(result.getName()).isEqualTo("Concierto Editado");
        then(eventRepository).should().modify(1, cambios);
    }

    @Test
    @DisplayName("findById: debe retornar el evento cuando existe")
    void findById_EventoExiste_RetornaEvento() {
        Event evento = buildEvent(1, "Festival", EventStatus.ACTIVE, LocalDateTime.now().plusDays(3));
        given(eventRepository.findById(1)).willReturn(Optional.of(evento));

        Event result = eventService.findById(1);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1);
    }

    @Test
    @DisplayName("findById: debe retornar null cuando el evento no existe")
    void findById_EventoNoExiste_RetornaNull() {
        given(eventRepository.findById(99)).willReturn(Optional.empty());

        Event result = eventService.findById(99);

        assertThat(result).isNull();
    }

    @Test
    @DisplayName("deleteEvent: debe llamar al repositorio con el id correcto")
    void deleteEvent_IdValido_LlamaRepositorio() {
        // deleteById no retorna nada — solo verificamos que fue invocado
        eventService.deleteEvent(1);

        then(eventRepository).should(times(1)).deleteById(1);
    }

    @Test
    @DisplayName("refreshStatus: debe marcar como FINISHED los eventos cuya fecha ya pasó")
    void refreshStatus_EventoPasado_ActualizaAFinished() {
        // Arrange — un evento en el pasado y uno en el futuro
        Event pasado = buildEvent(1, "Pasado", EventStatus.ACTIVE, LocalDateTime.now().minusDays(1));
        Event futuro = buildEvent(2, "Futuro",  EventStatus.ACTIVE, LocalDateTime.now().plusDays(1));

        given(eventRepository.findAll()).willReturn(List.of(pasado, futuro));
        given(eventRepository.save(any(Event.class))).willAnswer(inv -> inv.getArgument(0));

        // Act
        eventService.refreshStatus();

        // Assert — solo el evento pasado se guardó con FINISHED
        then(eventRepository).should(times(1)).save(pasado);
        then(eventRepository).should(never()).save(futuro);
        assertThat(pasado.getStatus()).isEqualTo(EventStatus.FINISHED);
        assertThat(futuro.getStatus()).isEqualTo(EventStatus.ACTIVE);
    }

    @Test
    @DisplayName("refreshStatus: no debe modificar nada si todos los eventos son futuros")
    void refreshStatus_TodosEventosFuturos_NoGuardaNada() {
        Event futuro1 = buildEvent(1, "A", EventStatus.ACTIVE, LocalDateTime.now().plusDays(1));
        Event futuro2 = buildEvent(2, "B", EventStatus.ACTIVE, LocalDateTime.now().plusDays(2));

        given(eventRepository.findAll()).willReturn(List.of(futuro1, futuro2));

        eventService.refreshStatus();

        then(eventRepository).should(never()).save(any(Event.class));
    }

    @Test
    @DisplayName("refreshStatus: no debe hacer nada si no hay eventos")
    void refreshStatus_SinEventos_NoHaceNada() {
        given(eventRepository.findAll()).willReturn(List.of());

        eventService.refreshStatus();

        then(eventRepository).should(never()).save(any(Event.class));
    }
    @Test
    @DisplayName("getMostPopular: debe retornar los 5 eventos con más ventas en orden descendente")
    void getMostPopular_SeisEventos_RetornaTop5OrdenadosPorVentas() {
        // Arrange — 6 eventos con distintas ventas
        Event e1 = buildEvent(1, "A", EventStatus.ACTIVE, LocalDateTime.now().plusDays(1));
        Event e2 = buildEvent(2, "B", EventStatus.ACTIVE, LocalDateTime.now().plusDays(1));
        Event e3 = buildEvent(3, "C", EventStatus.ACTIVE, LocalDateTime.now().plusDays(1));
        Event e4 = buildEvent(4, "D", EventStatus.ACTIVE, LocalDateTime.now().plusDays(1));
        Event e5 = buildEvent(5, "E", EventStatus.ACTIVE, LocalDateTime.now().plusDays(1));
        Event e6 = buildEvent(6, "F", EventStatus.ACTIVE, LocalDateTime.now().plusDays(1));

        // Ventas totales: e1=500, e2=300, e3=800, e4=100, e5=650, e6=200
        e1.setTickets(List.of(buildTicket(10, 50.0)));   // 500
        e2.setTickets(List.of(buildTicket(10, 30.0)));   // 300
        e3.setTickets(List.of(buildTicket(10, 80.0)));   // 800  ← 1°
        e4.setTickets(List.of(buildTicket(10, 10.0)));   // 100
        e5.setTickets(List.of(buildTicket(10, 65.0)));   // 650  ← 2°
        e6.setTickets(List.of(buildTicket(10, 20.0)));   // 200

        given(eventRepository.findByStatus(EventStatus.ACTIVE))
                .willReturn(List.of(e1, e2, e3, e4, e5, e6));

        // Act
        List<Event> result = eventService.getMostPopular();

        // Assert
        assertThat(result).hasSize(5);
        assertThat(result.get(0).getId()).isEqualTo(3);  // 800 — primero
        assertThat(result.get(1).getId()).isEqualTo(5);  // 650 — segundo
        assertThat(result.get(2).getId()).isEqualTo(1);  // 500 — tercero
    }

    @Test
    @DisplayName("getMostPopular: evento sin tickets cuenta como 0 ventas")
    void getMostPopular_EventoSinTickets_CuentaComoCero() {
        Event conTickets    = buildEvent(1, "Con",    EventStatus.ACTIVE, LocalDateTime.now().plusDays(1));
        Event sinTickets    = buildEvent(2, "Sin",    EventStatus.ACTIVE, LocalDateTime.now().plusDays(1));

        conTickets.setTickets(List.of(buildTicket(5, 100.0)));  // 500
        sinTickets.setTickets(null);                             // 0

        given(eventRepository.findByStatus(EventStatus.ACTIVE))
                .willReturn(List.of(sinTickets, conTickets));

        List<Event> result = eventService.getMostPopular();

        // El evento con tickets debe aparecer primero
        assertThat(result.get(0).getId()).isEqualTo(1);
    }

    @Test
    @DisplayName("getMostPopular: si hay menos de 5 eventos retorna todos los disponibles")
    void getMostPopular_MenosDeCincoEventos_RetornaTodos() {
        Event e1 = buildEvent(1, "A", EventStatus.ACTIVE, LocalDateTime.now().plusDays(1));
        Event e2 = buildEvent(2, "B", EventStatus.ACTIVE, LocalDateTime.now().plusDays(1));
        e1.setTickets(List.of(buildTicket(1, 10.0)));
        e2.setTickets(List.of(buildTicket(2, 10.0)));

        given(eventRepository.findByStatus(EventStatus.ACTIVE)).willReturn(List.of(e1, e2));

        List<Event> result = eventService.getMostPopular();

        assertThat(result).hasSize(2);  // no falla con menos de 5
    }
}