package lk.ac.pdn.sms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "societies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Society {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "society_name", nullable = false)
    private String societyName;

    @Column(name = "registered_date", nullable = false)
    private LocalDate registeredDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SocietyStatus status = SocietyStatus.ACTIVE;

    @Column(nullable = false)
    private Integer year;

    private String website;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "society", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SocietyOfficial> officials;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum SocietyStatus {
        ACTIVE, INACTIVE
    }
}