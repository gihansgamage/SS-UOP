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

    @Column(name = "society_name", nullable = false, unique = true)
    private String societyName;

    @Column(name = "registered_date", nullable = false)
    private LocalDate registeredDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SocietyStatus status = SocietyStatus.ACTIVE;

    @Column(nullable = false)
    private Integer year; // Represents the last renewed/registered year

    // START FIX: Added critical fields for data migration/renewal
    @Column(columnDefinition = "TEXT")
    private String aims;

    private String agmDate; // Stored as string for flexibility from form

    private String bankAccount;
    private String bankName;
    private String website;

    @Column(name = "primary_faculty")
    private String primaryFaculty; // Used for Dean filtering

    @Column(name = "last_renewal_year")
    private Integer lastRenewalYear;

    // Senior Treasurer Details (Flattened fields for migration)
    private String seniorTreasurerTitle;
    private String seniorTreasurerFullName;
    private String seniorTreasurerDesignation;
    private String seniorTreasurerDepartment;
    private String seniorTreasurerEmail;
    private String seniorTreasurerAddress;
    private String seniorTreasurerMobile;
    // END FIX

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
        registeredDate = LocalDate.now();
        // The 'year' field is often populated from the registration application's year
        if (this.year == null) {
            this.year = LocalDate.now().getYear();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum SocietyStatus {
        ACTIVE, INACTIVE
    }
}