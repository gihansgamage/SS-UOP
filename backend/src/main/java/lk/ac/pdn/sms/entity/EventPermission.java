package lk.ac.pdn.sms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entity representing an event permission request application.
 * Approval is a single step (Assistant Registrar).
 */
@Entity
@Table(name = "event_permissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventPermission {

    // 1. Primary Key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 2. Applicant Details (Initial Login Data)
    @Column(nullable = false)
    private String applicantFullName;

    @Column(nullable = false)
    private String applicantRegNo;

    @Column(nullable = false)
    private String applicantEmail; // Used for notifications

    @Column(nullable = false)
    private String applicantFaculty;

    @Column(nullable = false)
    private String applicantMobile;

    // 3. Event and Society Details
    @Column(nullable = false)
    private String societyName; // The society requesting permission

    @Column(nullable = false)
    private String eventName;

    @Column(nullable = false)
    private String eventDate; // Using String for date/time flexibility from form

    @Column(nullable = false)
    private String eventVenue;

    @Column(columnDefinition = "TEXT")
    private String eventDescription;

    private Integer expectedParticipants;

    // Placeholder for file storage reference (e.g., budget, proposal)
    private String attachedFilesPath;

    // 4. Approval Flow Fields (CRITICAL: One-step AR approval)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status = EventStatus.PENDING_AR; // Initial status is PENDING_AR

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "ar_approval_date")
    private LocalDateTime arApprovalDate;

    // 5. Timestamps
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // 6. Lifecycle Methods
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // 7. Event Status Enum (One-step approval process)
    public enum EventStatus {
        PENDING_AR, // Pending Assistant Registrar approval (AR and SS view)
        APPROVED,
        REJECTED
    }
}