package lk.ac.pdn.sms.service;

import lk.ac.pdn.sms.dto.SocietyRegistrationDto;
import lk.ac.pdn.sms.dto.SocietyRenewalDto;
import lk.ac.pdn.sms.entity.Society;
import lk.ac.pdn.sms.entity.SocietyRegistration;
import lk.ac.pdn.sms.repository.SocietyRepository;
import lk.ac.pdn.sms.repository.SocietyRegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@Transactional
public class SocietyService {

    @Autowired
    private SocietyRepository societyRepository;

    @Autowired
    private SocietyRegistrationRepository registrationRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ActivityLogService activityLogService;

    public Page<Society> getAllSocieties(String search, String status, Integer year, Pageable pageable) {
        if (search != null && !search.isEmpty()) {
            return societyRepository.findBySearchCriteria(search, status, year, pageable);
        }
        return societyRepository.findByStatusAndYear(status, year, pageable);
    }

    public Society getSocietyById(Long id) {
        return societyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Society not found"));
    }

    public SocietyRegistration registerSociety(SocietyRegistrationDto dto) {
        // Check if society name already exists for current year
        if (societyRepository.existsBySocietyNameAndYear(dto.getSocietyName(), LocalDate.now().getYear())) {
            throw new RuntimeException("Society with this name already exists for current year");
        }

        SocietyRegistration registration = convertToEntity(dto);
        registration = registrationRepository.save(registration);

        // Send confirmation email to applicant
        emailService.sendRegistrationConfirmation(registration);

        // Notify respective dean
        emailService.notifyDeanForApproval(registration);

        // Notify student service division
        emailService.notifyStudentService("New Society Registration", registration.getSocietyName());

        // Log activity
        activityLogService.logActivity("Society Registration Submitted", 
                registration.getSocietyName(), registration.getApplicantFullName());

        return registration;
    }

    public SocietyRegistration renewSociety(SocietyRenewalDto dto) {
        // Verify society exists and is active
        Society existingSociety = societyRepository.findBySocietyNameAndStatus(
                dto.getSocietyName(), Society.SocietyStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("Active society not found"));

        SocietyRegistration renewal = convertRenewalToEntity(dto);
        renewal = registrationRepository.save(renewal);

        // Send confirmation email
        emailService.sendRenewalConfirmation(renewal);

        // Notify respective dean
        emailService.notifyDeanForApproval(renewal);

        // Log activity
        activityLogService.logActivity("Society Renewal Submitted", 
                renewal.getSocietyName(), renewal.getApplicantFullName());

        return renewal;
    }

    public List<Society> getActiveSocieties() {
        return societyRepository.findByStatus(Society.SocietyStatus.ACTIVE);
    }

    public Map<String, Object> getSocietyStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSocieties", societyRepository.count());
        stats.put("activeSocieties", societyRepository.countByStatus(Society.SocietyStatus.ACTIVE));
        stats.put("currentYearRegistrations", registrationRepository.countByYear(LocalDate.now().getYear()));
        return stats;
    }

    private SocietyRegistration convertToEntity(SocietyRegistrationDto dto) {
        SocietyRegistration registration = new SocietyRegistration();
        // Map all fields from DTO to entity
        registration.setApplicantFullName(dto.getApplicantFullName());
        registration.setApplicantRegNo(dto.getApplicantRegNo());
        registration.setApplicantEmail(dto.getApplicantEmail());
        registration.setApplicantFaculty(dto.getApplicantFaculty());
        registration.setApplicantMobile(dto.getApplicantMobile());
        registration.setSocietyName(dto.getSocietyName());
        registration.setAims(dto.getAims());
        registration.setBankAccount(dto.getBankAccount());
        registration.setBankName(dto.getBankName());
        registration.setAgmDate(dto.getAgmDate());
        return registration;
    }

    private SocietyRegistration convertRenewalToEntity(SocietyRenewalDto dto) {
        // Similar conversion for renewal
        SocietyRegistration renewal = new SocietyRegistration();
        // Map fields...
        return renewal;
    }
}