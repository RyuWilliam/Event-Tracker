package co.edu.uptc.EventTracker.domain.service;

import co.edu.uptc.EventTracker.domain.repository.EventRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class ImageService {

    private static final long MAX_SIZE = 5242880;
    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final EventRepository eventRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public ImageService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public String uploadImage(MultipartFile file, Integer eventId) {
        validateFile(file);
        
        String filename = generateUniqueFilename(getExtension(file.getOriginalFilename()));
        String imageUrl = "/images/" + filename;
        
        saveFile(file, filename);
        updateEventImageUrl(eventId, imageUrl);
        
        return imageUrl;
    }

    public void deleteImage(Integer eventId) {
        String imageUrl = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found: " + eventId))
                .getImageUrl();
        
        if (imageUrl != null) {
            deleteImageFile(imageUrl);
            updateEventImageUrl(eventId, null);
        }
    }

    public void deleteImageFile(String imageUrl) {
        try {
            String filename = imageUrl.replace("/images/", "");
            Path basePath = Paths.get("").toAbsolutePath();
            Path uploadPath = basePath.resolve(uploadDir).resolve("events").resolve(filename);
            Files.deleteIfExists(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete image file: " + imageUrl, e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("File size exceeds 5MB limit");
        }
        
        String contentType = file.getContentType();
        
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("File type not allowed. Allowed types: JPEG, PNG, WebP");
        }
    }

    private String generateUniqueFilename(String extension) {
        return UUID.randomUUID().toString() + extension;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".jpg";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    private void saveFile(MultipartFile file, String filename) {
        try {
            Path basePath = Paths.get("").toAbsolutePath();
            Path uploadPath = basePath.resolve(uploadDir).resolve("events");
            Files.createDirectories(uploadPath);
            
            Path filePath = uploadPath.resolve(filename);
            Files.write(filePath, file.getBytes());
        } catch (IOException e) {
            throw new RuntimeException("Failed to save image", e);
        }
    }

    private void updateEventImageUrl(Integer eventId, String imageUrl) {
        var event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found: " + eventId));
        
        event.setImageUrl(imageUrl);
        eventRepository.save(event);
    }
}
