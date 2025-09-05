package lk.ac.pdn.sms.controller;

import lk.ac.pdn.sms.dto.ApprovalDto;
import lk.ac.pdn.sms.entity.SocietyRegistration;
import lk.ac.pdn.sms.entity.EventPermission;
import lk.ac.pdn.sms.entity.ActivityLog;
import lk.ac.pdn.sms.service.AdminService;
import lk.ac.pdn.sms.service.ApprovalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private ApprovalService approvalService;

    @GetMapping("/dashboard")
    public ResponseEntity<Object> getDashboardData(Principal principal) {
        Object dashboardData = adminService.getDashboardData(principal.getName());
        return ResponseEntity.ok(dashboardData);
    }

    @GetMapping("/pending-approvals")
    public ResponseEntity<Object> getPendingApprovals(Principal principal) {
        Object pendingApprovals = approvalService.getPendingApprovals(principal.getName());
        return ResponseEntity.ok(pendingApprovals);
    }

    @PostMapping("/approve-registration/{id}")
    @PreAuthorize("hasRole('DEAN') or hasRole('ASSISTANT_REGISTRAR') or hasRole('VICE_CHANCELLOR')")
    public ResponseEntity<SocietyRegistration> approveRegistration(
            @PathVariable Long id,
            @Valid @RequestBody ApprovalDto approvalDto,
            Principal principal) {
        
        SocietyRegistration approved = approvalService.approveRegistration(id, approvalDto, principal.getName());
        return ResponseEntity.ok(approved);
    }

    @PostMapping("/reject-registration/{id}")
    @PreAuthorize("hasRole('DEAN') or hasRole('ASSISTANT_REGISTRAR') or hasRole('VICE_CHANCELLOR')")
    public ResponseEntity<SocietyRegistration> rejectRegistration(
            @PathVariable Long id,
            @Valid @RequestBody ApprovalDto approvalDto,
            Principal principal) {
        
        SocietyRegistration rejected = approvalService.rejectRegistration(id, approvalDto, principal.getName());
        return ResponseEntity.ok(rejected);
    }

    @PostMapping("/approve-event/{id}")
    @PreAuthorize("hasRole('ASSISTANT_REGISTRAR') or hasRole('VICE_CHANCELLOR')")
    public ResponseEntity<EventPermission> approveEvent(
            @PathVariable Long id,
            @Valid @RequestBody ApprovalDto approvalDto,
            Principal principal) {
        
        EventPermission approved = approvalService.approveEvent(id, approvalDto, principal.getName());
        return ResponseEntity.ok(approved);
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<Page<ActivityLog>> getActivityLogs(
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String action,
            Pageable pageable) {
        
        Page<ActivityLog> logs = adminService.getActivityLogs(user, action, pageable);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/societies")
    public ResponseEntity<Page<Object>> getAdminSocieties(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        
        Page<Object> societies = adminService.getAdminSocieties(year, status, pageable);
        return ResponseEntity.ok(societies);
    }

    @PostMapping("/send-email")
    @PreAuthorize("hasRole('ASSISTANT_REGISTRAR') or hasRole('VICE_CHANCELLOR') or hasRole('STUDENT_SERVICE')")
    public ResponseEntity<String> sendBulkEmail(
            @RequestBody Object emailRequest,
            Principal principal) {
        
        adminService.sendBulkEmail(emailRequest, principal.getName());
        return ResponseEntity.ok("Emails sent successfully");
    }
}