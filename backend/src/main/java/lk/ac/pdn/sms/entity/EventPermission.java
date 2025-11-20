package lk.ac.pdn.sms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "event_permissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String societyName;

    @Column(nullable = false)
    private String applicantName;

    @Column(nullable = false)
    private String applicantRegNo;

    @Column(nullable = false)
    private String applicantEmail;

    @Column(nullable = false)
    private String applicantPosition;

    @Column(nullable = false)
    private String applicantMobile;

    @Column(nullable = false)
    private String eventName;

    @Column(nullable = false)
    private LocalDate eventDate;

    @Column(name = "time_from")
    private LocalTime timeFrom;

    @Column(name = "time_to")
    private LocalTime timeTo;

    @Column(nullable = false)
    private String place;

    private Boolean isInsideUniversity;
    private Boolean latePassRequired;
    private Boolean outsidersInvited;

    @Column(columnDefinition = "TEXT")
    private String outsidersList;

    private Boolean firstYearParticipation;

    private String budgetEstimate;
    private String fundCollectionMethods;
    private String studentFeeAmount;

    private String seniorTreasurerName;
    private String seniorTreasurerDepartment;
    private String seniorTreasurerMobile;

    private String premisesOfficerName;
    private String premisesOfficerDesignation;
    private String premisesOfficerDivision;

    private String receiptNumber;
    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status = EventStatus.PENDING_AR;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    private LocalDateTime arApprovalDate;
    private LocalDateTime vcApprovalDate;

    @Column(name = "submitted_date")
    private LocalDateTime submittedDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (submittedDate == null) {
            submittedDate = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum EventStatus {
        PENDING_AR,
        PENDING_VC,
        APPROVED,
        REJECTED
    }
}