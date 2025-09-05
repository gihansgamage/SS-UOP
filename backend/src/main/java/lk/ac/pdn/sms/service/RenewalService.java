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
        // Verify society exists and is active
        Society existingSociety = societyRepository.findBySocietyNameAndStatus(
                dto.getSocietyName(), Society.SocietyStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("Active society not found with name: " + dto.getSocietyName()));

        // Check if renewal already submitted for current year
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
        
        // Update approval status based on current status and admin role
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
        
        renewal.setStatus(SocietyRenewal.RenewalStatus.REJECTED);
        renewal.setRejectionReason(approvalDto.getReason());
        renewal = renewalRepository.save(renewal);

        // Send rejection email
        emailService.sendRenewalRejectionNotification(renewal);

        // Log activity
        activityLogService.logActivity("Renewal Rejected", 
                renewal.getSocietyName(), admin.getName());

        return renewal;
    }

    public byte[] generateRenewalPDF(Long id) {
        SocietyRenewal renewal = getRenewalById(id);
        try {
            return pdfService.generateRenewalPDF(renewal);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage());
        }
    }

    public Map<String, Object> getRenewalStatistics() {
        Map<String, Object> stats = new HashMap<>();
        int currentYear = LocalDate.now().getYear();
        
        stats.put("totalRenewals", renewalRepository.count());
        stats.put("currentYearRenewals", renewalRepository.countByYear(currentYear));
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
        renewal.setAgmDate(dto.getAgmDate());
        renewal.setDifficulties(dto.getDifficulties());
        renewal.setWebsite(dto.getWebsite());
        
        return renewal;
    }

    private void saveRenewalRelatedEntities(SocietyRenewal renewal, SocietyRenewalDto dto) {
        // Save advisory board members
        if (dto.getAdvisoryBoard() != null) {
            for (SocietyRenewalDto.AdvisoryBoardMemberDto memberDto : dto.getAdvisoryBoard()) {
                RenewalAdvisoryBoardMember member = new RenewalAdvisoryBoardMember();
                member.setRenewal(renewal);
                member.setName(memberDto.getName());
                member.setDesignation(memberDto.getDesignation());
                member.setDepartment(memberDto.getDepartment());
                // Save member (would need repository)
            }
        }

        // Save society officials
        saveSocietyOfficial(renewal, "PRESIDENT", dto.getPresidentRegNo(), dto.getPresidentName(), 
                           dto.getPresidentEmail(), dto.getPresidentMobile(), dto.getPresidentAddress());
        saveSocietyOfficial(renewal, "VICE_PRESIDENT", dto.getVicePresidentRegNo(), dto.getVicePresidentName(), 
                           dto.getVicePresidentEmail(), dto.getVicePresidentMobile(), dto.getVicePresidentAddress());
        saveSocietyOfficial(renewal, "SECRETARY", dto.getSecretaryRegNo(), dto.getSecretaryName(), 
                           dto.getSecretaryEmail(), dto.getSecretaryMobile(), dto.getSecretaryAddress());
        saveSocietyOfficial(renewal, "JOINT_SECRETARY", dto.getJointSecretaryRegNo(), dto.getJointSecretaryName(), 
                           dto.getJointSecretaryEmail(), dto.getJointSecretaryMobile(), dto.getJointSecretaryAddress());
        saveSocietyOfficial(renewal, "JUNIOR_TREASURER", dto.getJuniorTreasurerRegNo(), dto.getJuniorTreasurerName(), 
                           dto.getJuniorTreasurerEmail(), dto.getJuniorTreasurerMobile(), dto.getJuniorTreasurerAddress());
        saveSocietyOfficial(renewal, "EDITOR", dto.getEditorRegNo(), dto.getEditorName(), 
                           dto.getEditorEmail(), dto.getEditorMobile(), dto.getEditorAddress());
        saveSocietyOfficial(renewal, "SENIOR_TREASURER", null, dto.getSeniorTreasurerFullName(), 
                           dto.getSeniorTreasurerEmail(), dto.getSeniorTreasurerMobile(), dto.getSeniorTreasurerAddress(),
                           dto.getSeniorTreasurerTitle(), dto.getSeniorTreasurerDesignation(), dto.getSeniorTreasurerDepartment());

        // Save committee members, general members, previous activities, and planning events
        // Implementation would continue with proper repository saves...
    }

    private void saveSocietyOfficial(SocietyRenewal renewal, String position, String regNo, String name, 
                                   String email, String mobile, String address) {
        saveSocietyOfficial(renewal, position, regNo, name, email, mobile, address, null, null, null);
    }

    private void saveSocietyOfficial(SocietyRenewal renewal, String position, String regNo, String name, 
                                   String email, String mobile, String address, String title, String designation, String department) {
        RenewalSocietyOfficial official = new RenewalSocietyOfficial();
        official.setRenewal(renewal);
        official.setPosition(RenewalSocietyOfficial.Position.valueOf(position));
        official.setRegNo(regNo);
        official.setName(name);
        official.setEmail(email);
        official.setMobile(mobile);
        official.setAddress(address);
        official.setTitle(title);
        official.setDesignation(designation);
        official.setDepartment(department);
        // Save official (would need repository)
    }

    private void updateSocietyFromRenewal(SocietyRenewal renewal) {
        Society society = societyRepository.findBySocietyNameAndStatus(
                renewal.getSocietyName(), Society.SocietyStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("Society not found"));

        // Update society information with renewal data
        society.setWebsite(renewal.getWebsite());
        society.setYear(renewal.getYear());
        
        // Update society officials with new information from renewal
        // This would involve updating the society_officials table
        
        societyRepository.save(society);
    }
}