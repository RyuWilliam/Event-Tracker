package co.edu.uptc.eventtracker.web.controller;

import co.edu.uptc.eventtracker.domain.model.Event;
import co.edu.uptc.eventtracker.domain.model.TicketResume;
import co.edu.uptc.eventtracker.domain.model.User;
import co.edu.uptc.eventtracker.domain.service.TicketService;
import co.edu.uptc.eventtracker.domain.service.UserService;
import co.edu.uptc.eventtracker.security.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {
    private final TicketService ticketService;
    private final UserService userService;

    public UserController(TicketService ticketService, UserService userService) {
        this.ticketService = ticketService;
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

    @GetMapping("/purchases")
    public ResponseEntity<List<TicketResume>> getTickets(){
        Integer userId = getAuthenticatedUserId();
        return ResponseEntity.ok(ticketService.getTickets(userId));

    }


    private Integer getAuthenticatedUserId() {

        var authentication = SecurityContextHolder.getContext().getAuthentication();

        UserDetailsImpl userDetails =
                (UserDetailsImpl) authentication.getPrincipal();

        return userDetails.getId();
    }
}