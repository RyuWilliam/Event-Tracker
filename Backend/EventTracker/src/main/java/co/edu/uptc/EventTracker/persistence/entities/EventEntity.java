    package co.edu.uptc.EventTracker.persistence.entities;


    import co.edu.uptc.EventTracker.persistence.enums.EventStatus;

    import jakarta.persistence.*;

    import org.springframework.data.annotation.LastModifiedDate;
    import org.springframework.data.jpa.domain.support.AuditingEntityListener;

    import java.time.LocalDateTime;
    import java.util.HashSet;
    import java.util.List;
    import java.util.Set;

    @Entity
    @EntityListeners(AuditingEntityListener.class)

    @Table(name = "events")
    public class EventEntity {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "event_id")
        private Integer eventId;
        @Column(nullable = false)
        private String name;
        private String description;
        private LocalDateTime date;

        @Enumerated(EnumType.STRING)
        private EventStatus status;

        @LastModifiedDate
        @Column(name = "last_updated")
        private LocalDateTime lastUpdated;

        private Boolean active;

        private Integer likes;

        @ManyToMany(fetch = FetchType.LAZY)
        @JoinTable(
                name = "event_category",
                joinColumns = @JoinColumn(name = "event_id"),
                inverseJoinColumns = @JoinColumn(name = "category_id")
        )
        private List<CategoryEntity> categories;

        public EventEntity(){

        }

        public Integer getLikes() {
            return likes;
        }

        public void setLikes(Integer likes) {
            this.likes = likes;
        }

        public Integer getEventId() {
            return eventId;
        }

        public void setEventId(Integer eventId) {
            this.eventId = eventId;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public LocalDateTime getDate() {
            return date;
        }

        public void setDate(LocalDateTime date) {
            this.date = date;
        }

        public EventStatus getStatus() {
            return status;
        }

        public void setStatus(EventStatus status) {
            this.status = status;
        }

        public LocalDateTime getLastUpdated() {
            return lastUpdated;
        }

        public Boolean getActive() {
            return active;
        }

        public void setActive(Boolean active) {
            this.active = active;
        }

        public List<CategoryEntity> getCategories() {
            return categories;
        }

        public void setCategories(List<CategoryEntity> categories) {
            this.categories = categories;
        }

        public void setLastUpdated(LocalDateTime lastUpdated) {
            this.lastUpdated = lastUpdated;
        }
    }
