package co.edu.uptc.eventtracker;

import co.edu.uptc.eventtracker.domain.model.Event;
import co.edu.uptc.eventtracker.domain.service.AuthService;
import co.edu.uptc.eventtracker.domain.service.EventService;
import co.edu.uptc.eventtracker.persistence.enums.EventStatus;
import co.edu.uptc.eventtracker.web.dto.AuthResponse;
import co.edu.uptc.eventtracker.web.dto.RegisterRequest;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.DisabledInNativeImage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.client.ResponseErrorHandler;
import org.springframework.web.client.RestTemplate;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@Transactional
@DisabledInNativeImage
class EventTrackerIntegrationTest {

    // ── Contenedor Postgres — mismo config que tu docker-compose ──
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:latest")
            .withDatabaseName("event_tracker_db")
            .withUsername("EventAdmin")
            .withPassword("0na93rF6WB");

    // Sobreescribe las propiedades de datasource con los valores
    // del contenedor que Testcontainers levantó dinámicamente
    @DynamicPropertySource
    static void configureDataSource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url",      postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        // Crea las tablas automáticamente en el contenedor de prueba
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }

    @LocalServerPort
    int port;

    @Autowired AuthService authService;
    @Autowired EventService eventService;
    private RestTemplate restTemplate = new RestTemplate();

    {
        // Evita que RestTemplate lance excepción en 4xx/5xx
        // así puedes hacer assertThat sobre el status normalmente
        restTemplate.setErrorHandler(new ResponseErrorHandler() {
            @Override
            public boolean hasError(ClientHttpResponse response) throws IOException {
                return false; // nunca lanza excepción — tú manejas el status
            }
        });
    }

    // Verifica que Docker esté disponible antes de correr las pruebas
    // Si no hay Docker, las pruebas se saltan (no fallan)
    @BeforeAll
    static void verificarDocker() {
        assumeTrue(
                DockerClientFactory.instance().isDockerAvailable(),
                "Docker no disponible — pruebas de integración omitidas"
        );
    }

    // ── Auth ──────────────────────────────────────────────────────

    @Test
    @DisplayName("register: debe persistir usuario y retornar token JWT válido")
    void register_UsuarioNuevo_PersistYRetornaToken() {
        RegisterRequest request = new RegisterRequest(
                "Juan Test", "juan_integration@mail.com", "pass123"
        );

        AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken())
                .isNotBlank()
                .contains(".");   // formato JWT: header.payload.signature
    }

    @Test
    @DisplayName("register: email duplicado lanza excepción en base de datos real")
    void register_EmailDuplicado_LanzaExcepcion() {
        RegisterRequest request = new RegisterRequest(
                "Duplicado", "duplicado@mail.com", "pass123"
        );
        authService.register(request);  // primera vez — ok

        org.assertj.core.api.Assertions.assertThatThrownBy(
                        () -> authService.register(request)  // segunda vez — falla
                ).isInstanceOf(RuntimeException.class)
                .hasMessage("Email already registered");
    }

    // ── Eventos ───────────────────────────────────────────────────

    @Test
    @DisplayName("save + findById: evento guardado debe recuperarse con los mismos datos")
    void saveYFindById_EventoValido_RoundtripCorrecto() {
        Event evento = new Event();
        evento.setName("Concierto Integration");
        evento.setDescription("Prueba real");
        evento.setDate(LocalDateTime.now().plusDays(7));
        evento.setStatus(EventStatus.ACTIVE);
        evento.setCategories(List.of());

        Event saved = eventService.save(evento);
        assertThat(saved.getId()).isNotNull();

        Event found = eventService.findById(saved.getId());
        assertThat(found.getName()).isEqualTo("Concierto Integration");
        assertThat(found.getStatus()).isEqualTo(EventStatus.ACTIVE);
    }

    @Test
    @DisplayName("deleteEvent: evento eliminado no debe aparecer en findAll")
    void deleteEvent_EventoEliminado_NoApareceEnFindAll() {
        Event evento = new Event();
        evento.setName("Para Borrar");
        evento.setDate(LocalDateTime.now().plusDays(1));
        evento.setStatus(EventStatus.ACTIVE);
        evento.setCategories(List.of());

        Event saved = eventService.save(evento);
        eventService.deleteEvent(saved.getId());

        // findAll retorna solo activos — el eliminado no debe estar
        List<Event> activos = eventService.findAll();
        assertThat(activos)
                .isNotEmpty()
                .extracting(Event::getId)
                .doesNotContain(saved.getId());
    }

    @Test
    @DisplayName("refreshStatus: evento con fecha pasada cambia a FINISHED en BD")
    void refreshStatus_EventoPasado_SeActualizaEnBD() {
        Event evento = new Event();
        evento.setName("Evento Pasado");
        evento.setDate(LocalDateTime.now().minusDays(1));
        evento.setStatus(EventStatus.ACTIVE);
        evento.setCategories(List.of());

        Event saved = eventService.save(evento);
        eventService.refreshStatus();

        Event updated = eventService.findById(saved.getId());
        assertThat(updated.getStatus()).isEqualTo(EventStatus.FINISHED);
    }

    // ── Endpoints HTTP ────────────────────────────────────────────

    @Test
    @DisplayName("GET /events debe retornar 200 OK")
    void getEvents_EndpointActivo_Retorna200() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                "http://localhost:" + port + "/tracker/api/events",
                String.class
        );
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("GET /events/{id} con id inexistente debe retornar 404")
    void getEventById_IdInexistente_Retorna404() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                "http://localhost:" + port + "/tracker/api/events/999999",
                String.class
        );
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}