# Spring Boot Backend Setup Guide

## Quick Start

1. **Prerequisites**
   - Install Java 17+
   - Install MySQL 8.0
   - Install Maven 3.6+

2. **Database Setup**
   ```bash
   mysql -u root -p
   CREATE DATABASE sms_uop;
   ```

3. **Environment Variables**
   Create `.env` file in backend directory:
   ```
   DB_USERNAME=root
   DB_PASSWORD=your_mysql_password
   EMAIL_USERNAME=your_gmail@gmail.com
   EMAIL_PASSWORD=your_gmail_app_password
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Run Application**
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```

5. **Update Frontend**
   Replace localStorage operations in your React app with API calls to `http://localhost:8080/api`

## Key Features Implemented

✅ **Complete Database Schema** with proper relationships and constraints
✅ **Role-based Security** with Google OAuth2 integration  
✅ **Email Notification System** for all approval workflows
✅ **PDF Generation** for applications and certificates
✅ **Approval Workflow Engine** (Dean → AR → VC)
✅ **Activity Logging** for audit trails
✅ **RESTful API** with proper validation
✅ **Docker Support** for easy deployment

## API Integration

Replace your frontend DataContext with actual API calls:

```typescript
// Example API service
const API_BASE = 'http://localhost:8080/api';

export const apiService = {
  registerSociety: (data) => fetch(`${API_BASE}/societies/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  
  getSocieties: (params) => fetch(`${API_BASE}/societies/public?${new URLSearchParams(params)}`),
  
  // Add other API methods...
};
```

The backend is production-ready with proper security, validation, and error handling. You can deploy it using Docker or traditional server deployment.