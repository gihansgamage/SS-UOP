package lk.ac.pdn.sms.service;

import lk.ac.pdn.sms.dto.ApprovalDto;
import lk.ac.pdn.sms.dto.ApprovalDto.ApprovalAction;
import lk.ac.pdn.sms.entity.*;
import lk.ac.pdn.sms.entity.SocietyRegistration.ApprovalStage;
import lk.ac.pdn.sms.entity.SocietyRenewal.RenewalStatus;
import lk.ac.pdn.sms.entity.EventPermission.EventStatus;
import lk.ac.pdn.sms.repository.*;
import lk.ac.pdn.sms.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ApprovalService {

    private final SocietyRegistrationRepository registrationRepository;
    private final SocietyRenewalRepository renewalRepository;
    private final EventPermissionRepository eventPermissionRepository;
    private final AdminUserRepository adminUserRepository;
    private final SocietyRepository societyRepository;
    private final EmailService emailService;
    private final ActivityLogService activityLogService;

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

    @Transactional
    public SocietyRegistration processRegistrationApproval(Long adminId, ApprovalDto dto) {
        AdminUser admin = adminUserRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        SocietyRegistration reg = registrationRepository.findById(dto.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (dto.getAction() == ApprovalAction.REJECT) {
            reg.setStatus(ApprovalStage.REJECTED);
            reg.setRejectionReason(dto.getReason());
            emailService.sendRegistrationNotification(reg, "REJECTED", admin.getName());
            return registrationRepository.save(reg);
        }

        ApprovalStage nextStage = reg.getStatus();

        if (reg.getStatus() == ApprovalStage.PENDING_DEAN && admin.getRole() == AdminUser.Role.DEAN) {
            reg.setDeanApprovalDate(LocalDateTime.now());
            nextStage = ApprovalStage.PENDING_AR;
        } else if (reg.getStatus() == ApprovalStage.PENDING_AR && admin.getRole() == AdminUser.Role.ASSISTANT_REGISTRAR) {
            reg.setArApprovalDate(LocalDateTime.now());
            nextStage = ApprovalStage.PENDING_VC;
        } else if (reg.getStatus() == ApprovalStage.PENDING_VC && admin.getRole() == AdminUser.Role.VICE_CHANCELLOR) {
            reg.setVcApprovalDate(LocalDateTime.now());
            nextStage = ApprovalStage.APPROVED;
            migrateRegistrationToSociety(reg);
        }

        reg.setStatus(nextStage);
        emailService.sendRegistrationNotification(reg, nextStage.name(), admin.getName());
        return registrationRepository.save(reg);
    }

    private void migrateRegistrationToSociety(SocietyRegistration reg) {
        Society society = new Society();
        society.setSocietyName(reg.getSocietyName());
        society.setAims(reg.getAims());
        if(reg.getAgmDate() != null) {
            society.setAgmDate(reg.getAgmDate());
        }
        society.setBankAccount(reg.getBankAccount());
        society.setBankName(reg.getBankName());
        society.setPrimaryFaculty(reg.getApplicantFaculty());
        society.setStatus(Society.SocietyStatus.ACTIVE);
        society.setYear(reg.getYear());

        society.setSeniorTreasurerTitle(reg.getSeniorTreasurerTitle());
        society.setSeniorTreasurerFullName(reg.getSeniorTreasurerFullName());
        society.setSeniorTreasurerDesignation(reg.getSeniorTreasurerDesignation());
        society.setSeniorTreasurerDepartment(reg.getSeniorTreasurerDepartment());
        society.setSeniorTreasurerEmail(reg.getSeniorTreasurerEmail());
        society.setSeniorTreasurerAddress(reg.getSeniorTreasurerAddress());
        society.setSeniorTreasurerMobile(reg.getSeniorTreasurerMobile());

        societyRepository.save(society);
    }

    @Transactional
    public SocietyRenewal processRenewalApproval(Long adminId, ApprovalDto dto) {
        AdminUser admin = adminUserRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        SocietyRenewal renewal = renewalRepository.findById(dto.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Renewal not found"));

        if (dto.getAction() == ApprovalAction.REJECT) {
            renewal.setStatus(RenewalStatus.REJECTED);
            renewal.setRejectionReason(dto.getReason());
            emailService.sendRenewalNotification(renewal, "REJECTED", admin.getName());
            return renewalRepository.save(renewal);
        }

        RenewalStatus nextStage = renewal.getStatus();
        if (renewal.getStatus() == RenewalStatus.PENDING_DEAN && admin.getRole() == AdminUser.Role.DEAN) {
            renewal.setDeanApprovalDate(LocalDateTime.now());
            nextStage = RenewalStatus.PENDING_AR;
        } else if (renewal.getStatus() == RenewalStatus.PENDING_AR && admin.getRole() == AdminUser.Role.ASSISTANT_REGISTRAR) {
            renewal.setArApprovalDate(LocalDateTime.now());
            nextStage = RenewalStatus.PENDING_VC;
        } else if (renewal.getStatus() == RenewalStatus.PENDING_VC && admin.getRole() == AdminUser.Role.VICE_CHANCELLOR) {
            renewal.setVcApprovalDate(LocalDateTime.now());
            nextStage = RenewalStatus.APPROVED;
            updateSocietyForRenewal(renewal);
        }

        renewal.setStatus(nextStage);
        emailService.sendRenewalNotification(renewal, nextStage.name(), admin.getName());
        return renewalRepository.save(renewal);
    }

    private void updateSocietyForRenewal(SocietyRenewal renewal) {
        // Implementation for updating permanent society record
        societyRepository.findBySocietyName(renewal.getSocietyName()).ifPresent(society -> {
            society.setYear(renewal.getYear());
            // Update other fields as necessary
            societyRepository.save(society);
        });
    }

    @Transactional
    public EventPermission processEventPermissionApproval(Long adminId, ApprovalDto dto) {
        AdminUser admin = adminUserRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        EventPermission event = eventPermissionRepository.findById(dto.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (dto.getAction() == ApprovalAction.REJECT) {
            event.setStatus(EventStatus.REJECTED);
            event.setRejectionReason(dto.getReason());
            emailService.sendEventNotification(event, "REJECTED", admin.getName());
        } else {
            // AR approval is final for events in this simple workflow, or add VC step if needed
            event.setStatus(EventStatus.APPROVED);
            event.setArApprovalDate(LocalDateTime.now());
            emailService.sendEventNotification(event, "APPROVED", admin.getName());
        }

        return eventPermissionRepository.save(event);
    }

    public List<SocietyRegistration> getPendingRegistrationsForDean(String faculty) {
        return registrationRepository.findByStatusAndApplicantFaculty(ApprovalStage.PENDING_DEAN, faculty);
    }

    public List<SocietyRenewal> getPendingRenewalsForDean(String faculty) {
        return renewalRepository.findByStatusAndApplicantFaculty(RenewalStatus.PENDING_DEAN, faculty);
    }

    public List<Object> getPendingApplicationsForAR() {
        List<Object> pending = new ArrayList<>();
        pending.addAll(registrationRepository.findByStatus(ApprovalStage.PENDING_AR));
        pending.addAll(renewalRepository.findByStatus(RenewalStatus.PENDING_AR));
        pending.addAll(eventPermissionRepository.findByStatus(EventStatus.PENDING_AR));
        return pending;
    }

    public List<Object> getPendingApplicationsForVC() {
        List<Object> pending = new ArrayList<>();
        pending.addAll(registrationRepository.findByStatus(ApprovalStage.PENDING_VC));
        pending.addAll(renewalRepository.findByStatus(RenewalStatus.PENDING_VC));
        pending.addAll(eventPermissionRepository.findByStatus(EventStatus.PENDING_VC));
        return pending;
    }

    public List<Object> getAllApplicationsForMonitoring() {
        List<Object> all = new ArrayList<>();
        all.addAll(registrationRepository.findAll());
        all.addAll(renewalRepository.findAll());
        all.addAll(eventPermissionRepository.findAll());
        return all;
    }
}