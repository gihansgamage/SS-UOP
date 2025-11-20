package lk.ac.pdn.sms.service;

import lk.ac.pdn.sms.entity.SocietyRegistration;
import lk.ac.pdn.sms.entity.SocietyRenewal;
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

    // ==========================================
    // REGISTRATION NOTIFICATIONS
    // ==========================================

    @Async
    public void sendRegistrationConfirmation(SocietyRegistration registration) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(registration.getApplicantEmail());
        message.setSubject("Society Registration Application Received");
        message.setText(String.format(
                "Dear %s,\n\n" +
                        "We have received your application for the registration of '%s'.\n" +
                        "Your application ID is: %d\n\n" +
                        "The application is now pending approval from the Faculty Dean.\n\n" +
                        "Best regards,\n" +
                        "Student Service Division\n" +
                        "University of Peradeniya",
                registration.getApplicantFullName(),
                registration.getSocietyName(),
                registration.getId()
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
            message.setSubject("Action Required: New Society Registration Application");
            message.setText(String.format(
                    "Dear %s,\n\n" +
                            "A new society registration application requires your review.\n\n" +
                            "Society: %s\n" +
                            "Applicant: %s\n" +
                            "Faculty: %s\n\n" +
                            "Please log in to the SMS Admin Panel to review and approve/reject this application.\n\n" +
                            "Best regards,\n" +
                            "SMS System",
                    dean.getName(),
                    registration.getSocietyName(),
                    registration.getApplicantFullName(),
                    registration.getApplicantFaculty()
            ));
            mailSender.send(message);
        }
    }

    @Async
    public void sendRegistrationNotification(SocietyRegistration registration, String status, String adminName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(registration.getApplicantEmail());
        message.setSubject("Society Registration Status Update: " + status);
        message.setText(String.format(
                "Dear %s,\n\n" +
                        "Your society registration application for '%s' has been updated.\n\n" +
                        "Current Status: %s\n" +
                        "Updated By: %s\n\n" +
                        (status.equals("REJECTED") ? "Reason: " + registration.getRejectionReason() + "\n\n" : "") +
                        "Please check the portal for more details.\n\n" +
                        "Best regards,\n" +
                        "Student Service Division",
                registration.getApplicantFullName(),
                registration.getSocietyName(),
                status,
                adminName
        ));
        mailSender.send(message);
    }

    // ==========================================
    // RENEWAL NOTIFICATIONS
    // ==========================================

    @Async
    public void sendRenewalConfirmation(SocietyRenewal renewal) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(renewal.getApplicantEmail());
        message.setSubject("Society Renewal Application Received");
        message.setText(String.format(
                "Dear %s,\n\n" +
                        "We have received your renewal application for '%s' for the academic year %d.\n\n" +
                        "The application is now pending approval from the Faculty Dean.\n\n" +
                        "Best regards,\n" +
                        "Student Service Division",
                renewal.getApplicantFullName(),
                renewal.getSocietyName(),
                renewal.getRenewalYear()
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
            message.setSubject("Action Required: Society Renewal Application");
            message.setText(String.format(
                    "Dear %s,\n\n" +
                            "A society renewal application requires your review.\n\n" +
                            "Society: %s\n" +
                            "Applicant: %s\n" +
                            "Year: %d\n\n" +
                            "Please log in to the SMS Admin Panel to review.\n\n" +
                            "Best regards,\n" +
                            "SMS System",
                    dean.getName(),
                    renewal.getSocietyName(),
                    renewal.getApplicantFullName(),
                    renewal.getRenewalYear()
            ));
            mailSender.send(message);
        }
    }

    @Async
    public void notifyAssistantRegistrarForRenewalApproval(SocietyRenewal renewal) {
        List<AdminUser> ars = adminUserRepository.findByRole(AdminUser.Role.ASSISTANT_REGISTRAR);

        for (AdminUser ar : ars) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(ar.getEmail());
            message.setSubject("Action Required: Society Renewal Pending AR Approval");
            message.setText(String.format(
                    "Dear %s,\n\n" +
                            "The Faculty Dean has approved the renewal for '%s'. It now requires your approval.\n\n" +
                            "Society: %s\n" +
                            "Applicant: %s\n\n" +
                            "Please log in to the SMS Admin Panel to review.\n\n" +
                            "Best regards,\n" +
                            "SMS System",
                    ar.getName(),
                    renewal.getSocietyName(),
                    renewal.getSocietyName(),
                    renewal.getApplicantFullName()
            ));
            mailSender.send(message);
        }
    }

    @Async
    public void notifyViceChancellorForRenewalApproval(SocietyRenewal renewal) {
        List<AdminUser> vcs = adminUserRepository.findByRole(AdminUser.Role.VICE_CHANCELLOR);

        for (AdminUser vc : vcs) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(vc.getEmail());
            message.setSubject("Action Required: Society Renewal Pending VC Approval");
            message.setText(String.format(
                    "Dear %s,\n\n" +
                            "The Assistant Registrar has approved the renewal for '%s'. It now requires your final approval.\n\n" +
                            "Society: %s\n" +
                            "Applicant: %s\n\n" +
                            "Please log in to the SMS Admin Panel to review.\n\n" +
                            "Best regards,\n" +
                            "SMS System",
                    vc.getName(),
                    renewal.getSocietyName(),
                    renewal.getSocietyName(),
                    renewal.getApplicantFullName()
            ));
            mailSender.send(message);
        }
    }

    @Async
    public void sendRenewalApprovalNotification(SocietyRenewal renewal) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(renewal.getApplicantEmail());
        message.setSubject("Congratulations! Society Renewal Approved");
        message.setText(String.format(
                "Dear %s,\n\n" +
                        "We are pleased to inform you that the renewal application for '%s' has been APPROVED by the Vice Chancellor.\n\n" +
                        "Academic Year: %d\n\n" +
                        "You may now continue your society activities.\n\n" +
                        "Best regards,\n" +
                        "Student Service Division",
                renewal.getApplicantFullName(),
                renewal.getSocietyName(),
                renewal.getRenewalYear()
        ));
        mailSender.send(message);
    }

    @Async
    public void sendRenewalRejectionNotification(SocietyRenewal renewal) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(renewal.getApplicantEmail());
        message.setSubject("Society Renewal Application Rejected");
        message.setText(String.format(
                "Dear %s,\n\n" +
                        "We regret to inform you that your renewal application for '%s' has been rejected.\n\n" +
                        "Reason: %s\n\n" +
                        "Please contact the Student Service Division for further clarification.\n\n" +
                        "Best regards,\n" +
                        "Student Service Division",
                renewal.getApplicantFullName(),
                renewal.getSocietyName(),
                renewal.getRejectionReason()
        ));
        mailSender.send(message);
    }

    @Async
    public void sendRenewalNotification(SocietyRenewal renewal, String status, String adminName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(renewal.getApplicantEmail());
        message.setSubject("Society Renewal Status Update: " + status);
        message.setText(String.format(
                "Dear %s,\n\n" +
                        "Your society renewal application status has been updated to: %s by %s.\n\n" +
                        "Society: %s\n\n" +
                        "Best regards,\n" +
                        "SMS System",
                renewal.getApplicantFullName(),
                status,
                adminName,
                renewal.getSocietyName()
        ));
        mailSender.send(message);
    }

    // ==========================================
    // EVENT NOTIFICATIONS
    // ==========================================

    @Async
    public void sendEventPermissionConfirmation(EventPermission event) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(event.getApplicantEmail());
        message.setSubject("Event Permission Request Received");
        message.setText(String.format(
                "Dear %s,\n\n" +
                        "We have received your permission request for the event '%s'.\n" +
                        "Date: %s\n\n" +
                        "The request is pending review by the Assistant Registrar.\n\n" +
                        "Best regards,\n" +
                        "Student Service Division",
                event.getApplicantName(),
                event.getEventName(),
                event.getEventDate()
        ));
        mailSender.send(message);
    }

    @Async
    public void notifyAssistantRegistrarForEventApproval(EventPermission event) {
        List<AdminUser> ars = adminUserRepository.findByRole(AdminUser.Role.ASSISTANT_REGISTRAR);

        for (AdminUser ar : ars) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(ar.getEmail());
            message.setSubject("Action Required: New Event Permission Request");
            message.setText(String.format(
                    "Dear %s,\n\n" +
                            "A new event permission request requires your review.\n\n" +
                            "Event: %s\n" +
                            "Society: %s\n" +
                            "Date: %s\n" +
                            "Place: %s\n\n" +
                            "Please log in to the SMS Admin Panel to review.\n\n" +
                            "Best regards,\n" +
                            "SMS System",
                    ar.getName(),
                    event.getEventName(),
                    event.getSocietyName(),
                    event.getEventDate(),
                    event.getPlace()
            ));
            mailSender.send(message);
        }
    }

    @Async
    public void sendEventApprovalNotification(EventPermission event) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(event.getApplicantEmail());
        message.setSubject("Event Permission Approved");
        message.setText(String.format(
                "Dear %s,\n\n" +
                        "We are pleased to inform you that permission for your event '%s' has been APPROVED.\n\n" +
                        "Date: %s\n" +
                        "Time: %s - %s\n" +
                        "Venue: %s\n\n" +
                        "Please ensure all university guidelines are followed during the event.\n\n" +
                        "Best regards,\n" +
                        "Student Service Division",
                event.getApplicantName(),
                event.getEventName(),
                event.getEventDate(),
                event.getTimeFrom(),
                event.getTimeTo(),
                event.getPlace()
        ));
        mailSender.send(message);
    }

    @Async
    public void sendEventRejectionNotification(EventPermission event) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(event.getApplicantEmail());
        message.setSubject("Event Permission Request Rejected");
        message.setText(String.format(
                "Dear %s,\n\n" +
                        "We regret to inform you that permission for your event '%s' has been rejected.\n\n" +
                        "Reason: %s\n\n" +
                        "Best regards,\n" +
                        "Student Service Division",
                event.getApplicantName(),
                event.getEventName(),
                event.getRejectionReason()
        ));
        mailSender.send(message);
    }

    @Async
    public void sendEventNotification(EventPermission event, String status, String adminName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(event.getApplicantEmail());
        message.setSubject("Event Permission Status Update: " + status);
        message.setText(String.format(
                "Dear %s,\n\n" +
                        "Your event permission request status has been updated to: %s by %s.\n\n" +
                        "Event: %s\n" +
                        "Date: %s\n\n" +
                        "Best regards,\n" +
                        "SMS System",
                event.getApplicantName(),
                status,
                adminName,
                event.getEventName(),
                event.getEventDate()
        ));
        mailSender.send(message);
    }

    // ==========================================
    // GENERAL NOTIFICATIONS
    // ==========================================

    @Async
    public void notifyStudentService(String subject, String societyName) {
        List<AdminUser> admins = adminUserRepository.findByRole(AdminUser.Role.STUDENT_SERVICE);

        for (AdminUser admin : admins) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(admin.getEmail());
            message.setSubject("SMS Notification: " + subject);
            message.setText(String.format(
                    "Dear %s,\n\n" +
                            "System Notification:\n" +
                            "Activity: %s\n" +
                            "Related Society: %s\n\n" +
                            "This is an automated message.",
                    admin.getName(),
                    subject,
                    societyName
            ));
            mailSender.send(message);
        }
    }
}