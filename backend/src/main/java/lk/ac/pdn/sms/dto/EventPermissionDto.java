package lk.ac.pdn.sms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Future;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class EventPermissionDto {
    
    @NotBlank(message = "Society name is required")
    private String societyName;
    
    @NotBlank(message = "Applicant name is required")
    private String applicantName;
    
    @NotBlank(message = "Applicant registration number is required")
    private String applicantRegNo;
    
    @Email(message = "Valid applicant email is required")
    @NotBlank(message = "Applicant email is required")
    private String applicantEmail;
    
    @NotBlank(message = "Applicant position is required")
    private String applicantPosition;
    
    @NotBlank(message = "Applicant mobile number is required")
    @Pattern(regexp = "^(\\+94|0)?[7][0-9]{8}$", message = "Invalid mobile number format")
    private String applicantMobile;
    
    @NotBlank(message = "Event name is required")
    private String eventName;
    
    @NotNull(message = "Event date is required")
    @Future(message = "Event date must be in the future")
    private LocalDate eventDate;
    
    @NotNull(message = "Start time is required")
    private LocalTime timeFrom;
    
    @NotNull(message = "End time is required")
    private LocalTime timeTo;
    
    @NotBlank(message = "Event place is required")
    private String place;
    
    @NotNull(message = "Inside university flag is required")
    private Boolean isInsideUniversity;
    
    @NotNull(message = "Late pass required flag is required")
    private Boolean latePassRequired;
    
    @NotNull(message = "Outsiders invited flag is required")
    private Boolean outsidersInvited;
    
    private String outsidersList;
    
    @NotNull(message = "First year participation flag is required")
    private Boolean firstYearParticipation;
    
    @NotBlank(message = "Budget estimate is required")
    private String budgetEstimate;
    
    @NotBlank(message = "Fund collection methods are required")
    private String fundCollectionMethods;
    
    private String studentFeeAmount;
    
    @NotBlank(message = "Senior treasurer name is required")
    private String seniorTreasurerName;
    
    @NotBlank(message = "Senior treasurer department is required")
    private String seniorTreasurerDepartment;
    
    @NotBlank(message = "Senior treasurer mobile is required")
    @Pattern(regexp = "^(\\+94|0)?[7][0-9]{8}$", message = "Invalid mobile number format")
    private String seniorTreasurerMobile;
    
    @NotBlank(message = "Premises officer name is required")
    private String premisesOfficerName;
    
    @NotBlank(message = "Premises officer designation is required")
    private String premisesOfficerDesignation;
    
    @NotBlank(message = "Premises officer division is required")
    private String premisesOfficerDivision;
    
    private String receiptNumber;
    private LocalDate paymentDate;
}