package lk.ac.pdn.sms.service;

import lk.ac.pdn.sms.dto.AdminUserManagementDto;
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
                        SocietyRegistration.ApprovalStage.PENDING_DEAN, admin.getFaculty()).size();
                // Use RenewalStatus for renewals
                pendingCount += renewalRepository.findByStatusAndApplicantFaculty(
                        SocietyRenewal.RenewalStatus.PENDING_DEAN, admin.getFaculty()).size();
                break;
            case ASSISTANT_REGISTRAR:
                pendingCount += registrationRepository.findByStatus(SocietyRegistration.ApprovalStage.PENDING_AR).size();
                // Use RenewalStatus for renewals
                pendingCount += renewalRepository.findByStatus(SocietyRenewal.RenewalStatus.PENDING_AR).size();
                pendingCount += eventPermissionRepository.findByStatus(EventPermission.EventStatus.PENDING_AR).size();
                break;
            case VICE_CHANCELLOR:
                pendingCount += registrationRepository.findByStatus(SocietyRegistration.ApprovalStage.PENDING_VC).size();
                // Use RenewalStatus for renewals
                pendingCount += renewalRepository.findByStatus(SocietyRenewal.RenewalStatus.PENDING_VC).size();
                pendingCount += eventPermissionRepository.findByStatus(EventPermission.EventStatus.PENDING_VC).size();
                break;
        }

        dashboardData.put("pendingApprovals", pendingCount);
        dashboardData.put("upcomingEvents", eventPermissionRepository.findUpcomingApprovedEvents());
        dashboardData.put("adminInfo", admin);

        return dashboardData;
    }

    public AdminUser addAdmin(AdminUserManagementDto dto) {
        if (adminUserRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Admin with this email already exists");
        }
        AdminUser admin = new AdminUser();
        admin.setName(dto.getName());
        admin.setEmail(dto.getEmail());
        admin.setRole(dto.getRole());
        admin.setFaculty(dto.getFaculty());
        admin.setIsActive(true);
        return adminUserRepository.save(admin);
    }

    public AdminUser removeAdmin(String email) {
        AdminUser admin = adminUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        admin.setIsActive(false);
        return adminUserRepository.save(admin);
    }

    public Page<ActivityLog> getActivityLogs(String userFilter, String actionFilter, Pageable pageable) {
        return activityLogService.getActivityLogs(userFilter, actionFilter, pageable);
    }

    public Page<Object> getAdminSocieties(Integer year, String status, Pageable pageable) {
        return societyRepository.findAll(pageable).map(society -> {
            Map<String, Object> societyData = new HashMap<>();
            societyData.put("society", society);
            return societyData;
        });
    }

    public void sendBulkEmail(Object emailRequest, String senderEmail) {
        AdminUser sender = adminUserRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        activityLogService.logActivity("Bulk Email Sent", "Multiple Recipients", sender.getName());
    }
}