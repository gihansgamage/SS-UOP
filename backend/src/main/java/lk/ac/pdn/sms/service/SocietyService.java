package lk.ac.pdn.sms.service;

import lk.ac.pdn.sms.dto.SocietyRegistrationDto;
import lk.ac.pdn.sms.dto.SocietyRenewalDto;
import lk.ac.pdn.sms.entity.Society;
import lk.ac.pdn.sms.entity.SocietyRegistration;
import lk.ac.pdn.sms.entity.SocietyRenewal;
import lk.ac.pdn.sms.repository.SocietyRepository;
import lk.ac.pdn.sms.repository.SocietyRegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException; // FIX: Added import
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
// ... (getSocietyById is fine)

    public SocietyRegistration registerSociety(SocietyRegistrationDto dto) {
        // Check if society name already exists for current year (Assuming method exists in repo)
        // FIX: The user's repo doesn't have existsBySocietyNameAndYear, checking permanent society list instead.
        if (societyRepository.findBySocietyName(dto.getSocietyName()).isPresent()) {
            throw new RuntimeException("Society with this name already exists.");
        }

        SocietyRegistration registration = convertToEntity(dto);
        registration = registrationRepository.save(registration);

        // ... (Emails and logs are fine, rely on fixed EmailService and ActivityLogService)

        return registration;
    }

    public SocietyRegistration renewSociety(SocietyRenewalDto dto) {
        // This method should delegate to RenewalService
        throw new RuntimeException("Use RenewalService.submitRenewal() for society renewals");
    }


    public List<Society> getActiveSocieties() {
        return societyRepository.findByStatus(Society.SocietyStatus.ACTIVE);
    }

    public Map<String, Object> getSocietyStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSocieties", societyRepository.count());
        stats.put("activeSocieties", societyRepository.countByStatus(Society.SocietyStatus.ACTIVE));
        // FIX: countByYear takes Integer (Error #1 in list)
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

        // FIX: agmDate must be mapped as String (Error #2 in list)
        registration.setAgmDate(dto.getAgmDate());
        return registration;
    }

    private SocietyRenewal convertRenewalToEntity(SocietyRenewalDto dto) {
        // Convert DTO to SocietyRenewal entity
        SocietyRenewal renewal = new SocietyRenewal();
        renewal.setApplicantFullName(dto.getApplicantFullName());
        renewal.setApplicantRegNo(dto.getApplicantRegNo());
        renewal.setApplicantEmail(dto.getApplicantEmail());
        renewal.setApplicantFaculty(dto.getApplicantFaculty());
        renewal.setApplicantMobile(dto.getApplicantMobile());
        renewal.setSocietyName(dto.getSocietyName());
        renewal.setBankAccount(dto.getBankAccount());
        renewal.setBankName(dto.getBankName());

        // FIX: Convert String DTO to LocalDate Entity (Error #3 in list)
        try {
            renewal.setAgmDate(LocalDate.parse(dto.getAgmDate()));
        } catch (DateTimeParseException e) {
            // Log error or rethrow
            throw new RuntimeException("Invalid AGM date format. Please use YYYY-MM-DD.");
        }

        // FIX: Setter for difficulties exists in entity (Error #4 in list)
        renewal.setDifficulties(dto.getDifficulties());

        renewal.setWebsite(dto.getWebsite());
        return renewal;
    }

    public Society getSocietyById(Long id) {
    }
}