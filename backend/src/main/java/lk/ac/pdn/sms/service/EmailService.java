package lk.ac.pdn.sms.service;

import lk.ac.pdn.sms.entity.SocietyRegistration;
import lk.ac.pdn.sms.entity.EventPermission;
import lk.ac.pdn.sms.entity.AdminUser;
import lk.ac.pdn.sms.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Async
    public void sendRegistrationConfirmation(SocietyRegistration registration) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(registration.getApplicantEmail());
        message.setSubject("Society Registration Application Received - University of Peradeniya");
        message.setText(String.format(
                "Dear %s,\n\n" +
                "We have received your society registration application for '%s'.\n\n" +
                "Your application is now under review by the respective faculty dean. " +
                "You will receive email updates as your application progresses through the approval process.\n\n" +
                "Application Details:\n" +
                "- Society Name: %s\n" +
                "- Submitted Date: %s\n" +
                "- Application ID: %s\n\n" +
                "You can track your application status at: %s\n\n" +
                "Best regards,\n" +
                "Student Service Division\n" +
                "University of Peradeniya",
                registration.getApplicantFullName(),
                registration.getSocietyName(),
                registration.getSocietyName(),
                registration.getSubmittedDate().toLocalDate(),
                registration.getId(),
                frontendUrl
        ));

        mailSender.send(message);
    }

    @Async
    public void notifyDeanForApproval(SocietyRegistration registration) {
        List<AdminUser> deans = adminUserRepository.findByRoleAndFaculty(
                AdminUser.Role.DEAN, registration.getApplicantFaculty());

        for (AdminUser dean : deans) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(dean.getEmail());
            message.setSubject("New Society Registration Pending Your Approval");
            message.setText(String.format(
                    "Dear %s,\n\n" +
                    "A new society registration application requires your approval.\n\n" +
                    "Society Details:\n" +
                    "- Society Name: %s\n" +
                    "- Applicant: %s (%s)\n" +
                    "- Faculty: %s\n" +
                    "- Submitted: %s\n\n" +
                    "Please review and approve/reject this application at: %s/admin\n\n" +
                    "Best regards,\n" +
                    "SMS-UOP System",
                    dean.getName(),
                    registration.getSocietyName(),
                    registration.getApplicantFullName(),
                    registration.getApplicantRegNo(),
                    registration.getApplicantFaculty(),
                    registration.getSubmittedDate().toLocalDate(),
                    frontendUrl
            ));

            mailSender.send(message);
        }
    }

    @Async
    public void sendApprovalNotification(SocietyRegistration registration) {
        // Send to applicant
        SimpleMailMessage applicantMessage = new SimpleMailMessage();
        applicantMessage.setTo(registration.getApplicantEmail());
        applicantMessage.setSubject("Congratulations! Society Registration Approved");
        applicantMessage.setText(String.format(
                "Dear %s,\n\n" +
                "Congratulations! Your society registration for '%s' has been approved.\n\n" +
                "Your society is now officially registered with the University of Peradeniya " +
                "and you can begin your activities according to university guidelines.\n\n" +
                "Next Steps:\n" +
                "1. Download your official registration certificate\n" +
                "2. Set up your society bank account if not already done\n" +
                "3. Plan your inaugural activities\n\n" +
                "For any questions, please contact the Student Service Division.\n\n" +
                "Best regards,\n" +
                "Student Service Division\n" +
                "University of Peradeniya",
                registration.getApplicantFullName(),
                registration.getSocietyName()
        ));

        mailSender.send(applicantMessage);

        // Send to all society officials
        // Implementation for sending to president, secretary, senior treasurer...
    }

    @Async
    public void sendRejectionNotification(SocietyRegistration registration) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(registration.getApplicantEmail());
        message.setSubject("Society Registration Application - Action Required");
        message.setText(String.format(
                "Dear %s,\n\n" +
                "We regret to inform you that your society registration application for '%s' " +
                "requires revision.\n\n" +
                "Reason for revision request:\n%s\n\n" +
                "Please address the mentioned concerns and resubmit your application.\n\n" +
                "For clarification, please contact the Student Service Division.\n\n" +
                "Best regards,\n" +
                "Student Service Division\n" +
                "University of Peradeniya",
                registration.getApplicantFullName(),
                registration.getSocietyName(),
                registration.getRejectionReason()
        ));

        mailSender.send(message);
    }

    @Async
    public void notifyStudentService(String subject, String societyName) {
        List<AdminUser> studentServiceAdmins = adminUserRepository.findByRole(AdminUser.Role.STUDENT_SERVICE);

        for (AdminUser admin : studentServiceAdmins) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(admin.getEmail());
            message.setSubject("SMS-UOP Notification: " + subject);
            message.setText(String.format(
                    "Dear %s,\n\n" +
                    "This is an automated notification from the Society Management System.\n\n" +
                    "Activity: %s\n" +
                    "Society: %s\n" +
                    "Time: %s\n\n" +
                    "Please check the admin panel for more details.\n\n" +
                    "Best regards,\n" +
                    "SMS-UOP System",
                    admin.getName(),
                    subject,
                    societyName,
                    LocalDateTime.now()
            ));

            mailSender.send(message);
        }
    }

    // Additional email methods for events, renewals, etc.
    @Async
    public void sendRenewalConfirmation(SocietyRenewal renewal) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(renewal.getApplicantEmail());
        message.setSubject("Society Renewal Application Received - University of Peradeniya");
        message.setText(String.format(
                "Dear %s,\n\n" +
                "We have received your society renewal application for '%s'.\n\n" +
                "Your renewal application is now under review by the respective faculty dean. " +
                "You will receive email updates as your application progresses through the approval process.\n\n" +
                "Renewal Details:\n" +
                "- Society Name: %s\n" +
                "- Submitted Date: %s\n" +
                "- Application ID: %s\n" +
                "- Academic Year: %d\n\n" +
                "You can track your application status at: %s\n\n" +
                "Best regards,\n" +
                "Student Service Division\n" +
                "University of Peradeniya",
                renewal.getApplicantFullName(),
                renewal.getSocietyName(),
                renewal.getSocietyName(),
                renewal.getSubmittedDate().toLocalDate(),
                renewal.getId(),
                renewal.getYear(),
                frontendUrl
        ));

        mailSender.send(message);
    }

    @Async
    public void notifyDeanForRenewalApproval(SocietyRenewal renewal) {
        List<AdminUser> deans = adminUserRepository.findByRoleAndFaculty(
                AdminUser.Role.DEAN, renewal.getApplicantFaculty());

        for (AdminUser dean : deans) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(dean.getEmail());
            message.setSubject("Society Renewal Application Pending Your Approval");
            message.setText(String.format(
                    "Dear %s,\n\n" +
                    "A society renewal application requires your approval.\n\n" +
                    "Society Details:\n" +
                    "- Society Name: %s\n" +
                    "- Applicant: %s (%s)\n" +
                    "- Faculty: %s\n" +
                    "- Academic Year: %d\n" +
                    "- Submitted: %s\n\n" +
                    "Please review and approve/reject this renewal application at: %s/admin\n\n" +
                    "Best regards,\n" +
                    "SMS-UOP System",
                    dean.getName(),
                    renewal.getSocietyName(),
                    renewal.getApplicantFullName(),
                    renewal.getApplicantRegNo(),
                    renewal.getApplicantFaculty(),
                    renewal.getYear(),
                    renewal.getSubmittedDate().toLocalDate(),
                    frontendUrl
            ));

            mailSender.send(message);
        }
    }

    @Async
    public void sendRenewalApprovalNotification(SocietyRenewal renewal) {
        // Send to applicant
        SimpleMailMessage applicantMessage = new SimpleMailMessage();
        applicantMessage.setTo(renewal.getApplicantEmail());
        applicantMessage.setSubject("Congratulations! Society Renewal Approved");
        applicantMessage.setText(String.format(
                "Dear %s,\n\n" +
                "Congratulations! Your society renewal application for '%s' has been approved for the academic year %d.\n\n" +
                "Your society registration has been successfully renewed and you can continue your activities " +
                "according to university guidelines.\n\n" +
                "Renewal Details:\n" +
                "- Society Name: %s\n" +
                "- Academic Year: %d\n" +
                "- Approved Date: %s\n\n" +
                "Next Steps:\n" +
                "1. Download your renewal certificate\n" +
                "2. Update your society records if needed\n" +
                "3. Continue with your planned activities\n\n" +
                "For any questions, please contact the Student Service Division.\n\n" +
                "Best regards,\n" +
                "Student Service Division\n" +
                "University of Peradeniya",
                renewal.getApplicantFullName(),
                renewal.getSocietyName(),
                renewal.getYear(),
                renewal.getSocietyName(),
                renewal.getYear(),
                renewal.getApprovedDate().toLocalDate()
        ));

        mailSender.send(applicantMessage);
    }

    @Async
    public void sendRenewalRejectionNotification(SocietyRenewal renewal) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(renewal.getApplicantEmail());
        message.setSubject("Society Renewal Application - Action Required");
        message.setText(String.format(
                "Dear %s,\n\n" +
                "We regret to inform you that your society renewal application for '%s' " +
                "requires revision.\n\n" +
                "Reason for revision request:\n%s\n\n" +
                "Please address the mentioned concerns and resubmit your renewal application.\n\n" +
                "For clarification, please contact the Student Service Division.\n\n" +
                "Best regards,\n" +
                "Student Service Division\n" +
                "University of Peradeniya",
                renewal.getApplicantFullName(),
                renewal.getSocietyName(),
                renewal.getRejectionReason()
        ));

        mailSender.send(message);
    }

    @Async
    public void notifyAssistantRegistrarForRenewalApproval(SocietyRenewal renewal) {
        List<AdminUser> assistantRegistrars = adminUserRepository.findByRole(AdminUser.Role.ASSISTANT_REGISTRAR);

        for (AdminUser ar : assistantRegistrars) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(ar.getEmail());
            message.setSubject("Society Renewal Application Pending Your Approval");
            message.setText(String.format(
                    "Dear %s,\n\n" +
                    "A society renewal application has been approved by the faculty dean and now requires your approval.\n\n" +
                    "Society Details:\n" +
                    "- Society Name: %s\n" +
                    "- Applicant: %s (%s)\n" +
                    "- Faculty: %s\n" +
                    "- Academic Year: %d\n\n" +
                    "Please review and approve/reject this renewal application at: %s/admin\n\n" +
                    "Best regards,\n" +
                    "SMS-UOP System",
                    ar.getName(),
                    renewal.getSocietyName(),
                    renewal.getApplicantFullName(),
                    renewal.getApplicantRegNo(),
                    renewal.getApplicantFaculty(),
                    renewal.getYear(),
                    frontendUrl
            ));

            mailSender.send(message);
        }
    }

    @Async
    public void notifyViceChancellorForRenewalApproval(SocietyRenewal renewal) {
        List<AdminUser> viceChancellors = adminUserRepository.findByRole(AdminUser.Role.VICE_CHANCELLOR);

        for (AdminUser vc : viceChancellors) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(vc.getEmail());
            message.setSubject("Society Renewal Application - Final Approval Required");
            message.setText(String.format(
                    "Dear %s,\n\n" +
                    "A society renewal application has been approved by the faculty dean and assistant registrar, " +
                    "and now requires your final approval.\n\n" +
                    "Society Details:\n" +
                    "- Society Name: %s\n" +
                    "- Applicant: %s (%s)\n" +
                    "- Faculty: %s\n" +
                    "- Academic Year: %d\n\n" +
                    "Please review and provide final approval at: %s/admin\n\n" +
                    "Best regards,\n" +
                    "SMS-UOP System",
                    vc.getName(),
                    renewal.getSocietyName(),
                    renewal.getApplicantFullName(),
                    renewal.getApplicantRegNo(),
                    renewal.getApplicantFaculty(),
                    renewal.getYear(),
                    frontendUrl
            ));

            mailSender.send(message);
        }
    }

    @Async
    public void sendEventApprovalNotification(EventPermission event) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(event.getApplicantEmail());
        message.setSubject("Event Permission Approved - University of Peradeniya");
        message.setText(String.format(
                "Dear %s,\n\n" +
                "Congratulations! Your event permission request for '%s' has been approved.\n\n" +
                "Event Details:\n" +
                "- Event Name: %s\n" +
                "- Date: %s\n" +
                "- Time: %s - %s\n" +
                "- Place: %s\n\n" +
                "You can now proceed with organizing your event according to university guidelines.\n\n" +
                "Best regards,\n" +
                "Student Service Division\n" +
                "University of Peradeniya",
                event.getApplicantName(),
                event.getEventName(),
                event.getEventName(),
                event.getEventDate(),
                event.getTimeFrom(),
                event.getTimeTo(),
                event.getPlace()
        ));

        mailSender.send(message);
    }

    @Async
    public void sendEventPermissionConfirmation(EventPermission event) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(event.getApplicantEmail());
        message.setSubject("Event Permission Application Received - University of Peradeniya");
        message.setText(String.format(
                "Dear %s,\n\n" +
                "We have received your event permission application for '%s'.\n\n" +
                "Event Details:\n" +
                "- Event Name: %s\n" +
                "- Date: %s\n" +
                "- Society: %s\n" +
                "- Submitted: %s\n\n" +
                "Your application is now under review by the Assistant Registrar. " +
                "You will receive email updates as your application progresses.\n\n" +
                "Best regards,\n" +
                "Student Service Division\n" +
                "University of Peradeniya",
                event.getApplicantName(),
                event.getEventName(),
                event.getEventName(),
                event.getEventDate(),
                event.getSocietyName(),
                event.getSubmittedDate().toLocalDate()
        ));

        mailSender.send(message);
    }

    @Async
    public void sendEventRejectionNotification(EventPermission event) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(event.getApplicantEmail());
        message.setSubject("Event Permission Application - Action Required");
        message.setText(String.format(
                "Dear %s,\n\n" +
                "We regret to inform you that your event permission application for '%s' " +
                "requires revision.\n\n" +
                "Event Details:\n" +
                "- Event Name: %s\n" +
                "- Date: %s\n" +
                "- Society: %s\n\n" +
                "Reason for revision request:\n%s\n\n" +
                "Please address the mentioned concerns and resubmit your application.\n\n" +
                "For clarification, please contact the Student Service Division.\n\n" +
                "Best regards,\n" +
                "Student Service Division\n" +
                "University of Peradeniya",
                event.getApplicantName(),
                event.getEventName(),
                event.getEventName(),
                event.getEventDate(),
                event.getSocietyName(),
                event.getRejectionReason()
        ));

        mailSender.send(message);
    }

    @Async
    public void notifyAssistantRegistrarForEventApproval(EventPermission event) {
        List<AdminUser> assistantRegistrars = adminUserRepository.findByRole(AdminUser.Role.ASSISTANT_REGISTRAR);

        for (AdminUser ar : assistantRegistrars) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(ar.getEmail());
            message.setSubject("New Event Permission Application Pending Your Approval");
            message.setText(String.format(
                    "Dear %s,\n\n" +
                    "A new event permission application requires your approval.\n\n" +
                    "Event Details:\n" +
                    "- Event Name: %s\n" +
                    "- Society: %s\n" +
                    "- Applicant: %s (%s) - %s\n" +
                    "- Date: %s\n" +
                    "- Place: %s\n\n" +
                    "Please review and approve/reject this application at: %s/admin\n\n" +
                    "Best regards,\n" +
                    "SMS-UOP System",
                    ar.getName(),
                    event.getEventName(),
                    event.getSocietyName(),
                    event.getApplicantName(),
                    event.getApplicantRegNo(),
                    event.getApplicantEmail(),
                    event.getEventDate(),
                    event.getPlace(),
                    frontendUrl
            ));

            mailSender.send(message);
        }
    }

    @Async
    public void notifyViceChancellorForApproval(SocietyRegistration registration) {
        // Implementation for VC notification
    }

    @Async
    public void notifyAssistantRegistrarForApproval(SocietyRegistration registration) {
        // Implementation for AR notification
    }

    @Async
    public void notifyViceChancellorForEventApproval(EventPermission event) {
        List<AdminUser> viceChancellors = adminUserRepository.findByRole(AdminUser.Role.VICE_CHANCELLOR);

        for (AdminUser vc : viceChancellors) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(vc.getEmail());
            message.setSubject("Event Permission Application - Final Approval Required");
            message.setText(String.format(
                    "Dear %s,\n\n" +
                    "An event permission application has been approved by the Assistant Registrar " +
                    "and now requires your final approval.\n\n" +
                    "Event Details:\n" +
                    "- Event Name: %s\n" +
                    "- Society: %s\n" +
                    "- Applicant: %s (%s) - %s\n" +
                    "- Date: %s\n" +
                    "- Place: %s\n" +
                    "- Budget: %s\n\n" +
                    "Please review and provide final approval at: %s/admin\n\n" +
                    "Best regards,\n" +
                    "SMS-UOP System",
                    vc.getName(),
                    event.getEventName(),
                    event.getSocietyName(),
                    event.getApplicantName(),
                    event.getApplicantRegNo(),
                    event.getApplicantEmail(),
                    event.getEventDate(),
                    event.getPlace(),
                    event.getBudgetEstimate(),
                    frontendUrl
            ));

            mailSender.send(message);
        }
    }
}