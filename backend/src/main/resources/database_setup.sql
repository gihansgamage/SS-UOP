-- Society Management System (SMS) - Database Setup Script
-- University of Peradeniya
-- Combined Schema (Base + Renewals + Permissions)

-- 1. Create and Select Database
CREATE DATABASE IF NOT EXISTS sms_uop;
USE sms_uop;

-- ==========================================
-- 2. Core User & System Tables
-- ==========================================

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
                                           id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                           name VARCHAR(255) NOT NULL,
                                           email VARCHAR(255) UNIQUE NOT NULL,
                                           role ENUM('dean', 'assistant_registrar', 'vice_chancellor', 'student_service') NOT NULL,
                                           faculty VARCHAR(255),
                                           is_active BOOLEAN DEFAULT TRUE,
                                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                           INDEX idx_role (role),
                                           INDEX idx_faculty (faculty)
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
                                             id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                             user_id BIGINT NOT NULL, -- Logical link to admin_users or applicant reg_no
                                             user_name VARCHAR(255) NOT NULL,
                                             action VARCHAR(255) NOT NULL,
                                             target VARCHAR(255) NOT NULL,
                                             timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                             INDEX idx_timestamp (timestamp),
                                             INDEX idx_user (user_id)
);

-- Email Notifications Table
CREATE TABLE IF NOT EXISTS email_notifications (
                                                   id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                   recipient_email VARCHAR(255) NOT NULL,
                                                   subject VARCHAR(500) NOT NULL,
                                                   body TEXT NOT NULL,
                                                   sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                   status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
                                                   INDEX idx_status (status),
                                                   INDEX idx_sent_at (sent_at)
);

-- ==========================================
-- 3. Society & Registration Tables
-- ==========================================

-- Societies Table (Approved & Active Societies)
CREATE TABLE IF NOT EXISTS societies (
                                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                         society_name VARCHAR(255) NOT NULL,
                                         registered_date DATE NOT NULL,
                                         status ENUM('active', 'inactive') DEFAULT 'active',
                                         year INT NOT NULL,
                                         website VARCHAR(500),
    -- Essential fields often needed for display
                                         aims TEXT,
                                         bank_account VARCHAR(100),
                                         bank_name VARCHAR(255),
                                         agm_date VARCHAR(255), -- Stored as string or date depending on flexibility needed
                                         primary_faculty VARCHAR(255),
                                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                         UNIQUE KEY unique_society_year (society_name, year),
                                         INDEX idx_year (year),
                                         INDEX idx_status (status)
);

-- Society Officials (For Active Societies)
CREATE TABLE IF NOT EXISTS society_officials (
                                                 id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                 society_id BIGINT NOT NULL,
                                                 position ENUM('president', 'vice_president', 'secretary', 'joint_secretary', 'junior_treasurer', 'editor', 'senior_treasurer') NOT NULL,
                                                 reg_no VARCHAR(50),
                                                 name VARCHAR(255) NOT NULL,
                                                 email VARCHAR(255) NOT NULL,
                                                 mobile VARCHAR(20) NOT NULL,
                                                 address TEXT,
                                                 title VARCHAR(100),
                                                 designation VARCHAR(255),
                                                 department VARCHAR(255),
                                                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                 FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE,
                                                 UNIQUE KEY unique_society_position (society_id, position)
);

-- Society Registrations (Pending Applications)
CREATE TABLE IF NOT EXISTS society_registrations (
                                                     id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                     applicant_full_name VARCHAR(255) NOT NULL,
                                                     applicant_reg_no VARCHAR(50) NOT NULL,
                                                     applicant_email VARCHAR(255) NOT NULL,
                                                     applicant_faculty VARCHAR(255) NOT NULL,
                                                     applicant_mobile VARCHAR(20) NOT NULL,
                                                     society_name VARCHAR(255) NOT NULL,
                                                     aims TEXT NOT NULL,
                                                     bank_account VARCHAR(100),
                                                     bank_name VARCHAR(255),
                                                     agm_date DATE NOT NULL,

    -- Flattened Senior Treasurer Data (Matches DTO)
                                                     senior_treasurer_title VARCHAR(100),
                                                     senior_treasurer_full_name VARCHAR(255),
                                                     senior_treasurer_designation VARCHAR(255),
                                                     senior_treasurer_department VARCHAR(255),
                                                     senior_treasurer_email VARCHAR(255),
                                                     senior_treasurer_address TEXT,
                                                     senior_treasurer_mobile VARCHAR(20),

    -- Flattened Officials Data (Matches DTO)
                                                     president_reg_no VARCHAR(50), president_name VARCHAR(255), president_email VARCHAR(255), president_mobile VARCHAR(20), president_address TEXT,
                                                     vice_president_reg_no VARCHAR(50), vice_president_name VARCHAR(255), vice_president_email VARCHAR(255), vice_president_mobile VARCHAR(20), vice_president_address TEXT,
                                                     secretary_reg_no VARCHAR(50), secretary_name VARCHAR(255), secretary_email VARCHAR(255), secretary_mobile VARCHAR(20), secretary_address TEXT,
                                                     joint_secretary_reg_no VARCHAR(50), joint_secretary_name VARCHAR(255), joint_secretary_email VARCHAR(255), joint_secretary_mobile VARCHAR(20), joint_secretary_address TEXT,
                                                     junior_treasurer_reg_no VARCHAR(50), junior_treasurer_name VARCHAR(255), junior_treasurer_email VARCHAR(255), junior_treasurer_mobile VARCHAR(20), junior_treasurer_address TEXT,
                                                     editor_reg_no VARCHAR(50), editor_name VARCHAR(255), editor_email VARCHAR(255), editor_mobile VARCHAR(20), editor_address TEXT,

                                                     status ENUM('pending_dean', 'pending_ar', 'pending_vc', 'approved', 'rejected') DEFAULT 'pending_dean',
                                                     is_dean_approved BOOLEAN DEFAULT FALSE,
                                                     is_ar_approved BOOLEAN DEFAULT FALSE,
                                                     is_vc_approved BOOLEAN DEFAULT FALSE,
                                                     rejection_reason TEXT,

                                                     year INT NOT NULL,
                                                     submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                     approved_date TIMESTAMP NULL,

                                                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                                                     INDEX idx_status (status),
                                                     INDEX idx_faculty (applicant_faculty),
                                                     INDEX idx_year (year)
);

-- ==========================================
-- 4. Renewal Tables
-- ==========================================

-- Society Renewals (Pending Applications)
CREATE TABLE IF NOT EXISTS society_renewals (
                                                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                applicant_full_name VARCHAR(255) NOT NULL,
                                                applicant_reg_no VARCHAR(50) NOT NULL,
                                                applicant_email VARCHAR(255) NOT NULL,
                                                applicant_faculty VARCHAR(255) NOT NULL,
                                                applicant_mobile VARCHAR(20) NOT NULL,
                                                society_name VARCHAR(255) NOT NULL,
                                                bank_account VARCHAR(100) NOT NULL,
                                                bank_name VARCHAR(255) NOT NULL,
                                                agm_date DATE NOT NULL,
                                                difficulties TEXT NOT NULL,
                                                website VARCHAR(500),

                                                status ENUM('pending_dean', 'pending_ar', 'pending_vc', 'approved', 'rejected') DEFAULT 'pending_dean',
                                                is_dean_approved BOOLEAN DEFAULT FALSE,
                                                is_ar_approved BOOLEAN DEFAULT FALSE,
                                                is_vc_approved BOOLEAN DEFAULT FALSE,
                                                rejection_reason TEXT,

                                                year INT NOT NULL,
                                                submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                approved_date TIMESTAMP NULL,

                                                INDEX idx_status (status),
                                                INDEX idx_faculty (applicant_faculty),
                                                INDEX idx_year (year)
);

-- Renewal Sub-Tables (Advisory, Committee, Members, Events, Officials)
CREATE TABLE IF NOT EXISTS renewal_advisory_board_members (
                                                              id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                              renewal_id BIGINT NOT NULL,
                                                              name VARCHAR(255) NOT NULL,
                                                              designation VARCHAR(255) NOT NULL,
                                                              department VARCHAR(255) NOT NULL,
                                                              FOREIGN KEY (renewal_id) REFERENCES society_renewals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS renewal_committee_members (
                                                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                         renewal_id BIGINT NOT NULL,
                                                         reg_no VARCHAR(50) NOT NULL,
                                                         name VARCHAR(255) NOT NULL,
                                                         FOREIGN KEY (renewal_id) REFERENCES society_renewals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS renewal_society_members (
                                                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                       renewal_id BIGINT NOT NULL,
                                                       reg_no VARCHAR(50) NOT NULL,
                                                       name VARCHAR(255) NOT NULL,
                                                       FOREIGN KEY (renewal_id) REFERENCES society_renewals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS renewal_planning_events (
                                                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                       renewal_id BIGINT NOT NULL,
                                                       event_date DATE NOT NULL,
                                                       activity TEXT NOT NULL,
                                                       FOREIGN KEY (renewal_id) REFERENCES society_renewals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS previous_activities (
                                                   id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                   renewal_id BIGINT NOT NULL,
                                                   activity_date DATE NOT NULL,
                                                   activity TEXT NOT NULL,
                                                   FOREIGN KEY (renewal_id) REFERENCES society_renewals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS renewal_society_officials (
                                                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                         renewal_id BIGINT NOT NULL,
                                                         position ENUM('president', 'vice_president', 'secretary', 'joint_secretary', 'junior_treasurer', 'editor', 'senior_treasurer') NOT NULL,
                                                         reg_no VARCHAR(50),
                                                         name VARCHAR(255) NOT NULL,
                                                         email VARCHAR(255) NOT NULL,
                                                         mobile VARCHAR(20) NOT NULL,
                                                         address TEXT,
                                                         title VARCHAR(100),
                                                         designation VARCHAR(255),
                                                         department VARCHAR(255),
                                                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                         FOREIGN KEY (renewal_id) REFERENCES society_renewals(id) ON DELETE CASCADE,
                                                         UNIQUE KEY unique_renewal_position (renewal_id, position)
);

-- ==========================================
-- 5. Sub-Tables for Registration
-- ==========================================

CREATE TABLE IF NOT EXISTS advisory_board_members (
                                                      id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                      registration_id BIGINT,
                                                      name VARCHAR(255) NOT NULL,
                                                      designation VARCHAR(255) NOT NULL,
                                                      department VARCHAR(255) NOT NULL,
                                                      FOREIGN KEY (registration_id) REFERENCES society_registrations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS committee_members (
                                                 id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                 registration_id BIGINT,
                                                 reg_no VARCHAR(50) NOT NULL,
                                                 name VARCHAR(255) NOT NULL,
                                                 FOREIGN KEY (registration_id) REFERENCES society_registrations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS society_members (
                                               id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                               registration_id BIGINT,
                                               reg_no VARCHAR(50) NOT NULL,
                                               name VARCHAR(255) NOT NULL,
                                               FOREIGN KEY (registration_id) REFERENCES society_registrations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS planning_events (
                                               id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                               registration_id BIGINT,
                                               month VARCHAR(50), -- Changed from date to month/string to match Frontend
                                               activity TEXT NOT NULL,
                                               FOREIGN KEY (registration_id) REFERENCES society_registrations(id) ON DELETE CASCADE
);

-- ==========================================
-- 6. Event Permissions
-- ==========================================

CREATE TABLE IF NOT EXISTS event_permissions (
                                                 id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                 society_name VARCHAR(255) NOT NULL,
                                                 applicant_name VARCHAR(255) NOT NULL,
                                                 applicant_reg_no VARCHAR(50) NOT NULL,
                                                 applicant_position VARCHAR(100) NOT NULL,
                                                 applicant_mobile VARCHAR(20) NOT NULL,
                                                 applicant_email VARCHAR(255) NOT NULL, -- Added missing email field
                                                 event_name VARCHAR(255) NOT NULL,
                                                 event_date DATE NOT NULL,
                                                 time_from TIME NOT NULL,
                                                 time_to TIME NOT NULL,
                                                 place VARCHAR(500) NOT NULL,

                                                 is_inside_university BOOLEAN NOT NULL,
                                                 late_pass_required BOOLEAN NOT NULL,
                                                 outsiders_invited BOOLEAN NOT NULL,
                                                 outsiders_list TEXT,
                                                 first_year_participation BOOLEAN NOT NULL,

                                                 budget_estimate VARCHAR(255) NOT NULL,
                                                 fund_collection_methods VARCHAR(500) NOT NULL,
                                                 student_fee_amount VARCHAR(100),

                                                 senior_treasurer_name VARCHAR(255) NOT NULL,
                                                 senior_treasurer_department VARCHAR(255) NOT NULL,
                                                 senior_treasurer_mobile VARCHAR(20) NOT NULL,

                                                 premises_officer_name VARCHAR(255) NOT NULL,
                                                 premises_officer_designation VARCHAR(255) NOT NULL,
                                                 premises_officer_division VARCHAR(255) NOT NULL,

                                                 receipt_number VARCHAR(100),
                                                 payment_date DATE,

                                                 status ENUM('pending_ar', 'pending_vc', 'approved', 'rejected') DEFAULT 'pending_ar',
                                                 is_ar_approved BOOLEAN DEFAULT FALSE,
                                                 is_vc_approved BOOLEAN DEFAULT FALSE,
                                                 rejection_reason TEXT,

                                                 submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                 approved_date TIMESTAMP NULL,
                                                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                                                 INDEX idx_status (status),
                                                 INDEX idx_event_date (event_date),
                                                 INDEX idx_society (society_name)
);

-- ==========================================
-- 7. Initial Data Seeding (Admin Users)
-- ==========================================

-- Clear existing admins to prevent duplicates if re-running
# TRUNCATE TABLE admin_users;

INSERT INTO admin_users (name, email, role, faculty) VALUES
                                                         ('Prof. John Silva', 'dean.medicine@pdn.ac.lk', 'dean', 'Faculty of Medicine'),
                                                         ('Prof. Sarah Fernando', 'dean.engineering@pdn.ac.lk', 'dean', 'Faculty of Engineering'),
                                                         ('Prof. Michael Perera', 'dean.agriculture@pdn.ac.lk', 'dean', 'Faculty of Agriculture'),
                                                         ('Prof. Nimal Jayawardena', 'dean.science@pdn.ac.lk', 'dean', 'Faculty of Science'),
                                                         ('Prof. Kamala Wijesinghe', 'dean.arts@pdn.ac.lk', 'dean', 'Faculty of Arts'),
                                                         ('Prof. Ruwan Rajapakse', 'dean.management@pdn.ac.lk', 'dean', 'Faculty of Management'),
                                                         ('Prof. Sunil Bandara', 'dean.veterinary@pdn.ac.lk', 'dean', 'Faculty of Veterinary Medicine & Animal Science'),
                                                         ('Prof. Anura Dissanayake', 'dean.dental@pdn.ac.lk', 'dean', 'Faculty of Dental Sciences'),
                                                         ('Prof. Malini Fonseka', 'dean.allied@pdn.ac.lk', 'dean', 'Faculty of Allied Health Sciences'),
                                                         ('Dr. Registrar Assistant', 'registrar@pdn.ac.lk', 'assistant_registrar', NULL),
                                                         ('Prof. Vice Chancellor', 'vc@pdn.ac.lk', 'vice_chancellor', NULL),
                                                         ('Student Service Admin', 'studentservice@pdn.ac.lk', 'student_service', NULL);

-- IMPORTANT: Add your own user here to login!
INSERT INTO admin_users (name, email, role, faculty, is_active)
VALUES ('Chamuditha', 'chamudithakarunarathna06@gmail.com', 'assistant_registrar', NULL, TRUE);