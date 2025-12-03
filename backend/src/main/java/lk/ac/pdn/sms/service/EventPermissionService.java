package lk.ac.pdn.sms.service;

import lk.ac.pdn.sms.dto.EventPermissionDto;
import lk.ac.pdn.sms.entity.EventPermission;
import lk.ac.pdn.sms.repository.EventPermissionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime; // Make sure this is imported
import java.time.LocalTime;

@Service
@Transactional
public class EventPermissionService {

    private final EventPermissionRepository eventPermissionRepository;
    private final ActivityLogService activityLogService;

    public EventPermissionService(EventPermissionRepository eventPermissionRepository, ActivityLogService activityLogService) {
        this.eventPermissionRepository = eventPermissionRepository;
        this.activityLogService = activityLogService;
    }

    public EventPermission requestPermission(EventPermissionDto dto) {
        EventPermission event = new EventPermission();

        // Map DTO to Entity
        event.setSocietyName(dto.getSocietyName());
        event.setApplicantName(dto.getApplicantName());
        event.setApplicantRegNo(dto.getApplicantRegNo());
        event.setApplicantEmail(dto.getApplicantEmail());
        event.setApplicantPosition(dto.getApplicantPosition());
        event.setApplicantMobile(dto.getApplicantMobile());

        event.setEventName(dto.getEventName());

        // Handle Dates and Times
        if (dto.getEventDate() != null) {
            event.setEventDate(LocalDate.parse(dto.getEventDate()));
        }
        if (dto.getTimeFrom() != null) {
            event.setTimeFrom(LocalTime.parse(dto.getTimeFrom()));
        }
        if (dto.getTimeTo() != null) {
            event.setTimeTo(LocalTime.parse(dto.getTimeTo()));
        }

        event.setPlace(dto.getPlace());
        event.setIsInsideUniversity(dto.getIsInsideUniversity());
        event.setLatePassRequired(dto.getLatePassRequired());
        event.setOutsidersInvited(dto.getOutsidersInvited());
        event.setOutsidersList(dto.getOutsidersList());
        event.setFirstYearParticipation(dto.getFirstYearParticipation());

        event.setBudgetEstimate(dto.getBudgetEstimate());
        event.setFundCollectionMethods(dto.getFundCollectionMethods());
        event.setStudentFeeAmount(dto.getStudentFeeAmount());

        event.setSeniorTreasurerName(dto.getSeniorTreasurerName());
        event.setSeniorTreasurerDepartment(dto.getSeniorTreasurerDepartment());
        event.setSeniorTreasurerMobile(dto.getSeniorTreasurerMobile());

        event.setPremisesOfficerName(dto.getPremisesOfficerName());
        event.setPremisesOfficerDesignation(dto.getPremisesOfficerDesignation());
        event.setPremisesOfficerDivision(dto.getPremisesOfficerDivision());

        event.setReceiptNumber(dto.getReceiptNumber());
        if (dto.getPaymentDate() != null && !dto.getPaymentDate().isEmpty()) {
            event.setPaymentDate(LocalDate.parse(dto.getPaymentDate()));
        }

        // Set Initial Status
        event.setStatus(EventPermission.EventStatus.PENDING_AR);

        // --- FIX: Changed LocalDate.now() to LocalDateTime.now() ---
        event.setSubmittedDate(LocalDateTime.now());

        EventPermission savedEvent = eventPermissionRepository.save(event);

        // Log Activity
        activityLogService.logActivity(
                "EVENT REQUEST",
                "Event: " + dto.getEventName(),
                "user-" + dto.getApplicantRegNo(),
                dto.getApplicantName()
        );

        return savedEvent;
    }

    public EventPermission getEventById(Long id) {
        return eventPermissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    public Page<EventPermission> getAllEvents(String status, Pageable pageable) {
        if (status != null && !status.isEmpty()) {
            try {
                EventPermission.EventStatus statusEnum = EventPermission.EventStatus.valueOf(status.toUpperCase());
                return eventPermissionRepository.findByStatus(statusEnum, pageable);
            } catch (IllegalArgumentException e) {
                // If invalid status, fallback to returning all
                return eventPermissionRepository.findAll(pageable);
            }
        }
        return eventPermissionRepository.findAll(pageable);
    }
}