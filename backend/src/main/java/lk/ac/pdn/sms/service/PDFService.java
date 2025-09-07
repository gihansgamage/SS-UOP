package lk.ac.pdn.sms.service;

import lk.ac.pdn.sms.entity.SocietyRegistration;
import lk.ac.pdn.sms.entity.SocietyRenewal;
import lk.ac.pdn.sms.entity.SocietyRenewal;
import lk.ac.pdn.sms.entity.EventPermission;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class PDFService {

    public byte[] generateRegistrationPDF(SocietyRegistration registration) throws IOException {
        // Temporary implementation - will be replaced with proper PDF generation
        String pdfContent = String.format(
                "UNIVERSITY OF PERADENIYA\n" +
                        "SOCIETY REGISTRATION APPLICATION\n\n" +
                        "Application ID: %s\n" +
                        "Society Name: %s\n" +
                        "Applicant: %s (%s)\n" +
                        "Faculty: %s\n" +
                        "Submitted: %s\n" +
                        "Status: %s\n\n" +
                        "This is a temporary PDF implementation. " +
                        "Full PDF generation will be implemented with proper iText integration.",
                registration.getId(),
                registration.getSocietyName(),
                registration.getApplicantFullName(),
                registration.getApplicantRegNo(),
                registration.getApplicantFaculty(),
                registration.getSubmittedDate().toLocalDate(),
                registration.getStatus()
        );

        return pdfContent.getBytes(StandardCharsets.UTF_8);
    }

    public byte[] generateRenewalPDF(SocietyRenewal renewal) throws IOException {
        // Temporary implementation - will be replaced with proper PDF generation
        String pdfContent = String.format(
                "UNIVERSITY OF PERADENIYA\n" +
                        "SOCIETY RENEWAL APPLICATION\n\n" +
                        "Application ID: %s\n" +
                        "Society Name: %s\n" +
                        "Applicant: %s (%s)\n" +
                        "Faculty: %s\n" +
                        "Academic Year: %d\n" +
                        "Submitted: %s\n" +
                        "Status: %s\n\n" +
                        "Bank Account: %s\n" +
                        "Bank Name: %s\n" +
                        "AGM Date: %s\n\n" +
                        "Difficulties: %s\n\n" +
                        "This is a temporary PDF implementation. " +
                        "Full PDF generation will be implemented with proper iText integration.",
                renewal.getId(),
                renewal.getSocietyName(),
                renewal.getApplicantFullName(),
                renewal.getApplicantRegNo(),
                renewal.getApplicantFaculty(),
                renewal.getYear(),
                renewal.getSubmittedDate().toLocalDate(),
                renewal.getStatus(),
                renewal.getBankAccount(),
                renewal.getBankName(),
                renewal.getAgmDate(),
                renewal.getDifficulties()
        );

        return pdfContent.getBytes(StandardCharsets.UTF_8);
    }

    public byte[] generateEventPermissionPDF(EventPermission event) throws IOException {
        // Temporary implementation - will be replaced with proper PDF generation
        String pdfContent = String.format(
                "UNIVERSITY OF PERADENIYA\n" +
                        "EVENT PERMISSION REQUEST\n\n" +
                        "Event Name: %s\n" +
                        "Society: %s\n" +
                        "Applicant: %s (%s)\n" +
                        "Date: %s\n" +
                        "Time: %s - %s\n" +
                        "Place: %s\n" +
                        "Status: %s\n\n" +
                        "This is a temporary PDF implementation. " +
                        "Full PDF generation will be implemented with proper iText integration.",
                event.getEventName(),
                event.getSocietyName(),
                event.getApplicantName(),
                event.getApplicantRegNo(),
                event.getEventDate(),
                event.getTimeFrom(),
                event.getTimeTo(),
                event.getPlace(),
                event.getStatus()
        );

        return pdfContent.getBytes(StandardCharsets.UTF_8);
    }
}