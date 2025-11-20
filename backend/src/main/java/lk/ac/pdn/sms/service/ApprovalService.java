package lk.ac.pdn.sms.service;

import lk.ac.pdn.sms.dto.ApprovalDto;
import lk.ac.pdn.sms.dto.ApprovalDto.ApprovalAction;
import lk.ac.pdn.sms.entity.*;
import lk.ac.pdn.sms.entity.SocietyRegistration.ApprovalStage;
import lk.ac.pdn.sms.entity.EventPermission.EventStatus;
import lk.ac.pdn.sms.repository.*;
import lk.ac.pdn.sms.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Service handling the multi-stage approval workflow for society applications.
 */
@Service
public class ApprovalService {

    private final SocietyRegistrationRepository registrationRepository;
    private final SocietyRenewalRepository renewalRepository;
    private final EventPermissionRepository eventPermissionRepository;
    private final AdminUserRepository adminUserRepository;
    private final SocietyRepository societyRepository;
    private final EmailService emailService;
    private final ActivityLogService activityLogService;

    // Inject all required repositories and services
    public ApprovalService(SocietyRegistrationRepository registrationRepository,
                           SocietyRenewalRepository renewalRepository,
                           EventPermissionRepository eventPermissionRepository,
                           AdminUserRepository adminUserRepository,
                           SocietyRepository societyRepository,
                           EmailService emailService,
                           ActivityLogService activityLogService) {
        this.registrationRepository = registrationRepository;
        this.renewalRepository = renewalRepository;
        this.eventPermissionRepository = eventPermissionRepository;
        this.adminUserRepository = adminUserRepository;
        this.societyRepository = societyRepository;
        this.emailService = emailService;
        this.activityLogService = activityLogService;
    }

    // =========================================================================
    // 1. SOCIETY REGISTRATION APPROVAL LOGIC (3-Stage: DEAN -> AR -> VC)
    // =========================================================================

    @Transactional
    public SocietyRegistration processRegistrationApproval(Long adminId, ApprovalDto dto) {
        AdminUser admin = adminUserRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with ID: " + adminId));

        SocietyRegistration reg = registrationRepository.findById(dto.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Registration application not found with ID: " + dto.getApplicationId()));

        ApprovalStage currentStage = reg.getStatus();

        // Check if application is already finalized
        if (currentStage == ApprovalStage.APPROVED || currentStage == ApprovalStage.REJECTED) {
            throw new IllegalStateException("Application is already finalized.");
        }

        // --- REJECTION LOGIC (Can be rejected at any stage) ---
        if (dto.getAction() == ApprovalAction.REJECT) {
            if (dto.getRejectionReason() == null || dto.getRejectionReason().trim().isEmpty()) {
                throw new IllegalArgumentException("Rejection reason is mandatory for rejection.");
            }
            reg.setStatus(ApprovalStage.REJECTED);
            reg.setRejectionReason(dto.getRejectionReason());

            // Email notification
            emailService.sendRegistrationNotification(reg, "REJECTED", admin.getName());

            // Activity log
            activityLogService.logActivity(
                    "REGISTRATION REJECTED",
                    "Application ID " + reg.getId() + " rejected by " + admin.getRole().name(),
                    admin.getId().toString(),
                    admin.getName()
            );

            return registrationRepository.save(reg);
        }

        // --- APPROVAL LOGIC (Stage Progression) ---

        ApprovalStage nextStage = currentStage;
        String logMessage = "Registration application ID " + reg.getId();

        if (currentStage == ApprovalStage.PENDING_DEAN && admin.getRole() == AdminUser.Role.DEAN) {
            // CRITICAL CHECK: Dean must belong to the applicant's faculty
            if (!admin.getFaculty().equals(reg.getApplicantFaculty())) {
                throw new SecurityException("Dean is not authorized for this faculty (" + reg.getApplicantFaculty() + ").");
            }
            reg.setDeanApprovalDate(LocalDateTime.now());
            nextStage = ApprovalStage.PENDING_AR;
            logMessage += " approved by Dean, moved to AR.";

        } else if (currentStage == ApprovalStage.PENDING_AR && admin.getRole() == AdminUser.Role.ASSISTANT_REGISTRAR) {
            reg.setArApprovalDate(LocalDateTime.now());
            nextStage = ApprovalStage.PENDING_VC;
            logMessage += " approved by AR, moved to VC.";

        } else if (currentStage == ApprovalStage.PENDING_VC && admin.getRole() == AdminUser.Role.VICE_CHANCELLOR) {
            reg.setVcApprovalDate(LocalDateTime.now());
            nextStage = ApprovalStage.APPROVED;
            logMessage += " APPROVED by VC and registered.";

            // FINAL STEP: Migrate data to permanent Society table
            migrateRegistrationToSociety(reg);

        } else {
            throw new IllegalStateException("Invalid approval action or role for the current application stage (" + currentStage + ").");
        }

        reg.setStatus(nextStage);

        // Email notification (for stage movement)
        emailService.sendRegistrationNotification(reg, nextStage.name(), admin.getName());

        // Activity log
        activityLogService.logActivity("REGISTRATION STAGE CHANGE", logMessage, admin.getId().toString(), admin.getName());

        return registrationRepository.save(reg);
    }

    // Helper method to convert registration application to permanent Society entity
    private void migrateRegistrationToSociety(SocietyRegistration reg) {
        Society society = new Society();
        society.setSocietyName(reg.getSocietyName());
        society.setAims(reg.getAims());
        society.setAgmDate(reg.getAgmDate());
        society.setBankAccount(reg.getBankAccount());
        society.setBankName(reg.getBankName());
        society.setPrimaryFaculty(reg.getApplicantFaculty());
        society.setStatus(Society.SocietyStatus.ACTIVE);

        // Map Senior Treasurer details
        society.setSeniorTreasurerTitle(reg.getSeniorTreasurerTitle());
        society.setSeniorTreasurerFullName(reg.getSeniorTreasurerFullName());
        society.setSeniorTreasurerDesignation(reg.getSeniorTreasurerDesignation());
        society.setSeniorTreasurerDepartment(reg.getSeniorTreasurerDepartment());
        society.setSeniorTreasurerEmail(reg.getSeniorTreasurerEmail());
        society.setSeniorTreasurerAddress(reg.getSeniorTreasurerAddress());
        society.setSeniorTreasurerMobile(reg.getSeniorTreasurerMobile());

        societyRepository.save(society);

        // Note: Full implementation would also migrate Officials, Members, etc., here.
    }


    // =========================================================================
    // 2. SOCIETY RENEWAL APPROVAL LOGIC (3-Stage: DEAN -> AR -> VC)
    // =========================================================================

    @Transactional
    public SocietyRenewal processRenewalApproval(Long adminId, ApprovalDto dto) {
        AdminUser admin = adminUserRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with ID: " + adminId));

        SocietyRenewal renewal = renewalRepository.findById(dto.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Renewal application not found with ID: " + dto.getApplicationId()));

        ApprovalStage currentStage = renewal.getStatus();

        if (currentStage == ApprovalStage.APPROVED || currentStage == ApprovalStage.REJECTED) {
            throw new IllegalStateException("Application is already finalized.");
        }

        // --- REJECTION LOGIC --- (Similar to Registration)
        if (dto.getAction() == ApprovalAction.REJECT) {
            renewal.setStatus(ApprovalStage.REJECTED);
            renewal.setRejectionReason(dto.getRejectionReason());
            emailService.sendRenewalNotification(renewal, "REJECTED", admin.getName());
            activityLogService.logActivity("RENEWAL REJECTED", "Renewal ID " + renewal.getId() + " rejected by " + admin.getRole().name(), admin.getId().toString(), admin.getName());
            return renewalRepository.save(renewal);
        }

        // --- APPROVAL LOGIC ---
        ApprovalStage nextStage = currentStage;
        String logMessage = "Renewal application ID " + renewal.getId();

        if (currentStage == ApprovalStage.PENDING_DEAN && admin.getRole() == AdminUser.Role.DEAN) {
            if (!admin.getFaculty().equals(renewal.getApplicantFaculty())) {
                throw new SecurityException("Dean is not authorized for this faculty (" + renewal.getApplicantFaculty() + ").");
            }
            renewal.setDeanApprovalDate(LocalDateTime.now());
            nextStage = ApprovalStage.PENDING_AR;
            logMessage += " approved by Dean, moved to AR.";

        } else if (currentStage == ApprovalStage.PENDING_AR && admin.getRole() == AdminUser.Role.ASSISTANT_REGISTRAR) {
            renewal.setArApprovalDate(LocalDateTime.now());
            nextStage = ApprovalStage.PENDING_VC;
            logMessage += " approved by AR, moved to VC.";

        } else if (currentStage == ApprovalStage.PENDING_VC && admin.getRole() == AdminUser.Role.VICE_CHANCELLOR) {
            renewal.setVcApprovalDate(LocalDateTime.now());
            nextStage = ApprovalStage.APPROVED;
            logMessage += " APPROVED by VC and renewed.";

            // FINAL STEP: Update the permanent Society record
            updateSocietyForRenewal(renewal);

        } else {
            throw new IllegalStateException("Invalid approval action or role for the current renewal stage (" + currentStage + ").");
        }

        renewal.setStatus(nextStage);
        emailService.sendRenewalNotification(renewal, nextStage.name(), admin.getName());
        activityLogService.logActivity("RENEWAL STAGE CHANGE", logMessage, admin.getId().toString(), admin.getName());

        return renewalRepository.save(renewal);
    }

    // Helper method to update the permanent Society entity
    private void updateSocietyForRenewal(SocietyRenewal renewal) {
        Society society = societyRepository.findBySocietyName(renewal.getSocietyName())
                .orElseThrow(() -> new ResourceNotFoundException("Permanent Society not found for renewal: " + renewal.getSocietyName()));

        // Update changeable fields with renewal data
        society.setLastRenewalYear(renewal.getRenewalYear());
        society.setAgmDate(renewal.getAgmDate());
        society.setBankAccount(renewal.getBankAccount());
        society.setBankName(renewal.getBankName());
        society.setWebsite(renewal.getWebsite());

        // Update Senior Treasurer
        society.setSeniorTreasurerTitle(renewal.getSeniorTreasurerTitle());
        society.setSeniorTreasurerFullName(renewal.getSeniorTreasurerFullName());
        society.setSeniorTreasurerDesignation(renewal.getSeniorTreasurerDesignation());
        society.setSeniorTreasurerDepartment(renewal.getSeniorTreasurerDepartment());
        society.setSeniorTreasurerEmail(renewal.getSeniorTreasurerEmail());
        society.setSeniorTreasurerAddress(renewal.getSeniorTreasurerAddress());
        society.setSeniorTreasurerMobile(renewal.getSeniorTreasurerMobile());

        societyRepository.save(society);

        // Note: Full implementation would also update/replace Officials, Members, etc., here.
    }

    // =========================================================================
    // 3. EVENT PERMISSION APPROVAL LOGIC (1-Stage: AR Only)
    // =========================================================================

    @Transactional
    public EventPermission processEventPermissionApproval(Long adminId, ApprovalDto dto) {
        AdminUser admin = adminUserRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with ID: " + adminId));

        EventPermission event = eventPermissionRepository.findById(dto.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Event permission application not found with ID: " + dto.getApplicationId()));

        if (event.getStatus() != EventStatus.PENDING_AR) {
            throw new IllegalStateException("Application is already finalized.");
        }

        // Security Check: Only AR can approve, SS can only view (per prompt)
        if (admin.getRole() != AdminUser.Role.ASSISTANT_REGISTRAR) {
            throw new SecurityException("Only the Assistant Registrar is authorized to approve/reject event permissions.");
        }

        if (dto.getAction() == ApprovalAction.REJECT) {
            event.setStatus(EventStatus.REJECTED);
            event.setRejectionReason(dto.getRejectionReason());
            emailService.sendEventNotification(event, "REJECTED", admin.getName());
            activityLogService.logActivity("EVENT REJECTED", "Event ID " + event.getId() + " rejected by AR.", admin.getId().toString(), admin.getName());

        } else if (dto.getAction() == ApprovalAction.APPROVE) {
            event.setStatus(EventStatus.APPROVED);
            event.setArApprovalDate(LocalDateTime.now());
            emailService.sendEventNotification(event, "APPROVED", admin.getName());
            activityLogService.logActivity("EVENT APPROVED", "Event ID " + event.getId() + " APPROVED by AR.", admin.getId().toString(), admin.getName());
        }

        return eventPermissionRepository.save(event);
    }

    // =========================================================================
    // 4. ROLE-BASED FETCHING METHODS (Used by AdminController)
    // =========================================================================

    // Fetch applications pending for the specified Dean's faculty
    public List<SocietyRegistration> getPendingRegistrationsForDean(String faculty) {
        return registrationRepository.findByStatusAndApplicantFaculty(ApprovalStage.PENDING_DEAN, faculty);
    }

    // Fetch renewal applications pending for the specified Dean's faculty
    public List<SocietyRenewal> getPendingRenewalsForDean(String faculty) {
        return renewalRepository.findByStatusAndApplicantFaculty(ApprovalStage.PENDING_DEAN, faculty);
    }

    // Fetch applications pending for Assistant Registrar (AR)
    public List<Object> getPendingApplicationsForAR() {
        List<Object> allPending = new ArrayList<>();
        // Reg/Renewal at PENDING_AR stage
        allPending.addAll(registrationRepository.findByStatus(ApprovalStage.PENDING_AR));
        allPending.addAll(renewalRepository.findByStatus(ApprovalStage.PENDING_AR));
        // Event at PENDING_AR stage
        allPending.addAll(eventPermissionRepository.findByStatus(EventStatus.PENDING_AR));
        return allPending;
    }

    // Fetch applications pending for Vice Chancellor (VC)
    public List<Object> getPendingApplicationsForVC() {
        List<Object> allPending = new ArrayList<>();
        allPending.addAll(registrationRepository.findByStatus(ApprovalStage.PENDING_VC));
        allPending.addAll(renewalRepository.findByStatus(ApprovalStage.PENDING_VC));
        return allPending;
    }

    /**
     * Fetches all registration, renewal, and event applications regardless of status
     * for the Student Service division's monitoring dashboard.
     */
    public List<Object> getAllApplicationsForMonitoring() {
        List<Object> allApplications = new ArrayList<>();
        allApplications.addAll(registrationRepository.findAll());
        allApplications.addAll(renewalRepository.findAll());
        allApplications.addAll(eventPermissionRepository.findAll());
        return allApplications;
    }
}