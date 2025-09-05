package lk.ac.pdn.sms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "society_renewals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SocietyRenewal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "applicant_full_name", nullable = false)
    private String applicantFullName;

    @Column(name = "applicant_reg_no", nullable = false)
    private String applicantRegNo;

    @Column(name = "applicant_email", nullable = false)
    private String applicantEmail;

    @Column(name = "applicant_faculty", nullable = false)
    private String applicantFaculty;

    @Column(name = "applicant_mobile", nullable = false)
    private String applicantMobile;

    @Column(name = "society_name", nullable = false)
    private String societyName;

    @Column(name = "bank_account", nullable = false)
    private String bankAccount;

    @Column(name = "bank_name", nullable = false)
    private String bankName;

    @Column(name = "agm_date", nullable = false)
    private LocalDate agmDate;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String difficulties;

    private String website;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RenewalStatus status = RenewalStatus.PENDING_DEAN;

    @Column(name = "is_dean_approved")
    private Boolean isDeanApproved = false;

    @Column(name = "is_ar_approved")
    private Boolean isArApproved = false;

    @Column(name = "is_vc_approved")
    private Boolean isVcApproved = false;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "submitted_date")
    private LocalDateTime submittedDate;

    @Column(name = "approved_date")
    private LocalDateTime approvedDate;

    @OneToMany(mappedBy = "renewal", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RenewalAdvisoryBoardMember> advisoryBoard;

    @OneToMany(mappedBy = "renewal", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RenewalCommitteeMember> committeeMembers;

    @OneToMany(mappedBy = "renewal", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RenewalSocietyMember> members;

    @OneToMany(mappedBy = "renewal", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RenewalPlanningEvent> planningEvents;

    @OneToMany(mappedBy = "renewal", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PreviousActivity> previousActivities;

    @OneToMany(mappedBy = "renewal", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RenewalSocietyOfficial> officials;

    @PrePersist
    protected void onCreate() {
        submittedDate = LocalDateTime.now();
        year = LocalDate.now().getYear();
    }

    public enum RenewalStatus {
        PENDING_DEAN, PENDING_AR, PENDING_VC, APPROVED, REJECTED
    }
}