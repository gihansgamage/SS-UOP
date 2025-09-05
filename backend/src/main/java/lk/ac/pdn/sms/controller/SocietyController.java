package lk.ac.pdn.sms.controller;

import lk.ac.pdn.sms.dto.SocietyRegistrationDto;
import lk.ac.pdn.sms.dto.SocietyRenewalDto;
import lk.ac.pdn.sms.entity.Society;
import lk.ac.pdn.sms.entity.SocietyRegistration;
import lk.ac.pdn.sms.service.SocietyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/societies")
@CrossOrigin(origins = "http://localhost:5173")
public class SocietyController {

    @Autowired
    private SocietyService societyService;

    @GetMapping("/public")
    public ResponseEntity<Page<Society>> getAllSocieties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer year,
            Pageable pageable) {
        
        Page<Society> societies = societyService.getAllSocieties(search, status, year, pageable);
        return ResponseEntity.ok(societies);
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<Society> getSocietyById(@PathVariable Long id) {
        Society society = societyService.getSocietyById(id);
        return ResponseEntity.ok(society);
    }

    @PostMapping("/register")
    public ResponseEntity<SocietyRegistration> registerSociety(@Valid @RequestBody SocietyRegistrationDto registrationDto) {
        SocietyRegistration registration = societyService.registerSociety(registrationDto);
        return ResponseEntity.ok(registration);
    }

    @PostMapping("/renew")
    public ResponseEntity<SocietyRegistration> renewSociety(@Valid @RequestBody SocietyRenewalDto renewalDto) {
        SocietyRegistration renewal = societyService.renewSociety(renewalDto);
        return ResponseEntity.ok(renewal);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Society>> getActiveSocieties() {
        List<Society> societies = societyService.getActiveSocieties();
        return ResponseEntity.ok(societies);
    }

    @GetMapping("/statistics")
    public ResponseEntity<Object> getSocietyStatistics() {
        Object stats = societyService.getSocietyStatistics();
        return ResponseEntity.ok(stats);
    }
}