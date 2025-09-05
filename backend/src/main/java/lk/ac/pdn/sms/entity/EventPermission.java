package lk.ac.pdn.sms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
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

    @Column(name = "society_name", nullable = false)
    private String societyName;

    @Column(name = "applicant_name", nullable = false)
    private String applicantName;

    @Column(name = "applicant_reg_no", nullable = false)
    private String applicantRegNo;

    @Column(name = "applicant_email", nullable = false)
    private String applicantEmail;

    @Column(name = "applicant_position", nullable = false)
    private String applicantPosition;

    @Column(name = "applicant_mobile", nullable = false)
    private String applicantMobile;

    @Column(name = "event_name", nullable = false)
    private String eventName;

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @Column(name = "time_from", nullable = false)
    private LocalTime timeFrom;

    @Column(name = "time_to", nullable = false)
    private LocalTime timeTo;

    @Column(nullable = false)
    private String place;

    @Column(name = "is_inside_university", nullable = false)
    private Boolean isInsideUniversity;

    @Column(name = "late_pass_required", nullable = false)
    private Boolean latePassRequired;

    @Column(name = "outsiders_invited", nullable = false)
    private Boolean outsidersInvited;

    @Column(name = "outsiders_list", columnDefinition = "TEXT")
    private String outsidersList;

    @Column(name = "first_year_participation", nullable = false)
    private Boolean firstYearParticipation;

    @Column(name = "budget_estimate", nullable = false)
    private String budgetEstimate;

    @Column(name = "fund_collection_methods", nullable = false)
    private String fundCollectionMethods;

    @Column(name = "student_fee_amount")
    private String studentFeeAmount;

    @Column(name = "senior_treasurer_name", nullable = false)
    private String seniorTreasurerName;

    @Column(name = "senior_treasurer_department", nullable = false)
    private String seniorTreasurerDepartment;

    @Column(name = "senior_treasurer_mobile", nullable = false)
    private String seniorTreasurerMobile;

    @Column(name = "premises_officer_name", nullable = false)
    private String premisesOfficerName;

    @Column(name = "premises_officer_designation", nullable = false)
    private String premisesOfficerDesignation;

    @Column(name = "premises_officer_division", nullable = false)
    private String premisesOfficerDivision;

    @Column(name = "receipt_number")
    private String receiptNumber;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status = EventStatus.PENDING_AR;

    @Column(name = "is_ar_approved")
    private Boolean isArApproved = false;

    @Column(name = "is_vc_approved")
    private Boolean isVcApproved = false;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "submitted_date")
    private LocalDateTime submittedDate;

    @Column(name = "approved_date")
    private LocalDateTime approvedDate;

    @PrePersist
    protected void onCreate() {
        submittedDate = LocalDateTime.now();
    }

    public enum EventStatus {
        PENDING_AR, PENDING_VC, APPROVED, REJECTED
    }
}