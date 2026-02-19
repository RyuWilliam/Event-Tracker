package co.edu.uptc.EventTracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class EventTrackerApplication {

	public static void main(String[] args) {
		SpringApplication.run(EventTrackerApplication.class, args);
	}

}
