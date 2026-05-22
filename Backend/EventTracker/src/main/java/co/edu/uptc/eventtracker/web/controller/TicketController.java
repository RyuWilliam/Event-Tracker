package co.edu.uptc.eventtracker.web.controller;

import co.edu.uptc.eventtracker.domain.model.TicketPurchase;
import co.edu.uptc.eventtracker.domain.model.TicketResume;
import co.edu.uptc.eventtracker.domain.model.TicketType;
import co.edu.uptc.eventtracker.domain.service.TicketService;
import co.edu.uptc.eventtracker.domain.service.UserService;
import co.edu.uptc.eventtracker.security.UserDetailsImpl;
import co.edu.uptc.eventtracker.web.dto.PayAndPurchaseRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/tickets")
public class TicketController {

    private final UserService userService;  
    private final TicketService ticketService;

    public TicketController(UserService userService, TicketService ticketService) {
        this.userService = userService;
        this.ticketService = ticketService;
    }

    @PostMapping("/type/create")
    public ResponseEntity<TicketType> createType(@RequestBody TicketType type){
        return ResponseEntity.ok(ticketService.createType(type));

    }

    @GetMapping("/types")
    public ResponseEntity<List<TicketType>> getTypes(){
        return ResponseEntity.ok(ticketService.findAll());
    }
    @PutMapping("/type/modify/{id}")
    public ResponseEntity<TicketType> modifyType(@PathVariable Integer id, @RequestParam String name){
        return ResponseEntity.ok(ticketService.modifyType(id,name));
    }

    @GetMapping("/type/{id}")
    public ResponseEntity<Optional<TicketType>> getTypeById(@PathVariable Integer id){
        return ResponseEntity.ok(ticketService.getTypeById(id));

    }

    @DeleteMapping("/type/{id}")
    public ResponseEntity<Void> deleteType(@PathVariable Integer id){
        ticketService.deleteType(id);
        return ResponseEntity.noContent().build();

    }
    @PostMapping("/pay-and-purchase")
    public ResponseEntity<TicketResume> payAndPurchase(@RequestBody PayAndPurchaseRequest request) {
        Integer userId = getAuthenticatedUserId();

        // Armar el TicketPurchase con el usuario autenticado
        TicketPurchase purchase = new TicketPurchase(
                userService.findById(userId),
                request.getItems()
        );

        TicketResume resume = ticketService.processPaymentAndRegisterSale(
                request.getPayment(),
                purchase
        );

        return ResponseEntity.ok(resume);
    }
    @GetMapping("/purchase/{id}")
    public ResponseEntity<Optional<TicketPurchase>> getPurchaseById(@PathVariable Integer id){
        return ResponseEntity.ok(ticketService.getPurchaseById(id));
    }
    @GetMapping(value = "/purchase/{id}/qr", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getQr(@PathVariable Integer id) {
        TicketPurchase ticketPurchase = ticketService.getPurchaseById(id)
                .orElseThrow(() -> new RuntimeException("Purchase not found"));
        byte[] qr = ticketService.generateQrFromPurchase(ticketPurchase);
        return ResponseEntity.ok(qr);
    }

    private Integer getAuthenticatedUserId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("user not authenticated");
        }

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof UserDetailsImpl userDetails)) {
            throw new IllegalStateException("invalid user details");
        }

        return userDetails.getId();
    }
}
