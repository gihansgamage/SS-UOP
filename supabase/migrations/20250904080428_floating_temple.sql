-- Society Management System Database Schema
-- University of Peradeniya

-- Create database
CREATE DATABASE IF NOT EXISTS sms_uop;
USE sms_uop;

-- Admin Users Table
CREATE TABLE admin_users (
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

-- Societies Table (Final approved societies)
CREATE TABLE societies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    society_name VARCHAR(255) NOT NULL,
    registered_date DATE NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    year INT NOT NULL,
    website VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_society_year (society_name, year),
    INDEX idx_year (year),
    INDEX idx_status (status)
);

-- Society Officials Table
CREATE TABLE society_officials (
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

-- Society Registrations Table (Temporary table for approval process)
CREATE TABLE society_registrations (
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

-- Society Renewals Table
CREATE TABLE society_renewals (
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

-- Event Permissions Table
CREATE TABLE event_permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    society_name VARCHAR(255) NOT NULL,
    applicant_name VARCHAR(255) NOT NULL,
    applicant_reg_no VARCHAR(50) NOT NULL,
    applicant_position VARCHAR(100) NOT NULL,
    applicant_mobile VARCHAR(20) NOT NULL,
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
    INDEX idx_status (status),
    INDEX idx_event_date (event_date),
    INDEX idx_society (society_name)
);

-- Advisory Board Members Table
CREATE TABLE advisory_board_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    registration_id BIGINT,
    renewal_id BIGINT,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    FOREIGN KEY (registration_id) REFERENCES society_registrations(id) ON DELETE CASCADE,
    FOREIGN KEY (renewal_id) REFERENCES society_renewals(id) ON DELETE CASCADE
);

-- Committee Members Table
CREATE TABLE committee_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    registration_id BIGINT,
    renewal_id BIGINT,
    reg_no VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (registration_id) REFERENCES society_registrations(id) ON DELETE CASCADE,
    FOREIGN KEY (renewal_id) REFERENCES society_renewals(id) ON DELETE CASCADE
);

-- Society Members Table
CREATE TABLE society_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    registration_id BIGINT,
    renewal_id BIGINT,
    reg_no VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (registration_id) REFERENCES society_registrations(id) ON DELETE CASCADE,
    FOREIGN KEY (renewal_id) REFERENCES society_renewals(id) ON DELETE CASCADE
);

-- Planning Events Table
CREATE TABLE planning_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    registration_id BIGINT,
    renewal_id BIGINT,
    event_date DATE NOT NULL,
    activity TEXT NOT NULL,
    FOREIGN KEY (registration_id) REFERENCES society_registrations(id) ON DELETE CASCADE,
    FOREIGN KEY (renewal_id) REFERENCES society_renewals(id) ON DELETE CASCADE
);

-- Previous Activities Table (for renewals)
CREATE TABLE previous_activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    renewal_id BIGINT NOT NULL,
    activity_date DATE NOT NULL,
    activity TEXT NOT NULL,
    FOREIGN KEY (renewal_id) REFERENCES society_renewals(id) ON DELETE CASCADE
);

-- Activity Logs Table
CREATE TABLE activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    target VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admin_users(id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_user (user_id)
);

-- Email Notifications Table
CREATE TABLE email_notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    INDEX idx_status (status),
    INDEX idx_sent_at (sent_at)
);

-- Insert default admin users
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