package co.edu.uptc.EventTracker.domain.service;


import co.edu.uptc.EventTracker.domain.model.Event;
import co.edu.uptc.EventTracker.domain.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ReportService {

    private final EventRepository eventRepository;

    public ReportService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    /*
    public Map<String, Integer> generateReport(){
        List<Event> events = new ArrayList<>(eventRepository.findActive());
        Map<String, Integer> report = new LinkedHashMap<>();
        while(!events.isEmpty()) {
            Event maximum = events.getFirst();
            for (Event event : events) {
                if (event.getLikes() > maximum.getLikes()) {
                    maximum = event;
                }
            }
            report.put(maximum.getName(), maximum.getLikes());
            events.remove(maximum);
        }
        return report;
    }
    */
}
