package lk.ac.pdn.sms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.time.LocalDate; // FIX: Added import for LocalDate
import java.util.List;

/**
 * Entity representing a new society registration application.
 * This is the application data, which remains in this table until final approval (APPROVED or REJECTED).
 */
@Entity
@Table(name = "society_registration_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SocietyRegistration {

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
    private String applicantEmail;

    @Column(nullable = false)
    private String applicantFaculty; // Used for Dean filtering

    @Column(nullable = false)
    private String applicantMobile;

    // 3. Society Information
    @Column(nullable = false, unique = true)
    private String societyName;

    @Column(columnDefinition = "TEXT")
    private String aims;

    private String agmDate;

    private String bankAccount;
    private String bankName;

    // 4. Senior Treasurer Details (Flattened fields, as per DTO strategy)
    @Column(nullable = false)
    private String seniorTreasurerTitle;

    @Column(nullable = false)
    private String seniorTreasurerFullName;

    @Column(nullable = false)
    private String seniorTreasurerDesignation;

    @Column(nullable = false)
    private String seniorTreasurerDepartment;

    @Column(nullable = false)
    private String seniorTreasurerEmail;

    @Column(nullable = false)
    private String seniorTreasurerAddress;

    @Column(nullable = false)
    private String seniorTreasurerMobile;

    // 5. Key Official Details (Flattened fields, as per DTO strategy)

    // President
    private String presidentRegNo;
    private String presidentName;
    private String presidentAddress;
    private String presidentEmail;
    private String presidentMobile;

    // Vice President
    private String vicePresidentRegNo;
    private String vicePresidentName;
    private String vicePresidentAddress;
    private String vicePresidentEmail;
    private String vicePresidentMobile;

    // Junior Treasurer
    private String juniorTreasurerRegNo;
    private String juniorTreasurerName;
    private String juniorTreasurerAddress;
    private String juniorTreasurerEmail;
    private String juniorTreasurerMobile;

    // Secretary
    private String secretaryRegNo;
    private String secretaryName;
    private String secretaryAddress;
    private String secretaryEmail;
    private String secretaryMobile;

    // Joint Secretary
    private String jointSecretaryRegNo;
    private String jointSecretaryName;
    private String jointSecretaryAddress;
    private String jointSecretaryEmail;
    private String jointSecretaryMobile;

    // Editor
    private String editorRegNo;
    private String editorName;
    private String editorAddress;
    private String editorEmail;
    private String editorMobile;

    // 6. Lists (One-to-Many relationships, linked back to this registration)
    // NOTE: Requires AdvisoryBoardMember, CommitteeMember, SocietyMember, and PlanningEvent entities to exist
    // with a 'registration' field mapping back to this entity.

    @OneToMany(mappedBy = "registration", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AdvisoryBoardMember> advisoryBoard;

    @OneToMany(mappedBy = "registration", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommitteeMember> committeeMember;

    @OneToMany(mappedBy = "registration", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SocietyMember> member;

    @OneToMany(mappedBy = "registration", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlanningEvent> planningEvents;

    // 7. Approval Flow Fields (CRITICAL: Status and Timestamps)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStage status = ApprovalStage.PENDING_DEAN; // Initial status

    @Column(name = "is_dean_approved") // FIX: Added boolean fields for services
    private Boolean isDeanApproved = false;
    @Column(name = "is_ar_approved")
    private Boolean isArApproved = false;
    @Column(name = "is_vc_approved")
    private Boolean isVcApproved = false;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "dean_approval_date")
    private LocalDateTime deanApprovalDate;

    @Column(name = "ar_approval_date")
    private LocalDateTime arApprovalDate;

    @Column(name = "vc_approval_date")
    private LocalDateTime vcApprovalDate;

    // 8. Timestamps (RESTORING MISSING FIELDS USED BY EMAIL/STATISTICS SERVICES)
    @Column(nullable = false)
    private Integer year = LocalDate.now().getYear(); // FIX: Added year field

    @Column(name = "submitted_date", updatable = false)
    private LocalDateTime submittedDate; // FIX: Added submitted date field

    @Column(name = "approved_date")
    private LocalDateTime approvedDate; // FIX: Added approved date field

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // 9. Lifecycle Methods
    @PrePersist
    protected void onCreate() {
        submittedDate = LocalDateTime.now(); // FIX: Set submittedDate
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (this.year == null) {
            this.year = LocalDate.now().getYear();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // 10. Approval Stage Enum (3-step approval process)
    public enum ApprovalStage {
        PENDING_DEAN,
        PENDING_AR, // Assistant Registrar
        PENDING_VC, // Vice Chancellor
        APPROVED,
        REJECTED
    }
}