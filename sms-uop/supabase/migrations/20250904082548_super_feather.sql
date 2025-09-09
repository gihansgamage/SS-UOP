@@ .. @@
 -- Previous Activities Table (for renewals)
 CREATE TABLE previous_activities (
     id BIGINT AUTO_INCREMENT PRIMARY KEY,
     renewal_id BIGINT NOT NULL,
     activity_date DATE NOT NULL,
     activity TEXT NOT NULL,
     FOREIGN KEY (renewal_id) REFERENCES society_renewals(id) ON DELETE CASCADE
 );

+-- Renewal Advisory Board Members Table
+CREATE TABLE renewal_advisory_board_members (
+    id BIGINT AUTO_INCREMENT PRIMARY KEY,
+    renewal_id BIGINT NOT NULL,
+    name VARCHAR(255) NOT NULL,
+    designation VARCHAR(255) NOT NULL,
+    department VARCHAR(255) NOT NULL,
+    FOREIGN KEY (renewal_id) REFERENCES society_renewals(id) ON DELETE CASCADE
+);
+
+-- Renewal Committee Members Table
+CREATE TABLE renewal_committee_members (
+    id BIGINT AUTO_INCREMENT PRIMARY KEY,
+    renewal_id BIGINT NOT NULL,
+    reg_no VARCHAR(50) NOT NULL,
+    name VARCHAR(255) NOT NULL,
+    FOREIGN KEY (renewal_id) REFERENCES society_renewals(id) ON DELETE CASCADE
+);
+
+-- Renewal Society Members Table
+CREATE TABLE renewal_society_members (
+    id BIGINT AUTO_INCREMENT PRIMARY KEY,
+    renewal_id BIGINT NOT NULL,
+    reg_no VARCHAR(50) NOT NULL,
+    name VARCHAR(255) NOT NULL,
+    FOREIGN KEY (renewal_id) REFERENCES society_renewals(id) ON DELETE CASCADE
+);
+
+-- Renewal Planning Events Table
+CREATE TABLE renewal_planning_events (
+    id BIGINT AUTO_INCREMENT PRIMARY KEY,
+    renewal_id BIGINT NOT NULL,
+    event_date DATE NOT NULL,
+    activity TEXT NOT NULL,
+    FOREIGN KEY (renewal_id) REFERENCES society_renewals(id) ON DELETE CASCADE
+);
+
+-- Renewal Society Officials Table
+CREATE TABLE renewal_society_officials (
+    id BIGINT AUTO_INCREMENT PRIMARY KEY,
+    renewal_id BIGINT NOT NULL,
+    position ENUM('president', 'vice_president', 'secretary', 'joint_secretary', 'junior_treasurer', 'editor', 'senior_treasurer') NOT NULL,
+    reg_no VARCHAR(50),
+    name VARCHAR(255) NOT NULL,
+    email VARCHAR(255) NOT NULL,
+    mobile VARCHAR(20) NOT NULL,
+    address TEXT,
+    title VARCHAR(100),
+    designation VARCHAR(255),
+    department VARCHAR(255),
+    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
+    FOREIGN KEY (renewal_id) REFERENCES society_renewals(id) ON DELETE CASCADE,
+    UNIQUE KEY unique_renewal_position (renewal_id, position)
+);
+
 -- Activity Logs Table