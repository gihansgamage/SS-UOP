package lk.ac.pdn.sms.controller;

import lk.ac.pdn.sms.dto.EventPermissionDto;
import lk.ac.pdn.sms.entity.EventPermission;
import lk.ac.pdn.sms.service.EventPermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
public class EventPermissionController {

    private final EventPermissionService eventPermissionService;

    public EventPermissionController(EventPermissionService eventPermissionService) {
        this.eventPermissionService = eventPermissionService;
    }

    @PostMapping("/request")
    public ResponseEntity<EventPermission> requestPermission(@RequestBody EventPermissionDto dto) {
        EventPermission createdEvent = eventPermissionService.requestPermission(dto);
        return ResponseEntity.ok(createdEvent);
    }
}