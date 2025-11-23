package lk.ac.pdn.sms.service;

import lk.ac.pdn.sms.dto.EventPermissionDto;
import lk.ac.pdn.sms.entity.EventPermission;
import lk.ac.pdn.sms.repository.EventPermissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        event.setEventDate(dto.getEventDate());
        event.setTimeFrom(dto.getTimeFrom());
        event.setTimeTo(dto.getTimeTo());
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
        event.setPaymentDate(dto.getPaymentDate());

        // Set Initial Status
        event.setStatus(EventPermission.EventStatus.PENDING_AR);

        EventPermission savedEvent = eventPermissionRepository.save(event);

        // Log Activity (Use "user" as ID for public applicants)
        activityLogService.logActivity(
                "EVENT REQUEST",
                "Event: " + dto.getEventName(),
                "user-" + dto.getApplicantRegNo(), // Fake ID for log
                dto.getApplicantName()
        );

        return savedEvent;
    }
}