package co.edu.uptc.EventTracker.web.controller;

import co.edu.uptc.EventTracker.domain.model.Event;
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


    @PostMapping("/favorites/add/{eventId}")
    public void addFavorite(@PathVariable Integer eventId) {

        Integer userId = getAuthenticatedUserId();

        userService.addFavorite(userId, eventId);
    }

    @DeleteMapping("/favorites/remove/{eventId}")
    public void removeFavorite(@PathVariable Integer eventId) {

        Integer userId = getAuthenticatedUserId();

        userService.removeFavorite(userId, eventId);
    }

    @GetMapping("/favorites/report")
    public Map<String, Long> getFavoriteReport() {
        return userService.getFavoriteReport();
    }

    @GetMapping("/favorites/{userId}")
    public List<Event> getFavorites(){
        Integer userId = getAuthenticatedUserId();
        return userService.getFavorites(userId);
    }


    private Integer getAuthenticatedUserId() {

        var authentication = SecurityContextHolder.getContext().getAuthentication();

        UserDetailsImpl userDetails =
                (UserDetailsImpl) authentication.getPrincipal();

        return userDetails.getId();
    }
}