package lk.ac.pdn.sms.service;

import lk.ac.pdn.sms.entity.SocietyRegistration;
import lk.ac.pdn.sms.entity.SocietyRenewal;
import lk.ac.pdn.sms.entity.EventPermission;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class PDFService {

    public byte[] generateRegistrationPDF(SocietyRegistration registration) throws IOException {
        String pdfContent = String.format(
                "UNIVERSITY OF PERADENIYA\nSOCIETY REGISTRATION\n%s",
                registration.getSocietyName());
        return pdfContent.getBytes(StandardCharsets.UTF_8);
    }

    public byte[] generateRenewalPDF(SocietyRenewal renewal) throws IOException {
        String pdfContent = String.format(
                "UNIVERSITY OF PERADENIYA\nSOCIETY RENEWAL\n%s",
                renewal.getSocietyName());
        return pdfContent.getBytes(StandardCharsets.UTF_8);
    }

    public byte[] generateEventPermissionPDF(EventPermission event) throws IOException {
        String pdfContent = String.format(
                "UNIVERSITY OF PERADENIYA\nEVENT PERMISSION\n" +
                        "Event: %s\nSociety: %s\nApplicant: %s\nDate: %s\nTime: %s - %s\nPlace: %s",
                event.getEventName(),
                event.getSocietyName(),
                event.getApplicantName(),
                event.getEventDate(),
                event.getTimeFrom(),
                event.getTimeTo(),
                event.getPlace()
        );

        return pdfContent.getBytes(StandardCharsets.UTF_8);
    }
}