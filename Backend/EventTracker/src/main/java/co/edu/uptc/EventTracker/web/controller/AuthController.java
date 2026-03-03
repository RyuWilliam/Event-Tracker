package co.edu.uptc.EventTracker.web.controller;

import co.edu.uptc.EventTracker.domain.service.AuthService;
import co.edu.uptc.EventTracker.web.dto.AuthResponse;
import co.edu.uptc.EventTracker.web.dto.LoginRequest;
import co.edu.uptc.EventTracker.web.dto.RegisterRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }
}