package lk.ac.pdn.sms.controller;

import lk.ac.pdn.sms.dto.AdminUserManagementDto;
import lk.ac.pdn.sms.dto.ApprovalDto;
import lk.ac.pdn.sms.entity.AdminUser;
import lk.ac.pdn.sms.service.AdminService;
import lk.ac.pdn.sms.service.ApprovalService;
import lk.ac.pdn.sms.service.ActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

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

    public AdminController(ApprovalService approvalService, AdminService adminService, ActivityLogService activityLogService) {
        this.approvalService = approvalService;
        this.adminService = adminService;
        this.activityLogService = activityLogService;
    }

    // FIX 1: Use HashMap instead of Map.of to avoid NullPointerException when faculty is null
    @GetMapping("/user-info")
    public ResponseEntity<?> getAdminUserInfo(@AuthenticationPrincipal OAuth2User principal) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", principal.getAttributes().get("id"));
        response.put("email", principal.getAttribute("email"));
        response.put("name", principal.getAttributes().get("name"));
        response.put("role", principal.getAttributes().get("role"));
        response.put("faculty", principal.getAttributes().get("faculty"));
        return ResponseEntity.ok(response);
    }

    // FIX 2: Update endpoints to use the new ApprovalService methods that return DTOs

    // --- DEAN ---
    @GetMapping("/dean/pending-applications")
    @PreAuthorize("hasRole('DEAN')")
    public ResponseEntity<List<ApprovalDto>> getDeanPendingApplications(@AuthenticationPrincipal OAuth2User principal) {
        String faculty = (String) principal.getAttributes().get("faculty");
        // Ensure faculty is not null for Dean queries
        if (faculty == null) faculty = "";
        return ResponseEntity.ok(approvalService.getDeanPendingApprovals(faculty));
    }

    // --- ASSISTANT REGISTRAR ---
    @GetMapping("/ar/pending-applications")
    @PreAuthorize("hasRole('ASSISTANT_REGISTRAR')")
    public ResponseEntity<List<ApprovalDto>> getARPendingApplications() {
        return ResponseEntity.ok(approvalService.getARPendingApprovals());
    }

    // --- VICE CHANCELLOR ---
    @GetMapping("/vc/pending-applications")
    @PreAuthorize("hasRole('VICE_CHANCELLOR')")
    public ResponseEntity<List<ApprovalDto>> getVCPendingApplications() {
        return ResponseEntity.ok(approvalService.getVCPendingApprovals());
    }

    // --- STUDENT SERVICE (Monitoring) ---
    @GetMapping("/ss/monitoring-applications")
    @PreAuthorize("hasRole('STUDENT_SERVICE')")
    public ResponseEntity<List<ApprovalDto>> getMonitoringApplications() {
        return ResponseEntity.ok(approvalService.getMonitoringApplications());
    }

    // --- APPROVAL ACTIONS (Approving/Rejecting) ---

    @PostMapping("/approve-registration/{id}")
    @PreAuthorize("hasAnyRole('DEAN', 'ASSISTANT_REGISTRAR', 'VICE_CHANCELLOR')")
    public ResponseEntity<?> approveRegistration(@PathVariable Long id, @RequestBody Map<String, String> body) {
        // Logic to call appropriate approval service based on role would go here
        // For now, assuming basic approval is handled or extended in ApprovalService
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reject-registration/{id}")
    @PreAuthorize("hasAnyRole('DEAN', 'ASSISTANT_REGISTRAR', 'VICE_CHANCELLOR')")
    public ResponseEntity<?> rejectRegistration(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok().build();
    }

    // --- USER MANAGEMENT ---

    @PostMapping("/ar/manage-admin/add")
    @PreAuthorize("hasRole('ASSISTANT_REGISTRAR')")
    public ResponseEntity<AdminUser> addAdminUser(@AuthenticationPrincipal OAuth2User principal, @Valid @RequestBody AdminUserManagementDto dto) {
        AdminUser newAdmin = adminService.addAdmin(dto);
        logAdminAction("ADMIN ADDED", "New admin " + newAdmin.getEmail() + " added.", principal);
        return ResponseEntity.ok(newAdmin);
    }

    @PostMapping("/ar/manage-admin/remove")
    @PreAuthorize("hasRole('ASSISTANT_REGISTRAR')")
    public ResponseEntity<AdminUser> removeAdminUser(@AuthenticationPrincipal OAuth2User principal, @RequestParam String email) {
        AdminUser deactivatedAdmin = adminService.removeAdmin(email);
        logAdminAction("ADMIN REMOVED", "Admin " + deactivatedAdmin.getEmail() + " deactivated.", principal);
        return ResponseEntity.ok(deactivatedAdmin);
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<?> getActivityLogs(
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        // Call ActivityLogService...
        return ResponseEntity.ok().build();
    }

    // Helper for logging
    private void logAdminAction(String action, String target, OAuth2User principal) {
        String adminId = String.valueOf(principal.getAttributes().get("id"));
        String adminName = (String) principal.getAttributes().get("name");
        activityLogService.logActivity(action, target, adminId, adminName);
    }
}