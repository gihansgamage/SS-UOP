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
        // Convert String status to Enum safely
        Society.SocietyStatus statusEnum = null;
        if (status != null && !status.isEmpty() && !status.equalsIgnoreCase("all")) {
            try {
                statusEnum = Society.SocietyStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // If invalid status is passed (or empty), treat as null to show ALL
                statusEnum = null;
            }
        }

        // Use the FIXED custom query
        return societyRepository.searchSocieties(search, statusEnum, year, pageable);
    }

    public SocietyRegistration registerSociety(SocietyRegistrationDto dto) {
        if (societyRepository.findBySocietyName(dto.getSocietyName()).isPresent()) {
            throw new RuntimeException("Society with this name already exists.");
        }

        SocietyRegistration registration = convertToEntity(dto);
        registration = registrationRepository.save(registration);

        emailService.sendRegistrationConfirmation(registration);
        emailService.notifyDeanForApproval(registration);
        activityLogService.logActivity("Registration Submitted", registration.getSocietyName(), registration.getApplicantFullName());

        return registration;
    }

    public SocietyRegistration renewSociety(SocietyRenewalDto dto) {
        throw new RuntimeException("Use RenewalService.submitRenewal() for society renewals");
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
        registration.setApplicantFullName(dto.getApplicantFullName());
        registration.setApplicantRegNo(dto.getApplicantRegNo());
        registration.setApplicantEmail(dto.getApplicantEmail());
        registration.setApplicantFaculty(dto.getApplicantFaculty());
        registration.setApplicantMobile(dto.getApplicantMobile());
        registration.setSocietyName(dto.getSocietyName());
        registration.setAims(dto.getAims());
        registration.setBankAccount(dto.getBankAccount());
        registration.setBankName(dto.getBankName());

        if (dto.getAgmDate() != null) {
            registration.setAgmDate(dto.getAgmDate().toString());
        }

        registration.setSeniorTreasurerTitle(dto.getSeniorTreasurerTitle());
        registration.setSeniorTreasurerFullName(dto.getSeniorTreasurerFullName());
        registration.setSeniorTreasurerDesignation(dto.getSeniorTreasurerDesignation());
        registration.setSeniorTreasurerDepartment(dto.getSeniorTreasurerDepartment());
        registration.setSeniorTreasurerEmail(dto.getSeniorTreasurerEmail());
        registration.setSeniorTreasurerAddress(dto.getSeniorTreasurerAddress());
        registration.setSeniorTreasurerMobile(dto.getSeniorTreasurerMobile());

        return registration;
    }

    public Society getSocietyById(Long id) {
        return societyRepository.findById(id).orElseThrow(() -> new RuntimeException("Society not found"));
    }
}