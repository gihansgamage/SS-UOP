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

    // FIX: Changed parameter from String (email) to AdminUser (object)
    public Map<String, Object> getDashboardData(AdminUser admin) {

        // We no longer look up by email here, because the Controller
        // has already constructed the AdminUser object (supporting both DB users and Master Keys).

        Map<String, Object> dashboardData = new HashMap<>();

        // Basic statistics
        dashboardData.put("totalSocieties", societyRepository.count());
        dashboardData.put("activeSocieties", societyRepository.countByStatus(Society.SocietyStatus.ACTIVE));
        dashboardData.put("currentYearRegistrations", registrationRepository.countByYear(LocalDate.now().getYear()));
        dashboardData.put("currentYearRenewals", renewalRepository.countByYear(LocalDate.now().getYear()));

        // Pending items based on role
        int pendingCount = 0;

        if (admin.getRole() != null) {
            switch (admin.getRole()) {
                case DEAN:
                    // Use safe checks for faculty
                    String faculty = admin.getFaculty() != null ? admin.getFaculty() : "";
                    pendingCount += registrationRepository.findByStatusAndApplicantFaculty(
                            SocietyRegistration.ApprovalStage.PENDING_DEAN, faculty).size();
                    pendingCount += renewalRepository.findByStatusAndApplicantFaculty(
                            SocietyRenewal.RenewalStatus.PENDING_DEAN, faculty).size();
                    break;
                case ASSISTANT_REGISTRAR:
                    pendingCount += registrationRepository.findByStatus(SocietyRegistration.ApprovalStage.PENDING_AR).size();
                    pendingCount += renewalRepository.findByStatus(SocietyRenewal.RenewalStatus.PENDING_AR).size();
                    pendingCount += eventPermissionRepository.findByStatus(EventPermission.EventStatus.PENDING_AR).size();
                    break;
                case VICE_CHANCELLOR:
                    pendingCount += registrationRepository.findByStatus(SocietyRegistration.ApprovalStage.PENDING_VC).size();
                    pendingCount += renewalRepository.findByStatus(SocietyRenewal.RenewalStatus.PENDING_VC).size();
                    pendingCount += eventPermissionRepository.findByStatus(EventPermission.EventStatus.PENDING_VC).size();
                    break;
                case STUDENT_SERVICE:
                    // Student Service generally monitors all, but doesn't have a specific "Approval Queue"
                    // If they do, add the logic here. For now, we set to 0 or count total pending.
                    pendingCount = 0;
                    break;
            }
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