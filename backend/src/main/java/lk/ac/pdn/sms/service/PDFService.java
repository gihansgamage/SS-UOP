package lk.ac.pdn.sms.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.property.TextAlignment;
import lk.ac.pdn.sms.entity.SocietyRegistration;
import lk.ac.pdn.sms.entity.EventPermission;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class PDFService {

    public byte[] generateRegistrationPDF(SocietyRegistration registration) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Header
        document.add(new Paragraph("UNIVERSITY OF PERADENIYA")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(18)
                .setBold());
        
        document.add(new Paragraph("SOCIETY REGISTRATION APPLICATION")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(16)
                .setBold());

        document.add(new Paragraph("\n"));

        // Application Details
        document.add(new Paragraph("APPLICATION DETAILS").setBold());
        
        Table table = new Table(2);
        table.addCell("Application ID:");
        table.addCell(registration.getId().toString());
        table.addCell("Society Name:");
        table.addCell(registration.getSocietyName());
        table.addCell("Submitted Date:");
        table.addCell(registration.getSubmittedDate().toLocalDate().toString());
        table.addCell("Status:");
        table.addCell(registration.getStatus().toString());

        document.add(table);

        // Applicant Information
        document.add(new Paragraph("\nAPPLICANT INFORMATION").setBold());
        
        Table applicantTable = new Table(2);
        applicantTable.addCell("Full Name:");
        applicantTable.addCell(registration.getApplicantFullName());
        applicantTable.addCell("Registration Number:");
        applicantTable.addCell(registration.getApplicantRegNo());
        applicantTable.addCell("Email:");
        applicantTable.addCell(registration.getApplicantEmail());
        applicantTable.addCell("Faculty:");
        applicantTable.addCell(registration.getApplicantFaculty());
        applicantTable.addCell("Mobile:");
        applicantTable.addCell(registration.getApplicantMobile());

        document.add(applicantTable);

        // Society Information
        document.add(new Paragraph("\nSOCIETY INFORMATION").setBold());
        document.add(new Paragraph("Aims and Objectives:"));
        document.add(new Paragraph(registration.getAims()));

        // Signature sections
        document.add(new Paragraph("\n\nSIGNATURES").setBold());
        document.add(new Paragraph("\n\nApplicant Signature: ____________________    Date: ____________________"));
        document.add(new Paragraph("\n\nSenior Treasurer Signature: ____________________    Date: ____________________"));
        
        // Approval sections
        document.add(new Paragraph("\n\nAPPROVAL SECTION").setBold());
        document.add(new Paragraph("\nFaculty Dean Approval: ____________________    Date: ____________________"));
        document.add(new Paragraph("\nAssistant Registrar Approval: ____________________    Date: ____________________"));
        document.add(new Paragraph("\nVice Chancellor Approval: ____________________    Date: ____________________"));

        document.close();
        return baos.toByteArray();
    }

    public byte[] generateRenewalPDF(SocietyRenewal renewal) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Header
        document.add(new Paragraph("UNIVERSITY OF PERADENIYA")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(18)
                .setBold());
        
        document.add(new Paragraph("SOCIETY RENEWAL APPLICATION")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(16)
                .setBold());

        document.add(new Paragraph("\n"));

        // Application Details
        document.add(new Paragraph("RENEWAL APPLICATION DETAILS").setBold());
        
        Table table = new Table(2);
        table.addCell("Application ID:");
        table.addCell(renewal.getId().toString());
        table.addCell("Society Name:");
        table.addCell(renewal.getSocietyName());
        table.addCell("Academic Year:");
        table.addCell(renewal.getYear().toString());
        table.addCell("Submitted Date:");
        table.addCell(renewal.getSubmittedDate().toLocalDate().toString());
        table.addCell("Status:");
        table.addCell(renewal.getStatus().toString());

        document.add(table);

        // Applicant Information
        document.add(new Paragraph("\nAPPLICANT INFORMATION").setBold());
        
        Table applicantTable = new Table(2);
        applicantTable.addCell("Full Name:");
        applicantTable.addCell(renewal.getApplicantFullName());
        applicantTable.addCell("Registration Number:");
        applicantTable.addCell(renewal.getApplicantRegNo());
        applicantTable.addCell("Email:");
        applicantTable.addCell(renewal.getApplicantEmail());
        applicantTable.addCell("Faculty:");
        applicantTable.addCell(renewal.getApplicantFaculty());
        applicantTable.addCell("Mobile:");
        applicantTable.addCell(renewal.getApplicantMobile());

        document.add(applicantTable);

        // Bank Information
        document.add(new Paragraph("\nBANK INFORMATION").setBold());
        
        Table bankTable = new Table(2);
        bankTable.addCell("Bank Account:");
        bankTable.addCell(renewal.getBankAccount());
        bankTable.addCell("Bank Name:");
        bankTable.addCell(renewal.getBankName());
        bankTable.addCell("AGM Date:");
        bankTable.addCell(renewal.getAgmDate().toString());

        document.add(bankTable);

        // Difficulties
        document.add(new Paragraph("\nDIFFICULTIES FACED").setBold());
        document.add(new Paragraph(renewal.getDifficulties()));

        // Website
        if (renewal.getWebsite() != null && !renewal.getWebsite().isEmpty()) {
            document.add(new Paragraph("\nWEBSITE").setBold());
            document.add(new Paragraph(renewal.getWebsite()));
        }

        // Signature sections
        document.add(new Paragraph("\n\nSIGNATURES").setBold());
        document.add(new Paragraph("\n\nApplicant Signature: ____________________    Date: ____________________"));
        document.add(new Paragraph("\n\nSenior Treasurer Signature: ____________________    Date: ____________________"));
        
        // Approval sections
        document.add(new Paragraph("\n\nRENEWAL APPROVAL SECTION").setBold());
        document.add(new Paragraph("\nFaculty Dean Approval: ____________________    Date: ____________________"));
        document.add(new Paragraph("\nAssistant Registrar Approval: ____________________    Date: ____________________"));
        document.add(new Paragraph("\nVice Chancellor Approval: ____________________    Date: ____________________"));

        // Footer
        document.add(new Paragraph("\n\nThis is an official document of the University of Peradeniya")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(10));

        document.close();
        return baos.toByteArray();
    }

    public byte[] generateEventPermissionPDF(EventPermission event) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Header
        document.add(new Paragraph("UNIVERSITY OF PERADENIYA")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(18)
                .setBold());
        
        document.add(new Paragraph("EVENT PERMISSION REQUEST")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(16)
                .setBold());

        // Event details implementation...
        
        document.close();
        return baos.toByteArray();
    }
}