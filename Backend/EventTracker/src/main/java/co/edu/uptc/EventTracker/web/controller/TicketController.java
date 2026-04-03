package co.edu.uptc.EventTracker.web.controller;

import co.edu.uptc.EventTracker.domain.model.TicketPurchase;
import co.edu.uptc.EventTracker.domain.model.TicketResume;
import co.edu.uptc.EventTracker.domain.model.TicketType;
import co.edu.uptc.EventTracker.domain.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping("/type/create")
    public ResponseEntity<TicketType> createType(@RequestBody TicketType type){
        return ResponseEntity.ok(ticketService.createType(type));

    }
    @PutMapping("/type/modify")
    public ResponseEntity<TicketType> modifyType(@RequestParam Integer id, @RequestParam String name){
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
    @PostMapping("/purchase")
    public ResponseEntity<TicketResume> registerSale(@RequestBody TicketPurchase purchase){
        return ResponseEntity.ok(ticketService.registerSale(purchase));

    }
    @GetMapping("/purchase/{id}")
    public ResponseEntity<Optional<TicketPurchase>> getPurchaseById(@PathVariable Integer id){
            return ResponseEntity.ok(ticketService.getPurchaseById(id));
    }
}
