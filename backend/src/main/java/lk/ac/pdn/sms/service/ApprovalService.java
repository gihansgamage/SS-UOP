package lk.ac.pdn.sms.service;

import lk.ac.pdn.sms.dto.ApprovalDto;
import lk.ac.pdn.sms.entity.EventPermission;
import lk.ac.pdn.sms.entity.SocietyRegistration;
import lk.ac.pdn.sms.entity.SocietyRenewal;
import lk.ac.pdn.sms.repository.EventPermissionRepository;
import lk.ac.pdn.sms.repository.SocietyRegistrationRepository;
import lk.ac.pdn.sms.repository.SocietyRenewalRepository;
import org.springframework.stereotype.Service;
import lombok.Builder;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;




@Service
public class ApprovalService {

    private final SocietyRegistrationRepository registrationRepository;
    private final SocietyRenewalRepository renewalRepository;
    private final EventPermissionRepository eventPermissionRepository;

    public ApprovalService(SocietyRegistrationRepository registrationRepository,
                           SocietyRenewalRepository renewalRepository,
                           EventPermissionRepository eventPermissionRepository) {
        this.registrationRepository = registrationRepository;
        this.renewalRepository = renewalRepository;
        this.eventPermissionRepository = eventPermissionRepository;
    }

    // --- DEAN APPROVALS (Status: PENDING_DEAN) ---
    public List<ApprovalDto> getDeanPendingApprovals(String faculty) {
        List<ApprovalDto> dtos = new ArrayList<>();

        // 1. Registrations
        List<SocietyRegistration> registrations = registrationRepository.findByStatusAndApplicantFaculty(
                SocietyRegistration.ApprovalStage.PENDING_DEAN, faculty);
        dtos.addAll(registrations.stream().map(this::mapToDto).collect(Collectors.toList()));

        // 2. Renewals
        List<SocietyRenewal> renewals = renewalRepository.findByStatusAndApplicantFaculty(
                SocietyRenewal.RenewalStatus.PENDING_DEAN, faculty);
        dtos.addAll(renewals.stream().map(this::mapToDto).collect(Collectors.toList()));

        return dtos;
    }

    // --- ASSISTANT REGISTRAR APPROVALS (Status: PENDING_AR) ---
    public List<ApprovalDto> getARPendingApprovals() {
        List<ApprovalDto> dtos = new ArrayList<>();

        // Registrations
        dtos.addAll(registrationRepository.findByStatus(SocietyRegistration.ApprovalStage.PENDING_AR)
                .stream().map(this::mapToDto).collect(Collectors.toList()));

        // Renewals
        dtos.addAll(renewalRepository.findByStatus(SocietyRenewal.RenewalStatus.PENDING_AR)
                .stream().map(this::mapToDto).collect(Collectors.toList()));

        // Events
        dtos.addAll(eventPermissionRepository.findByStatus(EventPermission.EventStatus.PENDING_AR)
                .stream().map(this::mapToDto).collect(Collectors.toList()));

        return dtos;
    }

    // --- VICE CHANCELLOR APPROVALS (Status: PENDING_VC) ---
    public List<ApprovalDto> getVCPendingApprovals() {
        List<ApprovalDto> dtos = new ArrayList<>();

        // Registrations
        dtos.addAll(registrationRepository.findByStatus(SocietyRegistration.ApprovalStage.PENDING_VC)
                .stream().map(this::mapToDto).collect(Collectors.toList()));

        // Renewals
        dtos.addAll(renewalRepository.findByStatus(SocietyRenewal.RenewalStatus.PENDING_VC)
                .stream().map(this::mapToDto).collect(Collectors.toList()));

        // Events
        dtos.addAll(eventPermissionRepository.findByStatus(EventPermission.EventStatus.PENDING_VC)
                .stream().map(this::mapToDto).collect(Collectors.toList()));

        return dtos;
    }

    // --- MONITORING (ALL APPLICATIONS) ---
    public List<ApprovalDto> getMonitoringApplications() {
        List<ApprovalDto> dtos = new ArrayList<>();
        dtos.addAll(registrationRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList()));
        dtos.addAll(renewalRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList()));
        dtos.addAll(eventPermissionRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList()));
        return dtos;
    }

    // --- MAPPERS (Entity -> DTO) ---

    private ApprovalDto mapToDto(SocietyRegistration reg) {
        return ApprovalDto.builder()
                .id(reg.getId())
                .type("registration")
                .societyName(reg.getSocietyName())
                .applicantName(reg.getApplicantFullName())
                .faculty(reg.getApplicantFaculty())
                .submittedDate(reg.getSubmittedDate())
                .status(reg.getStatus().name())
                .build();
    }

    private ApprovalDto mapToDto(SocietyRenewal ren) {
        return ApprovalDto.builder()
                .id(ren.getId())
                .type("renewal")
                .societyName(ren.getSocietyName())
                .applicantName(ren.getApplicantFullName())
                .faculty(ren.getApplicantFaculty())
                .submittedDate(ren.getSubmittedDate())
                .status(ren.getStatus().name())
                .build();
    }

    private ApprovalDto mapToDto(EventPermission evt) {
        return ApprovalDto.builder()
                .id(evt.getId())
                .type("event")
                .societyName(evt.getSocietyName())
                .eventName(evt.getEventName())
                .applicantName(evt.getApplicantName())
                .submittedDate(evt.getSubmittedDate())
                .status(evt.getStatus().name())
                .build();
    }
}