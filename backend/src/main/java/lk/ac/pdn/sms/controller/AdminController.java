package lk.ac.pdn.sms.controller;

// ... imports ...
import lk.ac.pdn.sms.dto.AdminUserManagementDto;
import lk.ac.pdn.sms.dto.ApprovalDto;
import lk.ac.pdn.sms.entity.AdminUser;
import lk.ac.pdn.sms.service.AdminService;
import lk.ac.pdn.sms.service.ApprovalService;
import lk.ac.pdn.sms.service.ActivityLogService;
import lk.ac.pdn.sms.repository.AdminUserRepository; // Import Repo
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication; // Generic Auth
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ApprovalService approvalService;
    private final AdminService adminService;
    private final ActivityLogService activityLogService;

    @Autowired
    private AdminUserRepository adminUserRepository; // To fetch data for Form Login users

    public AdminController(ApprovalService approvalService, AdminService adminService, ActivityLogService activityLogService) {
        this.approvalService = approvalService;
        this.adminService = adminService;
        this.activityLogService = activityLogService;
    }

    // Helper method to extract AdminUser info from ANY authentication source
    private AdminUser getAdminUserFromAuth(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        AdminUser admin = new AdminUser();

        if (principal instanceof OAuth2User) {
            OAuth2User oauth = (OAuth2User) principal;
            admin.setId(oauth.getAttribute("id") != null ? (Long) oauth.getAttribute("id") : 0L);
            admin.setName(oauth.getAttribute("name"));
            admin.setEmail(oauth.getAttribute("email"));
            String roleStr = oauth.getAttribute("role");
            if (roleStr != null) admin.setRole(AdminUser.Role.valueOf(roleStr));
            admin.setFaculty(oauth.getAttribute("faculty"));
        }
        else if (principal instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) principal;
            // Fetch full details from DB because UserDetails only has username/password/role
            AdminUser dbUser = adminUserRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            admin.setId(dbUser.getId());
            admin.setName(dbUser.getName());
            admin.setEmail(dbUser.getEmail());
            admin.setRole(dbUser.getRole());
            admin.setFaculty(dbUser.getFaculty());
        }
        return admin;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication authentication) { // Changed param
        AdminUser admin = getAdminUserFromAuth(authentication);
        return ResponseEntity.ok(adminService.getDashboardData(admin));
    }

    @GetMapping("/user-info")
    public ResponseEntity<?> getAdminUserInfo(Authentication authentication) { // Changed param
        AdminUser admin = getAdminUserFromAuth(authentication);
        Map<String, Object> response = new HashMap<>();
        response.put("id", admin.getId());
        response.put("email", admin.getEmail());
        response.put("name", admin.getName());
        response.put("role", admin.getRole());
        response.put("faculty", admin.getFaculty());
        return ResponseEntity.ok(response);
    }

    // --- Keep the rest of the controller methods but replace @AuthenticationPrincipal params ---

    @GetMapping("/dean/pending-applications")
    @PreAuthorize("hasRole('DEAN')")
    public ResponseEntity<List<ApprovalDto>> getDeanPendingApplications(Authentication authentication) {
        AdminUser admin = getAdminUserFromAuth(authentication);
        return ResponseEntity.ok(approvalService.getDeanPendingApprovals(admin.getFaculty()));
    }

    // AR, VC, SS methods don't use the principal param, so they stay the same
    @GetMapping("/ar/pending-applications")
    @PreAuthorize("hasRole('ASSISTANT_REGISTRAR')")
    public ResponseEntity<List<ApprovalDto>> getARPendingApplications() {
        return ResponseEntity.ok(approvalService.getARPendingApprovals());
    }

    @GetMapping("/vc/pending-applications")
    @PreAuthorize("hasRole('VICE_CHANCELLOR')")
    public ResponseEntity<List<ApprovalDto>> getVCPendingApplications() {
        return ResponseEntity.ok(approvalService.getVCPendingApprovals());
    }

    @GetMapping("/ss/monitoring-applications")
    @PreAuthorize("hasRole('STUDENT_SERVICE')")
    public ResponseEntity<List<ApprovalDto>> getMonitoringApplications() {
        return ResponseEntity.ok(approvalService.getMonitoringApplications());
    }

    // --- Actions ---
    @PostMapping("/approve-registration/{id}")
    @PreAuthorize("hasAnyRole('DEAN', 'ASSISTANT_REGISTRAR', 'VICE_CHANCELLOR')")
    public ResponseEntity<?> approveRegistration(@PathVariable Long id, @RequestBody ApprovalDto dto) {
        approvalService.processRegistrationApproval(id, dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reject-registration/{id}")
    @PreAuthorize("hasAnyRole('DEAN', 'ASSISTANT_REGISTRAR', 'VICE_CHANCELLOR')")
    public ResponseEntity<?> rejectRegistration(@PathVariable Long id, @RequestBody ApprovalDto dto) {
        approvalService.processRegistrationApproval(id, dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/ar/manage-admin/add")
    @PreAuthorize("hasRole('ASSISTANT_REGISTRAR')")
    public ResponseEntity<AdminUser> addAdminUser(Authentication authentication, @Valid @RequestBody AdminUserManagementDto dto) {
        AdminUser newAdmin = adminService.addAdmin(dto);
        logAdminAction("ADMIN ADDED", "New admin " + newAdmin.getEmail() + " added.", authentication);
        return ResponseEntity.ok(newAdmin);
    }

    @PostMapping("/ar/manage-admin/remove")
    @PreAuthorize("hasRole('ASSISTANT_REGISTRAR')")
    public ResponseEntity<AdminUser> removeAdminUser(Authentication authentication, @RequestParam String email) {
        AdminUser deactivatedAdmin = adminService.removeAdmin(email);
        logAdminAction("ADMIN REMOVED", "Admin " + deactivatedAdmin.getEmail() + " deactivated.", authentication);
        return ResponseEntity.ok(deactivatedAdmin);
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<?> getActivityLogs(
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok().build();
    }

    private void logAdminAction(String action, String target, Authentication authentication) {
        AdminUser admin = getAdminUserFromAuth(authentication);
        activityLogService.logActivity(action, target, String.valueOf(admin.getId()), admin.getName());
    }
}