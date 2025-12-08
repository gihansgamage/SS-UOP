package lk.ac.pdn.sms.controller;

import lk.ac.pdn.sms.dto.EventPermissionDto;
import lk.ac.pdn.sms.entity.EventPermission;
import lk.ac.pdn.sms.service.EventPermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:5173")
public class EventPermissionController {

    private final EventPermissionService eventPermissionService;

    public EventPermissionController(EventPermissionService eventPermissionService) {
        this.eventPermissionService = eventPermissionService;
    }

    // Public Endpoint for Submission
    @PostMapping("/request")
    public ResponseEntity<EventPermission> requestPermission(@RequestBody @Valid EventPermissionDto dto) {
        EventPermission createdEvent = eventPermissionService.requestPermission(dto);
        return ResponseEntity.ok(createdEvent);
    }

    // Public/Protected Endpoint to View Single Event
    @GetMapping("/{id}")
    public ResponseEntity<EventPermission> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventPermissionService.getEventById(id));
    }

    // --- Admin Endpoints ---

    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('ASSISTANT_REGISTRAR', 'VICE_CHANCELLOR', 'STUDENT_SERVICE')")
    public ResponseEntity<Page<EventPermission>> getAllEvents(
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return ResponseEntity.ok(eventPermissionService.getAllEvents(status, pageable));
    }
}