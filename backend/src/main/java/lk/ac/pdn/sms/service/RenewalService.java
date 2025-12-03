package lk.ac.pdn.sms.service;

import lk.ac.pdn.sms.dto.SocietyRenewalDto;
import lk.ac.pdn.sms.dto.ApprovalDto;
import lk.ac.pdn.sms.entity.*;
import lk.ac.pdn.sms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class RenewalService {

    @Autowired
    private SocietyRenewalRepository renewalRepository;

    @Autowired
    private SocietyRepository societyRepository;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private PDFService pdfService;

    public SocietyRenewal submitRenewal(SocietyRenewalDto dto) {
        // FIX: Use findBySocietyName to check existence, ignoring status
        // This allows both Active and Inactive societies to renew
        Society existingSociety = societyRepository.findBySocietyName(dto.getSocietyName())
                .orElseThrow(() -> new RuntimeException("Society not found with name: " + dto.getSocietyName()));

        if (renewalRepository.existsBySocietyNameAndYear(dto.getSocietyName(), LocalDate.now().getYear())) {
            throw new RuntimeException("Renewal already submitted for this society in current year");
        }

        SocietyRenewal renewal = convertToEntity(dto);
        renewal = renewalRepository.save(renewal);

        emailService.sendRenewalConfirmation(renewal);
        emailService.notifyDeanForRenewalApproval(renewal);
        activityLogService.logActivity("Society Renewal Submitted", renewal.getSocietyName(), renewal.getApplicantFullName());

        return renewal;
    }

    // ... (Rest of the file remains the same as previously provided) ...

    public List<SocietyRenewal> getPendingRenewals(String faculty, String status, String userEmail) {
        AdminUser admin = adminUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        if (admin.getRole() == AdminUser.Role.DEAN) {
            return renewalRepository.findByStatusAndApplicantFaculty(
                    SocietyRenewal.RenewalStatus.PENDING_DEAN, admin.getFaculty());
        }

        if (status != null && !status.isEmpty()) {
            SocietyRenewal.RenewalStatus renewalStatus = SocietyRenewal.RenewalStatus.valueOf(status.toUpperCase());
            return renewalRepository.findByStatus(renewalStatus);
        }

        return renewalRepository.findAll();
    }

    public Page<SocietyRenewal> getAllRenewals(Integer year, String status, Pageable pageable) {
        if (year != null) {
            return renewalRepository.findByYear(year, pageable);
        }
        return renewalRepository.findAll(pageable);
    }

    public SocietyRenewal getRenewalById(Long id) {
        return renewalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Renewal not found with id: " + id));
    }

    public SocietyRenewal approveRenewal(Long id, ApprovalDto approvalDto, String userEmail) {
        SocietyRenewal renewal = getRenewalById(id);
        AdminUser admin = adminUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        switch (admin.getRole()) {
            case DEAN:
                if (renewal.getStatus() == SocietyRenewal.RenewalStatus.PENDING_DEAN) {
                    renewal.setIsDeanApproved(true);
                    renewal.setStatus(SocietyRenewal.RenewalStatus.PENDING_AR);
                    emailService.notifyAssistantRegistrarForRenewalApproval(renewal);
                }
                break;

            case ASSISTANT_REGISTRAR:
                if (renewal.getStatus() == SocietyRenewal.RenewalStatus.PENDING_AR) {
                    renewal.setIsArApproved(true);
                    renewal.setStatus(SocietyRenewal.RenewalStatus.PENDING_VC);
                    emailService.notifyViceChancellorForRenewalApproval(renewal);
                }
                break;

            case VICE_CHANCELLOR:
                if (renewal.getStatus() == SocietyRenewal.RenewalStatus.PENDING_VC) {
                    renewal.setIsVcApproved(true);
                    renewal.setStatus(SocietyRenewal.RenewalStatus.APPROVED);
                    renewal.setApprovedDate(LocalDateTime.now());
                    updateSocietyFromRenewal(renewal);
                    emailService.sendRenewalApprovalNotification(renewal);
                }
                break;
            default:
                throw new RuntimeException("Invalid role");
        }

        renewal = renewalRepository.save(renewal);
        activityLogService.logActivity("Renewal Approved", renewal.getSocietyName(), admin.getName());

        return renewal;
    }

    public SocietyRenewal rejectRenewal(Long id, ApprovalDto approvalDto, String userEmail) {
        SocietyRenewal renewal = getRenewalById(id);
        AdminUser admin = adminUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        renewal.setStatus(SocietyRenewal.RenewalStatus.REJECTED);
        renewal.setRejectionReason(approvalDto.getReason());
        renewal = renewalRepository.save(renewal);

        emailService.sendRenewalRejectionNotification(renewal);
        activityLogService.logActivity("Renewal Rejected", renewal.getSocietyName(), admin.getName());

        return renewal;
    }

    public byte[] generateRenewalPDF(Long id) {
        return new byte[0];
    }

    public Map<String, Object> getRenewalStatistics() {
        Map<String, Object> stats = new HashMap<>();
        int currentYear = LocalDate.now().getYear();

        stats.put("totalRenewals", renewalRepository.count());
        stats.put("currentYearRenewals", renewalRepository.countByYear(currentYear));
        stats.put("approvedRenewals", renewalRepository.countByStatus(SocietyRenewal.RenewalStatus.APPROVED));

        return stats;
    }

    private SocietyRenewal convertToEntity(SocietyRenewalDto dto) {
        SocietyRenewal renewal = new SocietyRenewal();
        renewal.setApplicantFullName(dto.getApplicantFullName());
        renewal.setApplicantRegNo(dto.getApplicantRegNo());
        renewal.setApplicantEmail(dto.getApplicantEmail());
        renewal.setApplicantFaculty(dto.getApplicantFaculty());
        renewal.setApplicantMobile(dto.getApplicantMobile());
        renewal.setSocietyName(dto.getSocietyName());
        renewal.setBankAccount(dto.getBankAccount());
        renewal.setBankName(dto.getBankName());

        renewal.setAgmDate(dto.getAgmDate());
        renewal.setDifficulties(dto.getDifficulties());
        renewal.setWebsite(dto.getWebsite());

        renewal.setSeniorTreasurerTitle(dto.getSeniorTreasurerTitle());
        renewal.setSeniorTreasurerFullName(dto.getSeniorTreasurerFullName());
        renewal.setSeniorTreasurerDesignation(dto.getSeniorTreasurerDesignation());
        renewal.setSeniorTreasurerDepartment(dto.getSeniorTreasurerDepartment());
        renewal.setSeniorTreasurerEmail(dto.getSeniorTreasurerEmail());
        renewal.setSeniorTreasurerAddress(dto.getSeniorTreasurerAddress());
        renewal.setSeniorTreasurerMobile(dto.getSeniorTreasurerMobile());

        return renewal;
    }

    private void updateSocietyFromRenewal(SocietyRenewal renewal) {
        Society society = societyRepository.findBySocietyName(renewal.getSocietyName())
                .orElseThrow(() -> new RuntimeException("Society not found"));
        society.setWebsite(renewal.getWebsite());
        society.setYear(renewal.getRenewalYear());
        societyRepository.save(society);
    }
}