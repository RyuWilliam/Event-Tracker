package co.edu.uptc.eventtracker.model.service;
import co.edu.uptc.eventtracker.domain.service.AuthService;
import co.edu.uptc.eventtracker.persistence.crud.UserJpaRepository;
import co.edu.uptc.eventtracker.persistence.entities.UserEntity;
import co.edu.uptc.eventtracker.persistence.enums.Role;
import co.edu.uptc.eventtracker.security.JwtService;
import co.edu.uptc.eventtracker.web.dto.AuthResponse;
import co.edu.uptc.eventtracker.web.dto.RegisterRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserJpaRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    // ============================================================
    //  Datos compartidos entre pruebas
    // ============================================================
    private RegisterRequest registerRequest;
    private UserEntity userEntity;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest("Juan", "juan@mail.com", "pass123");
        userEntity = new UserEntity("Juan", "juan@mail.com", "hashed_pass", Role.ROLE_USER);
    }

    // --- Caso exitoso ---
    @Test
    @DisplayName("register: debe guardar usuario y retornar token cuando el email no existe")
    void register_EmailNuevo_RetornaToken() {
        // Arrange
        given(userRepository.findByEmail("juan@mail.com"))
                .willReturn(Optional.empty());                        // email libre
        given(passwordEncoder.encode("pass123"))
                .willReturn("hashed_pass");
        given(userRepository.save(any()))
                .willReturn(userEntity);
        given(jwtService.generateToken(any()))
                .willReturn("jwt.token.generado");

        // Act
        AuthResponse response = authService.register(registerRequest);

        // Assert
        assertThat(response.getAccessToken()).isEqualTo("jwt.token.generado");

        // Verifica que se guardó exactamente una vez
        then(userRepository).should(times(1)).save(any(UserEntity.class));
    }

    // --- Email duplicado ---
    @Test
    @DisplayName("register: debe lanzar excepción cuando el email ya está registrado")
    void register_EmailExistente_LanzaExcepcion() {
        // Arrange
        given(userRepository.findByEmail("juan@mail.com"))
                .willReturn(Optional.of(userEntity));                 // email ocupado

        // Act & Assert
        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Email already registered");

        // Verifica que NUNCA se intentó guardar
        then(userRepository).should(never()).save(any(UserEntity.class));
        then(jwtService).should(never()).generateToken(any());
    }

    // --- Rol asignado correctamente ---
    @Test
    @DisplayName("register: el usuario registrado debe tener rol ROLE_USER")
    void register_EmailNuevo_AsignaRolUser() {
        given(userRepository.findByEmail(any())).willReturn(Optional.empty());
        given(passwordEncoder.encode(any())).willReturn("hashed_pass");
        given(jwtService.generateToken(any())).willReturn("token");

        // Captura el objeto que se pasa a .save() para inspeccionarlo
        ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);

        authService.register(registerRequest);

        then(userRepository).should().save(captor.capture());
        assertThat(captor.getValue().getRole()).isEqualTo(Role.ROLE_USER);
    }

    // --- La contraseña se hashea, nunca se guarda en texto plano ---
    @Test
    @DisplayName("register: la contraseña debe almacenarse codificada, no en texto plano")
    void register_Contrasena_SeGuardaCodificada() {
        given(userRepository.findByEmail(any())).willReturn(Optional.empty());
        given(passwordEncoder.encode("pass123")).willReturn("hashed_pass");
        given(jwtService.generateToken(any())).willReturn("token");

        ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);

        authService.register(registerRequest);

        then(userRepository).should().save(captor.capture());
        assertThat(captor.getValue().getPassword())
                .isNotEqualTo("pass123")          // nunca texto plano
                .isEqualTo("hashed_pass");        // sí el hash
    }
}
