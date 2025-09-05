package lk.ac.pdn.sms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ApprovalDto {
    
    private String comments;
    
    @NotBlank(message = "Reason is required for rejection")
    private String reason;
    
    private String approverRole;
    private String approverName;
}