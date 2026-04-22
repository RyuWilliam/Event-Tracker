package co.edu.uptc.EventTracker.service;

import co.edu.uptc.EventTracker.domain.model.Event;
import co.edu.uptc.EventTracker.domain.model.User;
import co.edu.uptc.EventTracker.domain.repository.UserRepository;
import co.edu.uptc.EventTracker.domain.service.UserService;
import co.edu.uptc.EventTracker.persistence.exceptions.UserNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User user;
    private Event event;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1);
        user.setEmail("juan@mail.com");

        event = new Event();
        event.setId(10);
        event.setName("Festival");
    }

    @Test
    @DisplayName("save: debe delegar al repositorio y retornar el usuario guardado")
    void save_UsuarioValido_RetornaUsuarioGuardado() {
        User input = new User();
        input.setEmail("nuevo@mail.com");
        User saved = new User();
        saved.setId(2);
        saved.setEmail("nuevo@mail.com");

        given(userRepository.save(input)).willReturn(saved);

        User result = userService.save(input);

        assertThat(result.getId()).isEqualTo(2);
        assertThat(result.getEmail()).isEqualTo("nuevo@mail.com");
        then(userRepository).should(times(1)).save(input);
    }

    @Test
    @DisplayName("findAll: debe retornar la lista completa de usuarios")
    void findAll_HayUsuarios_RetornaLista() {
        given(userRepository.findAll()).willReturn(List.of(user));

        List<User> result = userService.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmail()).isEqualTo("juan@mail.com");
    }

    @Test
    @DisplayName("findAll: debe retornar lista vacía si no hay usuarios")
    void findAll_SinUsuarios_RetornaListaVacia() {
        given(userRepository.findAll()).willReturn(List.of());

        assertThat(userService.findAll()).isEmpty();
    }

    @Test
    @DisplayName("findById: debe retornar el usuario cuando existe")
    void findById_UsuarioExiste_RetornaUsuario() {
        given(userRepository.findById(1)).willReturn(Optional.of(user));

        User result = userService.findById(1);

        assertThat(result.getId()).isEqualTo(1);
        assertThat(result.getEmail()).isEqualTo("juan@mail.com");
    }

    @Test
    @DisplayName("findById: debe lanzar UserNotFoundException cuando no existe")
    void findById_UsuarioNoExiste_LanzaExcepcion() {
        given(userRepository.findById(99)).willReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findById(99))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    @DisplayName("delete: debe delegar al repositorio con el id correcto")
    void delete_IdValido_LlamaRepositorio() {
        userService.delete(1);

        then(userRepository).should(times(1)).deleteById(1);
    }

    @Test
    @DisplayName("addFavorite: debe agregar favorito cuando el usuario existe")
    void addFavorite_UsuarioExiste_LlamaRepositorio() {
        given(userRepository.findById(1)).willReturn(Optional.of(user));

        userService.addFavorite(1, 10);

        then(userRepository).should(times(1)).addFavorite(1, 10);
    }

    @Test
    @DisplayName("addFavorite: debe lanzar UserNotFoundException cuando el usuario no existe")
    void addFavorite_UsuarioNoExiste_LanzaExcepcion() {
        given(userRepository.findById(99)).willReturn(Optional.empty());

        assertThatThrownBy(() -> userService.addFavorite(99, 10))
                .isInstanceOf(UserNotFoundException.class);

        // No debe intentar agregar el favorito si el usuario no existe
        then(userRepository).should(never()).addFavorite(any(), any());
    }

    @Test
    @DisplayName("removeFavorite: debe eliminar favorito cuando el usuario existe")
    void removeFavorite_UsuarioExiste_LlamaRepositorio() {
        given(userRepository.findById(1)).willReturn(Optional.of(user));

        userService.removeFavorite(1, 10);

        then(userRepository).should(times(1)).removeFavorite(1, 10);
    }

    @Test
    @DisplayName("removeFavorite: debe lanzar UserNotFoundException cuando el usuario no existe")
    void removeFavorite_UsuarioNoExiste_LanzaExcepcion() {
        given(userRepository.findById(99)).willReturn(Optional.empty());

        assertThatThrownBy(() -> userService.removeFavorite(99, 10))
                .isInstanceOf(UserNotFoundException.class);

        then(userRepository).should(never()).removeFavorite(any(), any());
    }

    @Test
    @DisplayName("getFavoriteReport: debe retornar el mapa de conteo de favoritos por evento")
    void getFavoriteReport_HayDatos_RetornaMapa() {
        Map<String, Long> report = Map.of(
                "Festival", 42L,
                "Concierto", 18L
        );
        given(userRepository.getFavoriteReport()).willReturn(report);

        Map<String, Long> result = userService.getFavoriteReport();

        assertThat(result).hasSize(2);
        assertThat(result.get("Festival")).isEqualTo(42L);
        assertThat(result.get("Concierto")).isEqualTo(18L);
    }

    @Test
    @DisplayName("getFavoriteReport: debe retornar mapa vacío si no hay favoritos registrados")
    void getFavoriteReport_SinDatos_RetornaMapaVacio() {
        given(userRepository.getFavoriteReport()).willReturn(Map.of());

        assertThat(userService.getFavoriteReport()).isEmpty();
    }

}