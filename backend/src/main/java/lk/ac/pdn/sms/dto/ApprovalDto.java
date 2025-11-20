package lk.ac.pdn.sms.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApprovalDto {

    @NotNull(message = "Application ID is required")
    private Long applicationId;

    @NotNull(message = "Action is required")
    private ApprovalAction action;

    private String rejectionReason; // Only required if action is REJECT

    public enum ApprovalAction {
        APPROVE, REJECT
    }
}