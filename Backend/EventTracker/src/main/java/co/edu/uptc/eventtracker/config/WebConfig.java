package co.edu.uptc.eventtracker.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path basePath = Paths.get("").toAbsolutePath();
        Path uploadPath = basePath.resolve(uploadDir).resolve("events");
        String absolutePath = uploadPath.toUri().toString();
        
        registry.addResourceHandler("/images/**")
                .addResourceLocations(absolutePath);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
