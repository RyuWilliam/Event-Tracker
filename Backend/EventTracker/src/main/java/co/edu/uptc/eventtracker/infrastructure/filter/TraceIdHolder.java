package co.edu.uptc.eventtracker.infrastructure.filter;

import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

@Component
@RequestScope
public class TraceIdHolder {
    public String get() {
        String id = MDC.get(TraceIdFilter.MDC_KEY);
        return id != null ? id : "no-trace";
    }
}