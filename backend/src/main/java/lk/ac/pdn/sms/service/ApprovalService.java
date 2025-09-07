package lk.ac.pdn.sms.service;

import lk.ac.pdn.sms.dto.ApprovalDto;
import lk.ac.pdn.sms.entity.*;
import lk.ac.pdn.sms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ApprovalService {

    @Autowired
    private SocietyRegistrationRepository registrationRepository;

    @Autowired
    private EventPermissionRepository eventPermissionRepository;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private SocietyRepository societyRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ActivityLogService activityLogService;

    public Map<String, Object> getPendingApprovals(String userEmail) {
        AdminUser admin = adminUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        Map<String, Object> pendingApprovals = new HashMap<>();

        switch (admin.getRole()) {
            case DEAN:
                List<SocietyRegistration> deanRegistrations = registrationRepository
                        .findByStatusAndApplicantFaculty(
                                SocietyRegistration.RegistrationStatus.PENDING_DEAN,
                                admin.getFaculty());
                pendingApprovals.put("registrations", deanRegistrations);
                break;

            case ASSISTANT_REGISTRAR:
                List<SocietyRegistration> arRegistrations = registrationRepository
                        .findByStatus(SocietyRegistration.RegistrationStatus.PENDING_AR);
                List<EventPermission> arEvents = eventPermissionRepository
                        .findByStatus(EventPermission.EventStatus.PENDING_AR);
                pendingApprovals.put("registrations", arRegistrations);
                pendingApprovals.put("events", arEvents);
                break;

            case VICE_CHANCELLOR:
                List<SocietyRegistration> vcRegistrations = registrationRepository
                        .findByStatus(SocietyRegistration.RegistrationStatus.PENDING_VC);
                List<EventPermission> vcEvents = eventPermissionRepository
                        .findByStatus(EventPermission.EventStatus.PENDING_VC);
                pendingApprovals.put("registrations", vcRegistrations);
                pendingApprovals.put("events", vcEvents);
                break;
        }

        return pendingApprovals;
    }

    public SocietyRegistration approveRegistration(Long id, ApprovalDto approvalDto, String userEmail) {
        SocietyRegistration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        AdminUser admin = adminUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        // Update approval status based on admin role
        switch (admin.getRole()) {
            case DEAN:
                if (registration.getStatus() == SocietyRegistration.RegistrationStatus.PENDING_DEAN) {
                    registration.setIsDeanApproved(true);
                    registration.setStatus(SocietyRegistration.RegistrationStatus.PENDING_AR);
                    emailService.notifyAssistantRegistrarForApproval(registration);
                }
                break;

            case ASSISTANT_REGISTRAR:
                if (registration.getStatus() == SocietyRegistration.RegistrationStatus.PENDING_AR) {
                    registration.setIsArApproved(true);
                    registration.setStatus(SocietyRegistration.RegistrationStatus.PENDING_VC);
                    emailService.notifyViceChancellorForApproval(registration);
                }
                break;

            case VICE_CHANCELLOR:
                if (registration.getStatus() == SocietyRegistration.RegistrationStatus.PENDING_VC) {
                    registration.setIsVcApproved(true);
                    registration.setStatus(SocietyRegistration.RegistrationStatus.APPROVED);
                    registration.setApprovedDate(LocalDateTime.now());

                    // Create final society record
                    createFinalSociety(registration);

                    // Send congratulations emails
                    emailService.sendApprovalNotification(registration);
                }
                break;
        }

        registration = registrationRepository.save(registration);

        // Log activity
        activityLogService.logActivity("Registration Approved",
                registration.getSocietyName(), admin.getName());

        return registration;
    }

    public SocietyRegistration rejectRegistration(Long id, ApprovalDto approvalDto, String userEmail) {
        SocietyRegistration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        AdminUser admin = adminUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        registration.setStatus(SocietyRegistration.RegistrationStatus.REJECTED);
        registration.setRejectionReason(approvalDto.getReason());
        registration = registrationRepository.save(registration);

        // Send rejection email
        emailService.sendRejectionNotification(registration);

        // Log activity
        activityLogService.logActivity("Registration Rejected",
                registration.getSocietyName(), admin.getName());

        return registration;
    }

    public EventPermission approveEvent(Long id, ApprovalDto approvalDto, String userEmail) {
        EventPermission event = eventPermissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event permission not found"));

        AdminUser admin = adminUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        // Update approval status based on admin role
        switch (admin.getRole()) {
            case ASSISTANT_REGISTRAR:
                if (event.getStatus() == EventPermission.EventStatus.PENDING_AR) {
                    event.setIsArApproved(true);
                    event.setStatus(EventPermission.EventStatus.PENDING_VC);
                    emailService.notifyViceChancellorForEventApproval(event);
                }
                break;

            case VICE_CHANCELLOR:
                if (event.getStatus() == EventPermission.EventStatus.PENDING_VC) {
                    event.setIsVcApproved(true);
                    event.setStatus(EventPermission.EventStatus.APPROVED);
                    event.setApprovedDate(LocalDateTime.now());
                    emailService.sendEventApprovalNotification(event);
                }
                break;
        }

        event = eventPermissionRepository.save(event);

        // Log activity
        activityLogService.logActivity("Event Permission Approved",
                event.getEventName(), admin.getName());

        return event;
    }

    private void createFinalSociety(SocietyRegistration registration) {
        Society society = new Society();
        society.setSocietyName(registration.getSocietyName());
        society.setRegisteredDate(LocalDate.now());
        society.setStatus(Society.SocietyStatus.ACTIVE);
        society.setYear(registration.getYear());

        societyRepository.save(society);

        // Create society officials records
        // Implementation details...
    }
}