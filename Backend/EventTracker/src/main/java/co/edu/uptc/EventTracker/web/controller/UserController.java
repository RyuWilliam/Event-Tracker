package co.edu.uptc.EventTracker.web.controller;

import co.edu.uptc.EventTracker.domain.model.User;
import co.edu.uptc.EventTracker.domain.service.UserService;
import co.edu.uptc.EventTracker.security.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }


    @GetMapping("/all")
    public ResponseEntity<List<User>> findAll(){
        return ResponseEntity.ok(userService.findAll());
    }


    @PostMapping("/favorites/{eventId}")
    public void addFavorite(@PathVariable Integer eventId) {

        Integer userId = getAuthenticatedUserId();

        userService.addFavorite(userId, eventId);
    }

    @DeleteMapping("/favorites/{eventId}")
    public void removeFavorite(@PathVariable Integer eventId) {

        Integer userId = getAuthenticatedUserId();

        userService.removeFavorite(userId, eventId);
    }

    @GetMapping("/favorites/report")
    public Map<Integer, Long> getFavoriteReport() {
        return userService.getFavoriteReport();
    }


    private Integer getAuthenticatedUserId() {

        var authentication = SecurityContextHolder.getContext().getAuthentication();

        UserDetailsImpl userDetails =
                (UserDetailsImpl) authentication.getPrincipal();

        return userDetails.getId();
    }
}