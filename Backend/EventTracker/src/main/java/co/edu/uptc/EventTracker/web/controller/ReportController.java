package co.edu.uptc.EventTracker.web.controller;


import co.edu.uptc.EventTracker.domain.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/report")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/generate")
    public ResponseEntity<Map<String, Integer>> generateReport(){
        return ResponseEntity.ok(reportService.generateReport());
    }
}
