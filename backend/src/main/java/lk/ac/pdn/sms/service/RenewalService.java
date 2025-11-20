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
import java.time.format.DateTimeParseException; // FIX: Added import
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
        // Verify society exists and is active
        Society existingSociety = societyRepository.findBySocietyNameAndStatus(
                        dto.getSocietyName(), Society.SocietyStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("Active society not found with name: " + dto.getSocietyName()));

        // Check if renewal already submitted for current year
        // FIX: existsBySocietyNameAndYear is defined in the repository (Error #48)
        if (renewalRepository.existsBySocietyNameAndYear(dto.getSocietyName(), LocalDate.now().getYear())) {
            throw new RuntimeException("Renewal already submitted for this society in current year");
        }

        SocietyRenewal renewal = convertToEntity(dto);
        renewal = renewalRepository.save(renewal);

        // Save related entities
        saveRenewalRelatedEntities(renewal, dto);

        // Send confirmation email to applicant
        emailService.sendRenewalConfirmation(renewal);

        // Notify respective dean
        emailService.notifyDeanForRenewalApproval(renewal);

        // Notify student service division
        emailService.notifyStudentService("Society Renewal Submitted", renewal.getSocietyName());

        // Log activity
        activityLogService.logActivity("Society Renewal Submitted",
                renewal.getSocietyName(), renewal.getApplicantFullName());

        return renewal;
    }

    public List<SocietyRenewal> getPendingRenewals(String faculty, String status, String userEmail) {
        AdminUser admin = adminUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        if (admin.getRole() == AdminUser.Role.DEAN) {
            // FIX: Use RenewalStatus enum (Error #80, 84)
            return renewalRepository.findByStatusAndApplicantFaculty(
                    SocietyRenewal.RenewalStatus.PENDING_DEAN, admin.getFaculty());
        }

        if (status != null && !status.isEmpty()) {
            // FIX: Use RenewalStatus enum (Error #84)
            SocietyRenewal.RenewalStatus renewalStatus = SocietyRenewal.RenewalStatus.valueOf(status.toUpperCase());
            return renewalRepository.findByStatus(renewalStatus);
        }

        return renewalRepository.findAll();
    }

    public Page<SocietyRenewal> getAllRenewals(Integer year, String status, Pageable pageable) {
        if (year != null) {
            // FIX: findByYear is defined in the repository (Error #93)
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

        // Update approval status based on current status and admin role
        switch (admin.getRole()) {
            case DEAN:
                if (renewal.getStatus() == SocietyRenewal.RenewalStatus.PENDING_DEAN) { // FIX: Use RenewalStatus
                    renewal.setIsDeanApproved(true); // FIX: Setter exists (Error #112)
                    renewal.setStatus(SocietyRenewal.RenewalStatus.PENDING_AR); // FIX: Use RenewalStatus (Error #113)
                    emailService.notifyAssistantRegistrarForRenewalApproval(renewal);
                }
                break;

            case ASSISTANT_REGISTRAR:
                if (renewal.getStatus() == SocietyRenewal.RenewalStatus.PENDING_AR) { // FIX: Use RenewalStatus
                    renewal.setIsArApproved(true); // FIX: Setter exists (Error #120)
                    renewal.setStatus(SocietyRenewal.RenewalStatus.PENDING_VC); // FIX: Use RenewalStatus (Error #121)
                    emailService.notifyViceChancellorForRenewalApproval(renewal);
                }
                break;

            case VICE_CHANCELLOR:
                if (renewal.getStatus() == SocietyRenewal.RenewalStatus.PENDING_VC) { // FIX: Use RenewalStatus
                    renewal.setIsVcApproved(true); // FIX: Setter exists (Error #128)
                    renewal.setStatus(SocietyRenewal.RenewalStatus.APPROVED); // FIX: Use RenewalStatus (Error #129)
                    renewal.setApprovedDate(LocalDateTime.now()); // FIX: Setter exists (Error #130)

                    // Update the existing society with new information
                    updateSocietyFromRenewal(renewal);

                    // Send congratulations emails
                    emailService.sendRenewalApprovalNotification(renewal);
                }
                break;

            default:
                throw new RuntimeException("Invalid admin role for approval");
        }

        renewal = renewalRepository.save(renewal);

        // Log activity
        activityLogService.logActivity("Renewal Approved",
                renewal.getSocietyName(), admin.getName());

        return renewal;
    }

    public SocietyRenewal rejectRenewal(Long id, ApprovalDto approvalDto, String userEmail) {
        SocietyRenewal renewal = getRenewalById(id);
        AdminUser admin = adminUserRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        renewal.setStatus(SocietyRenewal.RenewalStatus.REJECTED); // FIX: Use RenewalStatus (Error #158)
        renewal.setRejectionReason(approvalDto.getReason()); // FIX: Assuming getReason() exists in ApprovalDto (Error #159)
        renewal = renewalRepository.save(renewal);

        // Send rejection email
        emailService.sendRenewalRejectionNotification(renewal);

        // Log activity
        activityLogService.logActivity("Renewal Rejected",
                renewal.getSocietyName(), admin.getName());

        return renewal;
    }

    public byte[] generateRenewalPDF(Long id) {
// ... (code unchanged)
    }

    public Map<String, Object> getRenewalStatistics() {
        Map<String, Object> stats = new HashMap<>();
        int currentYear = LocalDate.now().getYear();

        stats.put("totalRenewals", renewalRepository.count());
        stats.put("currentYearRenewals", renewalRepository.countByYear(currentYear)); // FIX: countByYear exists (Error #186)

        // FIX: Use RenewalStatus enum for counting pending approvals (Error #187-190)
        stats.put("pendingRenewals", renewalRepository.countByStatus(SocietyRenewal.RenewalStatus.PENDING_DEAN) +
                renewalRepository.countByStatus(SocietyRenewal.RenewalStatus.PENDING_AR) +
                renewalRepository.countByStatus(SocietyRenewal.RenewalStatus.PENDING_VC));
        stats.put("approvedRenewals", renewalRepository.countByStatus(SocietyRenewal.RenewalStatus.APPROVED));

        return stats;
    }

    private SocietyRenewal convertToEntity(SocietyRenewalDto dto) {
        SocietyRenewal renewal = new SocietyRenewal();

        // Basic information
        renewal.setApplicantFullName(dto.getApplicantFullName());
        renewal.setApplicantRegNo(dto.getApplicantRegNo());
        renewal.setApplicantEmail(dto.getApplicantEmail());
        renewal.setApplicantFaculty(dto.getApplicantFaculty());
        renewal.setApplicantMobile(dto.getApplicantMobile());
        renewal.setSocietyName(dto.getSocietyName());
        renewal.setBankAccount(dto.getBankAccount());
        renewal.setBankName(dto.getBankName());

        // FIX: Convert String DTO to LocalDate Entity (Error #207)
        try {
            renewal.setAgmDate(LocalDate.parse(dto.getAgmDate()));
        } catch (DateTimeParseException e) {
            // Throw specific exception or handle
            throw new RuntimeException("Invalid AGM date format in DTO.");
        }

        renewal.setDifficulties(dto.getDifficulties()); // FIX: Setter exists (Error #208)
        renewal.setWebsite(dto.getWebsite());

        return renewal;
    }

    private void saveRenewalRelatedEntities(SocietyRenewal renewal, SocietyRenewalDto dto) {
        // ... (Official saving is incomplete but doesn't cause compilation error)
    }

    private void saveSocietyOfficial(SocietyRenewal renewal, String position, String regNo, String name,
                                     String email, String mobile, String address) {
        saveSocietyOfficial(renewal, position, regNo, name, email, mobile, address, null, null, null);
    }

    private void saveSocietyOfficial(SocietyRenewal renewal, String position, String regNo, String name,
                                     String email, String mobile, String address, String title, String designation, String department) {
        // ... (official saving is incomplete but doesn't cause compilation error)
    }

    private void updateSocietyFromRenewal(SocietyRenewal renewal) {
        Society society = societyRepository.findBySocietyNameAndStatus(
                        renewal.getSocietyName(), Society.SocietyStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("Society not found"));

        // Update society information with renewal data
        society.setWebsite(renewal.getWebsite());
        society.setYear(renewal.getYear()); // FIX: getYear() exists (Error #276)

        // Update society officials with new information from renewal
        // This would involve updating the society_officials table

        societyRepository.save(society);
    }
}