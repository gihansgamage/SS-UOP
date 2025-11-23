package lk.ac.pdn.sms.controller;

import lk.ac.pdn.sms.dto.AdminUserManagementDto;
import lk.ac.pdn.sms.dto.ApprovalDto;
import lk.ac.pdn.sms.entity.AdminUser;
import lk.ac.pdn.sms.entity.EventPermission;
import lk.ac.pdn.sms.entity.SocietyRegistration;
import lk.ac.pdn.sms.entity.SocietyRenewal;
import lk.ac.pdn.sms.service.AdminService;
import lk.ac.pdn.sms.service.ApprovalService;
import lk.ac.pdn.sms.service.ActivityLogService; // To be used for activity logs in Admin actions
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ApprovalService approvalService;
    private final AdminService adminService;
    private final ActivityLogService activityLogService;

    // Inject services
    public AdminController(ApprovalService approvalService, AdminService adminService, ActivityLogService activityLogService) {
        this.approvalService = approvalService;
        this.adminService = adminService;
        this.activityLogService = activityLogService;
    }

    // --- HELPER METHODS to extract data from the authenticated principal ---

    private Long getAdminId(@AuthenticationPrincipal OAuth2User principal) {
        return (Long) principal.getAttributes().get("id");
    }

    private String getAdminName(@AuthenticationPrincipal OAuth2User principal) {
        return (String) principal.getAttributes().get("name");
    }

    private String getAdminFaculty(@AuthenticationPrincipal OAuth2User principal) {
        return (String) principal.getAttributes().get("faculty");
    }

    // =========================================================================
    // 1. COMMON ENDPOINTS (Accessible to all authenticated admins)
    // =========================================================================

    /**
     * Endpoint for the frontend to determine the admin's role and render the correct dashboard.
     */
    @GetMapping("/user-info")
    public ResponseEntity<?> getAdminUserInfo(@AuthenticationPrincipal OAuth2User principal) {
        // FIX: Use HashMap instead of Map.of to allow null values (like faculty)
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("id", principal.getAttributes().get("id"));
        response.put("email", principal.getAttribute("email"));
        response.put("name", principal.getAttributes().get("name"));
        response.put("role", principal.getAttributes().get("role"));
        response.put("faculty", principal.getAttributes().get("faculty")); // Now safe even if null

        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint for fetching activity logs (common for Dean, VC, AR, SS).
     */
    @GetMapping("/activity-logs")
    @PreAuthorize("hasAnyRole('VICE_CHANCELLOR', 'ASSISTANT_REGISTRAR', 'DEAN', 'STUDENT_SERVICE')")
    public ResponseEntity<?> getActivityLogs() {
        return ResponseEntity.ok(activityLogService.getAllLogs());
    }

    // =========================================================================
    // 2. VICE CHANCELLOR ENDPOINTS (Approvals: Reg/Renewal - Final Stage)
    // =========================================================================

    /**
     * Fetches applications pending final approval (VC stage).
     */
    @GetMapping("/vc/pending-applications")
    @PreAuthorize("hasRole('VICE_CHANCELLOR')")
    public ResponseEntity<List<Object>> getVCPendingApplications() {
        return ResponseEntity.ok(approvalService.getPendingApplicationsForVC());
    }

    /**
     * Processes VC approval/rejection for a Registration application.
     */
    @PostMapping("/vc/approve-registration")
    @PreAuthorize("hasRole('VICE_CHANCELLOR')")
    public ResponseEntity<SocietyRegistration> processRegistrationVC(@AuthenticationPrincipal OAuth2User principal, @Valid @RequestBody ApprovalDto dto) {
        return ResponseEntity.ok(approvalService.processRegistrationApproval(getAdminId(principal), dto));
    }

    /**
     * Processes VC approval/rejection for a Renewal application.
     */
    @PostMapping("/vc/approve-renewal")
    @PreAuthorize("hasRole('VICE_CHANCELLOR')")
    public ResponseEntity<SocietyRenewal> processRenewalVC(@AuthenticationPrincipal OAuth2User principal, @Valid @RequestBody ApprovalDto dto) {
        return ResponseEntity.ok(approvalService.processRenewalApproval(getAdminId(principal), dto));
    }


    // =========================================================================
    // 3. FACULTY DEAN ENDPOINTS (Approvals: Reg/Renewal - First Stage)
    // =========================================================================

    /**
     * Fetches applications pending Dean approval, filtered by the Dean's assigned faculty.
     */
    @GetMapping("/dean/pending-applications")
    @PreAuthorize("hasRole('DEAN')")
    public ResponseEntity<Map<String, List<?>>> getDeanPendingApplications(@AuthenticationPrincipal OAuth2User principal) {
        String faculty = getAdminFaculty(principal);
        if (faculty == null || faculty.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", List.of("Dean faculty not configured.")));
        }

        // Fetch only applications belonging to the Dean's faculty
        List<SocietyRegistration> regs = approvalService.getPendingRegistrationsForDean(faculty);
        List<SocietyRenewal> renewals = approvalService.getPendingRenewalsForDean(faculty);

        return ResponseEntity.ok(Map.of(
                "registrations", regs,
                "renewals", renewals
        ));
    }

    /**
     * Processes Dean approval/rejection for a Registration application.
     */
    @PostMapping("/dean/approve-registration")
    @PreAuthorize("hasRole('DEAN')")
    public ResponseEntity<SocietyRegistration> processRegistrationDean(@AuthenticationPrincipal OAuth2User principal, @Valid @RequestBody ApprovalDto dto) {
        return ResponseEntity.ok(approvalService.processRegistrationApproval(getAdminId(principal), dto));
    }

    /**
     * Processes Dean approval/rejection for a Renewal application.
     */
    @PostMapping("/dean/approve-renewal")
    @PreAuthorize("hasRole('DEAN')")
    public ResponseEntity<SocietyRenewal> processRenewalDean(@AuthenticationPrincipal OAuth2User principal, @Valid @RequestBody ApprovalDto dto) {
        return ResponseEntity.ok(approvalService.processRenewalApproval(getAdminId(principal), dto));
    }


    // =========================================================================
    // 4. ASSISTANT REGISTRAR (AR) / STUDENT SERVICE (SS) ENDPOINTS
    // =========================================================================

    /**
     * Fetches applications pending AR approval (Reg/Renewal - Second Stage; Event - Only Stage).
     * Accessible by both AR and SS for viewing (monitoring).
     */
    @GetMapping("/ar/pending-applications")
    @PreAuthorize("hasAnyRole('ASSISTANT_REGISTRAR', 'STUDENT_SERVICE')")
    public ResponseEntity<List<Object>> getARPendingApplications() {
        return ResponseEntity.ok(approvalService.getPendingApplicationsForAR());
    }

    // --- AR APPROVAL ENDPOINTS (Only AR can approve) ---

    /**
     * Processes AR approval/rejection for a Registration application.
     */
    @PostMapping("/ar/approve-registration")
    @PreAuthorize("hasRole('ASSISTANT_REGISTRAR')")
    public ResponseEntity<SocietyRegistration> processRegistrationAR(@AuthenticationPrincipal OAuth2User principal, @Valid @RequestBody ApprovalDto dto) {
        return ResponseEntity.ok(approvalService.processRegistrationApproval(getAdminId(principal), dto));
    }

    /**
     * Processes AR approval/rejection for a Renewal application.
     */
    @PostMapping("/ar/approve-renewal")
    @PreAuthorize("hasRole('ASSISTANT_REGISTRAR')")
    public ResponseEntity<SocietyRenewal> processRenewalAR(@AuthenticationPrincipal OAuth2User principal, @Valid @RequestBody ApprovalDto dto) {
        return ResponseEntity.ok(approvalService.processRenewalApproval(getAdminId(principal), dto));
    }

    /**
     * Processes AR approval/rejection for an Event Permission request (only AR approval).
     */
    @PostMapping("/ar/approve-event")
    @PreAuthorize("hasRole('ASSISTANT_REGISTRAR')")
    public ResponseEntity<EventPermission> processEventPermissionAR(@AuthenticationPrincipal OAuth2User principal, @Valid @RequestBody ApprovalDto dto) {
        return ResponseEntity.ok(approvalService.processEventPermissionApproval(getAdminId(principal), dto));
    }

    // --- SS MONITORING ENDPOINTS (Only SS can view all stages) ---

    /**
     * Fetches all registration, renewal, and event applications for monitoring by Student Service.
     */
    @GetMapping("/ss/monitoring-applications")
    @PreAuthorize("hasRole('STUDENT_SERVICE')")
    public ResponseEntity<List<Object>> getAllApplicationsForMonitoring() {
        return ResponseEntity.ok(approvalService.getAllApplicationsForMonitoring());
    }

    // =========================================================================
    // 5. ADMIN USER MANAGEMENT (Only AR can manage Admin Users)
    // =========================================================================

    /**
     * AR: Endpoint to add a new admin user to the database.
     */
    @PostMapping("/ar/manage-admin/add")
    @PreAuthorize("hasRole('ASSISTANT_REGISTRAR')")
    public ResponseEntity<AdminUser> addAdminUser(@AuthenticationPrincipal OAuth2User principal, @Valid @RequestBody AdminUserManagementDto dto) {
        AdminUser newAdmin = adminService.addAdmin(dto);
        activityLogService.logActivity(
                "ADMIN ADDED",
                "New admin " + newAdmin.getEmail() + " (" + newAdmin.getRole().name() + ") added.",
                getAdminId(principal).toString(),
                getAdminName(principal)
        );
        return ResponseEntity.ok(newAdmin);
    }

    /**
     * AR: Endpoint to remove/deactivate an admin user (sets isActive=false).
     */
    @PostMapping("/ar/manage-admin/remove")
    @PreAuthorize("hasRole('ASSISTANT_REGISTRAR')")
    public ResponseEntity<AdminUser> removeAdminUser(@AuthenticationPrincipal OAuth2User principal, @RequestParam String email) {
        AdminUser deactivatedAdmin = adminService.removeAdmin(email);
        activityLogService.logActivity(
                "ADMIN REMOVED",
                "Admin " + deactivatedAdmin.getEmail() + " deactivated.",
                getAdminId(principal).toString(),
                getAdminName(principal)
        );
        return ResponseEntity.ok(deactivatedAdmin);
    }
}