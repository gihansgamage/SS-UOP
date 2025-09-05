package lk.ac.pdn.sms.service;

import lk.ac.pdn.sms.entity.*;
import lk.ac.pdn.sms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private SocietyRepository societyRepository;

    @Autowired
    private SocietyRegistrationRepository registrationRepository;

    @Autowired
    private SocietyRenewalRepository renewalRepository;

    @Autowired
    private EventPermissionRepository eventPermissionRepository;

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private EmailService emailService;

    public Map<String, Object> getDashboardData(String userEmail) {
        AdminUser admin = adminUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        Map<String, Object> dashboardData = new HashMap<>();
        
        // Basic statistics
        dashboardData.put("totalSocieties", societyRepository.count());
        dashboardData.put("activeSocieties", societyRepository.countByStatus(Society.SocietyStatus.ACTIVE));
        dashboardData.put("currentYearRegistrations", registrationRepository.countByYear(LocalDate.now().getYear()));
        dashboardData.put("currentYearRenewals", renewalRepository.countByYear(LocalDate.now().getYear()));
        
        // Pending items based on role
        int pendingCount = 0;
        switch (admin.getRole()) {
            case DEAN:
                pendingCount += registrationRepository.findByStatusAndApplicantFaculty(
                        SocietyRegistration.RegistrationStatus.PENDING_DEAN, admin.getFaculty()).size();
                pendingCount += renewalRepository.findByStatusAndApplicantFaculty(
                        SocietyRenewal.RenewalStatus.PENDING_DEAN, admin.getFaculty()).size();
                break;
            case ASSISTANT_REGISTRAR:
                pendingCount += registrationRepository.findByStatus(SocietyRegistration.RegistrationStatus.PENDING_AR).size();
                pendingCount += renewalRepository.findByStatus(SocietyRenewal.RenewalStatus.PENDING_AR).size();
                pendingCount += eventPermissionRepository.findByStatus(EventPermission.EventStatus.PENDING_AR).size();
                break;
            case VICE_CHANCELLOR:
                pendingCount += registrationRepository.findByStatus(SocietyRegistration.RegistrationStatus.PENDING_VC).size();
                pendingCount += renewalRepository.findByStatus(SocietyRenewal.RenewalStatus.PENDING_VC).size();
                pendingCount += eventPermissionRepository.findByStatus(EventPermission.EventStatus.PENDING_VC).size();
                break;
        }
        
        dashboardData.put("pendingApprovals", pendingCount);
        dashboardData.put("upcomingEvents", eventPermissionRepository.findUpcomingApprovedEvents());
        dashboardData.put("adminInfo", admin);
        
        return dashboardData;
    }

    public Page<ActivityLog> getActivityLogs(String userFilter, String actionFilter, Pageable pageable) {
        return activityLogService.getActivityLogs(userFilter, actionFilter, pageable);
    }

    public Page<Object> getAdminSocieties(Integer year, String status, Pageable pageable) {
        // Implementation for admin societies view with filtering
        return societyRepository.findAll(pageable).map(society -> {
            Map<String, Object> societyData = new HashMap<>();
            societyData.put("society", society);
            // Add additional data like officials, statistics, etc.
            return societyData;
        });
    }

    public void sendBulkEmail(Object emailRequest, String senderEmail) {
        // Implementation for bulk email sending
        // This would parse the email request and send to selected recipients
        AdminUser sender = adminUserRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        // Log the bulk email activity
        activityLogService.logActivity("Bulk Email Sent", "Multiple Recipients", sender.getName());
    }
}