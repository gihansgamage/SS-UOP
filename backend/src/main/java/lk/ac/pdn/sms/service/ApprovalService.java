package lk.ac.pdn.sms.service;

import lk.ac.pdn.sms.dto.ApprovalDto;
import lk.ac.pdn.sms.entity.EventPermission;
import lk.ac.pdn.sms.entity.Society;
import lk.ac.pdn.sms.entity.SocietyRegistration;
import lk.ac.pdn.sms.entity.SocietyRenewal;
import lk.ac.pdn.sms.repository.EventPermissionRepository;
import lk.ac.pdn.sms.repository.SocietyRepository;
import lk.ac.pdn.sms.repository.SocietyRegistrationRepository;
import lk.ac.pdn.sms.repository.SocietyRenewalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApprovalService {

    private final SocietyRegistrationRepository registrationRepository;
    private final SocietyRenewalRepository renewalRepository;
    private final EventPermissionRepository eventPermissionRepository;
    private final SocietyRepository societyRepository;

    public ApprovalService(SocietyRegistrationRepository registrationRepository,
                           SocietyRenewalRepository renewalRepository,
                           EventPermissionRepository eventPermissionRepository,
                           SocietyRepository societyRepository) {
        this.registrationRepository = registrationRepository;
        this.renewalRepository = renewalRepository;
        this.eventPermissionRepository = eventPermissionRepository;
        this.societyRepository = societyRepository;
    }

    public List<ApprovalDto> getDeanPendingApprovals(String faculty) {
        List<ApprovalDto> dtos = new ArrayList<>();
        List<SocietyRegistration> registrations = registrationRepository.findByStatusAndApplicantFaculty(
                SocietyRegistration.ApprovalStage.PENDING_DEAN, faculty);
        dtos.addAll(registrations.stream().map(this::mapToDto).collect(Collectors.toList()));

        List<SocietyRenewal> renewals = renewalRepository.findByStatusAndApplicantFaculty(
                SocietyRenewal.RenewalStatus.PENDING_DEAN, faculty);
        dtos.addAll(renewals.stream().map(this::mapToDto).collect(Collectors.toList()));
        return dtos;
    }

    public List<ApprovalDto> getARPendingApprovals() {
        List<ApprovalDto> dtos = new ArrayList<>();
        dtos.addAll(registrationRepository.findByStatus(SocietyRegistration.ApprovalStage.PENDING_AR)
                .stream().map(this::mapToDto).collect(Collectors.toList()));
        dtos.addAll(renewalRepository.findByStatus(SocietyRenewal.RenewalStatus.PENDING_AR)
                .stream().map(this::mapToDto).collect(Collectors.toList()));
        dtos.addAll(eventPermissionRepository.findByStatus(EventPermission.EventStatus.PENDING_AR)
                .stream().map(this::mapToDto).collect(Collectors.toList()));
        return dtos;
    }

    public List<ApprovalDto> getVCPendingApprovals() {
        List<ApprovalDto> dtos = new ArrayList<>();
        dtos.addAll(registrationRepository.findByStatus(SocietyRegistration.ApprovalStage.PENDING_VC)
                .stream().map(this::mapToDto).collect(Collectors.toList()));
        dtos.addAll(renewalRepository.findByStatus(SocietyRenewal.RenewalStatus.PENDING_VC)
                .stream().map(this::mapToDto).collect(Collectors.toList()));
        dtos.addAll(eventPermissionRepository.findByStatus(EventPermission.EventStatus.PENDING_VC)
                .stream().map(this::mapToDto).collect(Collectors.toList()));
        return dtos;
    }

    public List<ApprovalDto> getMonitoringApplications() {
        List<ApprovalDto> dtos = new ArrayList<>();
        dtos.addAll(registrationRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList()));
        dtos.addAll(renewalRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList()));
        dtos.addAll(eventPermissionRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList()));
        return dtos;
    }

    @Transactional
    public void processRegistrationApproval(Long id, ApprovalDto dto) {
        SocietyRegistration reg = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        if (dto.getStatus() != null && dto.getStatus().contains("REJECTED")) {
            reg.setStatus(SocietyRegistration.ApprovalStage.REJECTED);
        } else {
            switch (reg.getStatus()) {
                case PENDING_DEAN:
                    reg.setStatus(SocietyRegistration.ApprovalStage.PENDING_AR);
                    break;
                case PENDING_AR:
                    reg.setStatus(SocietyRegistration.ApprovalStage.PENDING_VC);
                    break;
                case PENDING_VC:
                    reg.setStatus(SocietyRegistration.ApprovalStage.APPROVED);
                    createSocietyFromRegistration(reg);
                    break;
                default:
                    break;
            }
        }
        registrationRepository.save(reg);
    }

    @Transactional
    public void processRenewalApproval(Long id, ApprovalDto dto) {
        SocietyRenewal renewal = renewalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Renewal not found"));

        if (dto.getStatus() != null && dto.getStatus().contains("REJECTED")) {
            renewal.setStatus(SocietyRenewal.RenewalStatus.REJECTED);
        } else {
            switch (renewal.getStatus()) {
                case PENDING_DEAN:
                    renewal.setStatus(SocietyRenewal.RenewalStatus.PENDING_AR);
                    break;
                case PENDING_AR:
                    renewal.setStatus(SocietyRenewal.RenewalStatus.PENDING_VC);
                    break;
                case PENDING_VC:
                    renewal.setStatus(SocietyRenewal.RenewalStatus.APPROVED);
                    break;
                default:
                    break;
            }
        }
        renewalRepository.save(renewal);
    }

    @Transactional
    public void processEventPermissionApproval(Long id, ApprovalDto dto) {
        EventPermission event = eventPermissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event request not found"));

        if (dto.getStatus() != null && dto.getStatus().contains("REJECTED")) {
            event.setStatus(EventPermission.EventStatus.REJECTED);
        } else {
            if (event.getStatus() == EventPermission.EventStatus.PENDING_AR) {
                event.setStatus(EventPermission.EventStatus.PENDING_VC);
            } else if (event.getStatus() == EventPermission.EventStatus.PENDING_VC) {
                event.setStatus(EventPermission.EventStatus.APPROVED);
            }
        }
        eventPermissionRepository.save(event);
    }

    private void createSocietyFromRegistration(SocietyRegistration reg) {
        if (societyRepository.findBySocietyName(reg.getSocietyName()).isPresent()) {
            return;
        }

        Society society = new Society();
        society.setSocietyName(reg.getSocietyName());
        society.setStatus(Society.SocietyStatus.ACTIVE);
        society.setRegisteredDate(LocalDate.now());
        society.setYear(LocalDate.now().getYear());

        societyRepository.save(society);
    }

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