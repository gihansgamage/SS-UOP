# Complete Backend Integration Guide
## Society Management System - Frontend to Backend Connection

## 📋 Overview

This guide will help you integrate your React frontend with the Spring Boot backend you've already implemented. The backend provides REST APIs for all society management operations with proper authentication, validation, and email notifications.

## 🚀 Quick Integration Steps

### Step 1: Install Additional Dependencies
```bash
# Install axios for HTTP requests
npm install axios@latest

# Install environment variable support
npm install dotenv@latest

# Install JWT handling (if using JWT authentication)
npm install js-cookie@latest
npm install @types/js-cookie@latest --save-dev
```

### Step 2: Environment Configuration
Create `.env` file in your project root:
```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:8080/api
VITE_BACKEND_URL=http://localhost:8080

# Google OAuth Configuration (for admin login)
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Application Settings
VITE_APP_NAME=Society Management System
VITE_UNIVERSITY_NAME=University of Peradeniya
```

### Step 3: Create API Service Layer
Create `src/services/api.ts`:
```typescript
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Society Management
  societies: {
    getAll: (params?: { page?: number; size?: number; search?: string; status?: string; year?: number }) =>
      apiClient.get('/societies/public', { params }),
    getById: (id: string) => apiClient.get(`/societies/public/${id}`),
    getActive: () => apiClient.get('/societies/active'),
    getStatistics: () => apiClient.get('/societies/statistics'),
    register: (data: any) => apiClient.post('/societies/register', data),
  },

  // Society Renewals
  renewals: {
    submit: (data: any) => apiClient.post('/renewals/submit', data),
    getById: (id: string) => apiClient.get(`/renewals/${id}`),
    downloadPDF: (id: string) => apiClient.get(`/renewals/download/${id}`, { responseType: 'blob' }),
    getStatistics: () => apiClient.get('/renewals/statistics'),
    // Admin endpoints
    getPending: (params?: { faculty?: string; status?: string }) =>
      apiClient.get('/renewals/admin/pending', { params }),
    getAll: (params?: { page?: number; size?: number; year?: number; status?: string }) =>
      apiClient.get('/renewals/admin/all', { params }),
    approve: (id: string, data: { comments?: string; reason?: string }) =>
      apiClient.post(`/renewals/admin/approve/${id}`, data),
    reject: (id: string, data: { reason: string }) =>
      apiClient.post(`/renewals/admin/reject/${id}`, data),
  },

  // Event Permissions
  events: {
    request: (data: any) => apiClient.post('/events/request', data),
    getById: (id: string) => apiClient.get(`/events/${id}`),
    downloadPDF: (id: string) => apiClient.get(`/events/download/${id}`, { responseType: 'blob' }),
    // Admin endpoints
    getPending: () => apiClient.get('/events/admin/pending'),
    getAll: (params?: { page?: number; size?: number; status?: string }) =>
      apiClient.get('/events/admin/all', { params }),
    approve: (id: string, data: { comments?: string }) =>
      apiClient.post(`/events/admin/approve/${id}`, data),
    reject: (id: string, data: { reason: string }) =>
      apiClient.post(`/events/admin/reject/${id}`, data),
  },

  // Admin Operations
  admin: {
    getDashboard: () => apiClient.get('/admin/dashboard'),
    getPendingApprovals: () => apiClient.get('/admin/pending-approvals'),
    getActivityLogs: (params?: { user?: string; action?: string; page?: number; size?: number }) =>
      apiClient.get('/admin/activity-logs', { params }),
    getSocieties: (params?: { year?: number; status?: string; page?: number; size?: number }) =>
      apiClient.get('/admin/societies', { params }),
    sendBulkEmail: (data: { subject: string; body: string; recipients: string[] }) =>
      apiClient.post('/admin/send-email', data),
    
    // Registration approvals
    approveRegistration: (id: string, data: { comments?: string }) =>
      apiClient.post(`/admin/approve-registration/${id}`, data),
    rejectRegistration: (id: string, data: { reason: string }) =>
      apiClient.post(`/admin/reject-registration/${id}`, data),
  },

  // File Operations
  files: {
    downloadRegistrationPDF: (id: string) =>
      apiClient.get(`/files/download/registration/${id}`, { responseType: 'blob' }),
    downloadEventPDF: (id: string) =>
      apiClient.get(`/files/download/event/${id}`, { responseType: 'blob' }),
    exportSocieties: () =>
      apiClient.get('/files/export/societies', { responseType: 'blob' }),
  },

  // Validation
  validation: {
    validateEmail: (email: string, position: string) =>
      apiClient.post('/validation/email', { email, position }),
    validateMobile: (mobile: string) =>
      apiClient.post('/validation/mobile', { mobile }),
    validateRegistrationNumber: (regNo: string) =>
      apiClient.post('/validation/registration-number', { regNo }),
    validateBulkEmails: (emails: string[]) =>
      apiClient.post('/validation/bulk-emails', { emails }),
  },
};

export default apiService;
```

## 🔄 Step 4: Update DataContext for Backend Integration

Replace your current DataContext with backend-integrated version:

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Society, SocietyRegistration, SocietyRenewal, EventPermission, ActivityLog } from '../types';
import apiService from '../services/api';

interface DataContextType {
  // State
  societies: Society[];
  registrations: SocietyRegistration[];
  renewals: SocietyRenewal[];
  eventPermissions: EventPermission[];
  activityLogs: ActivityLog[];
  loading: boolean;
  error: string | null;

  // Actions
  loadSocieties: () => Promise<void>;
  loadRegistrations: () => Promise<void>;
  loadRenewals: () => Promise<void>;
  loadEventPermissions: () => Promise<void>;
  loadActivityLogs: () => Promise<void>;
  
  addRegistration: (registration: Omit<SocietyRegistration, 'id' | 'submittedDate'>) => Promise<void>;
  addRenewal: (renewal: Omit<SocietyRenewal, 'id' | 'submittedDate'>) => Promise<void>;
  addEventPermission: (permission: Omit<EventPermission, 'id' | 'submittedDate'>) => Promise<void>;
  
  updateRegistrationStatus: (id: string, status: SocietyRegistration['status'], rejectionReason?: string) => Promise<void>;
  updateRenewalStatus: (id: string, status: SocietyRenewal['status'], rejectionReason?: string) => Promise<void>;
  updateEventPermissionStatus: (id: string, status: EventPermission['status'], rejectionReason?: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [societies, setSocieties] = useState<Society[]>([]);
  const [registrations, setRegistrations] = useState<SocietyRegistration[]>([]);
  const [renewals, setRenewals] = useState<SocietyRenewal[]>([]);
  const [eventPermissions, setEventPermissions] = useState<EventPermission[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data functions
  const loadSocieties = async () => {
    try {
      setLoading(true);
      const response = await apiService.societies.getAll();
      setSocieties(response.data.content || response.data);
    } catch (err) {
      setError('Failed to load societies');
      console.error('Error loading societies:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      const response = await apiService.admin.getPendingApprovals();
      setRegistrations(response.data.registrations || []);
    } catch (err) {
      console.error('Error loading registrations:', err);
    }
  };

  const loadRenewals = async () => {
    try {
      const response = await apiService.renewals.getPending();
      setRenewals(response.data || []);
    } catch (err) {
      console.error('Error loading renewals:', err);
    }
  };

  const loadEventPermissions = async () => {
    try {
      const response = await apiService.events.getPending();
      setEventPermissions(response.data || []);
    } catch (err) {
      console.error('Error loading event permissions:', err);
    }
  };

  const loadActivityLogs = async () => {
    try {
      const response = await apiService.admin.getActivityLogs();
      setActivityLogs(response.data.content || response.data);
    } catch (err) {
      console.error('Error loading activity logs:', err);
    }
  };

  // CRUD operations
  const addRegistration = async (registrationData: Omit<SocietyRegistration, 'id' | 'submittedDate'>) => {
    try {
      setLoading(true);
      await apiService.societies.register(registrationData);
      await loadRegistrations(); // Reload data
    } catch (err) {
      setError('Failed to submit registration');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addRenewal = async (renewalData: Omit<SocietyRenewal, 'id' | 'submittedDate'>) => {
    try {
      setLoading(true);
      await apiService.renewals.submit(renewalData);
      await loadRenewals(); // Reload data
    } catch (err) {
      setError('Failed to submit renewal');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addEventPermission = async (permissionData: Omit<EventPermission, 'id' | 'submittedDate'>) => {
    try {
      setLoading(true);
      await apiService.events.request(permissionData);
      await loadEventPermissions(); // Reload data
    } catch (err) {
      setError('Failed to submit event permission');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRegistrationStatus = async (id: string, status: SocietyRegistration['status'], rejectionReason?: string) => {
    try {
      if (status === 'approved') {
        await apiService.admin.approveRegistration(id, { comments: 'Approved' });
      } else if (status === 'rejected') {
        await apiService.admin.rejectRegistration(id, { reason: rejectionReason || 'Rejected' });
      }
      await loadRegistrations(); // Reload data
    } catch (err) {
      setError('Failed to update registration status');
      throw err;
    }
  };

  const updateRenewalStatus = async (id: string, status: SocietyRenewal['status'], rejectionReason?: string) => {
    try {
      if (status === 'approved') {
        await apiService.renewals.approve(id, { comments: 'Approved' });
      } else if (status === 'rejected') {
        await apiService.renewals.reject(id, { reason: rejectionReason || 'Rejected' });
      }
      await loadRenewals(); // Reload data
    } catch (err) {
      setError('Failed to update renewal status');
      throw err;
    }
  };

  const updateEventPermissionStatus = async (id: string, status: EventPermission['status'], rejectionReason?: string) => {
    try {
      if (status === 'approved') {
        await apiService.events.approve(id, { comments: 'Approved' });
      } else if (status === 'rejected') {
        await apiService.events.reject(id, { reason: rejectionReason || 'Rejected' });
      }
      await loadEventPermissions(); // Reload data
    } catch (err) {
      setError('Failed to update event permission status');
      throw err;
    }
  };

  // Load initial data
  useEffect(() => {
    loadSocieties();
  }, []);

  return (
    <DataContext.Provider value={{
      societies,
      registrations,
      renewals,
      eventPermissions,
      activityLogs,
      loading,
      error,
      loadSocieties,
      loadRegistrations,
      loadRenewals,
      loadEventPermissions,
      loadActivityLogs,
      addRegistration,
      addRenewal,
      addEventPermission,
      updateRegistrationStatus,
      updateRenewalStatus,
      updateEventPermissionStatus,
    }}>
      {children}
    </DataContext.Provider>
  );
};
```

## 🔐 Step 5: Update Authentication Context

Update `src/contexts/AuthContext.tsx` for backend authentication:

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import apiService from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call backend login endpoint
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Redirect to Google OAuth
      window.location.href = `${import.meta.env.VITE_BACKEND_URL}/oauth2/authorization/google`;
    } catch (err) {
      setError('Google login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role !== undefined && 
    ['dean', 'assistant_registrar', 'vice_chancellor', 'student_service'].includes(user.role);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithGoogle,
      logout,
      isAuthenticated,
      isAdmin,
      loading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 📡 Step 6: Create API Hooks

Create `src/hooks/useApi.ts` for better API state management:

```typescript
import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useApiData = <T>(
  apiCall: () => Promise<{ data: T }>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

// Specific hooks for common operations
export const useSocieties = (params?: any) => {
  return useApiData(() => apiService.societies.getAll(params), [params]);
};

export const usePendingApprovals = () => {
  return useApiData(() => apiService.admin.getPendingApprovals());
};

export const useActivityLogs = (params?: any) => {
  return useApiData(() => apiService.admin.getActivityLogs(params), [params]);
};
```

## 🔧 Step 7: Update Components for Backend Integration

### Update Registration Form (`src/components/Registration/RegistrationForm.tsx`):

```typescript
// Add to imports
import apiService from '../../services/api';

// Update handleSubmit function
const handleSubmit = async () => {
  try {
    setLoading(true);
    
    // Transform form data to match backend DTO
    const registrationDto = {
      // Applicant information
      applicantFullName: formData.applicantFullName,
      applicantRegNo: formData.applicantRegNo,
      applicantEmail: formData.applicantEmail,
      applicantFaculty: formData.applicantFaculty,
      applicantMobile: formData.applicantMobile,
      
      // Society information
      societyName: formData.societyName,
      aims: formData.aims,
      agmDate: formData.agmDate,
      bankAccount: formData.bankAccount,
      bankName: formData.bankName,
      
      // Senior treasurer
      seniorTreasurerTitle: formData.seniorTreasurer?.title,
      seniorTreasurerFullName: formData.seniorTreasurer?.name,
      seniorTreasurerDesignation: formData.seniorTreasurer?.designation,
      seniorTreasurerDepartment: formData.seniorTreasurer?.department,
      seniorTreasurerEmail: formData.seniorTreasurer?.email,
      seniorTreasurerAddress: formData.seniorTreasurer?.address,
      seniorTreasurerMobile: formData.seniorTreasurer?.mobile,
      
      // Society officials
      presidentRegNo: formData.president?.regNo,
      presidentName: formData.president?.name,
      presidentAddress: formData.president?.address,
      presidentEmail: formData.president?.email,
      presidentMobile: formData.president?.mobile,
      
      // ... map all other officials
      
      // Advisory board, committee members, etc.
      advisoryBoard: formData.advisoryBoard,
      committeeMember: formData.committeeMember,
      member: formData.member,
      planningEvents: formData.planningEvents,
    };

    await apiService.societies.register(registrationDto);
    
    alert('Registration submitted successfully! You will receive email updates on the approval process.');
    navigate('/');
  } catch (error) {
    console.error('Registration submission failed:', error);
    alert('Failed to submit registration. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

### Update Admin Panel Components:

```typescript
// In AdminApprovals.tsx
const handleApprove = async (item: any) => {
  try {
    if (item.type === 'registration') {
      await apiService.admin.approveRegistration(item.id, { comments: 'Approved' });
    } else if (item.type === 'renewal') {
      await apiService.renewals.approve(item.id, { comments: 'Approved' });
    } else if (item.type === 'event') {
      await apiService.events.approve(item.id, { comments: 'Approved' });
    }
    
    // Reload pending approvals
    await loadPendingApprovals();
    alert('Application approved successfully!');
  } catch (error) {
    console.error('Approval failed:', error);
    alert('Failed to approve application. Please try again.');
  }
};
```

## 🔒 Step 8: Backend CORS Configuration

Ensure your Spring Boot backend has proper CORS configuration in `SecurityConfig.java`:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

## 🗄️ Step 9: Backend Database Setup

### Start MySQL Database:
```bash
# Start MySQL service
sudo systemctl start mysql  # Linux
brew services start mysql   # macOS
# Or start MySQL from Services on Windows

# Create database
mysql -u root -p
CREATE DATABASE sms_uop;
```

### Configure Backend Environment:
Create `backend/.env`:
```env
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
EMAIL_USERNAME=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
FRONTEND_URL=http://localhost:5173
```

### Start Backend:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

## 🔄 Step 10: Integration Testing

### Test API Connectivity:
```bash
# Test if backend is running
curl http://localhost:8080/api/societies/public

# Test CORS
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:8080/api/societies/public
```

### Frontend Testing:
1. Start frontend: `npm run dev`
2. Open `http://localhost:5173`
3. Test society registration form
4. Test admin login and approvals
5. Verify email notifications in backend logs

## 📧 Step 11: Email Configuration

### Gmail Setup for Backend:
1. Enable 2-factor authentication on Gmail
2. Generate App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this app password in `EMAIL_PASSWORD`

### Google OAuth Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project or select existing
3. Enable Google+ API
4. Create OAuth2 credentials
5. Add authorized redirect URIs:
   - `http://localhost:8080/login/oauth2/code/google`
   - `http://localhost:8080/api/auth/success`

## 🚀 Step 12: Production Deployment

### Frontend Build:
```bash
npm run build
# Deploy dist/ folder to your web server
```

### Backend Deployment:
```bash
cd backend
mvn clean package
# Deploy target/sms-uop-0.0.1-SNAPSHOT.jar to your server
```

### Docker Deployment:
```bash
cd backend
docker-compose up -d
```

## 🔍 Step 13: Monitoring and Debugging

### Frontend Debugging:
- Open browser DevTools → Network tab
- Check API requests and responses
- Verify CORS headers
- Check console for JavaScript errors

### Backend Debugging:
- Check Spring Boot logs for errors
- Verify database connections
- Test email sending functionality
- Monitor API endpoint responses

## 📋 Step 14: Migration Checklist

- [ ] Backend running on `http://localhost:8080`
- [ ] Frontend running on `http://localhost:5173`
- [ ] Database created and connected
- [ ] CORS configured properly
- [ ] Email service configured
- [ ] Google OAuth configured (for admin login)
- [ ] API endpoints responding correctly
- [ ] Frontend making successful API calls
- [ ] Email notifications working
- [ ] PDF generation working
- [ ] File uploads/downloads working

## 🆘 Common Issues and Solutions

### 1. CORS Errors
```bash
# Add to backend SecurityConfig.java
configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:5173"));
```

### 2. Database Connection Issues
```bash
# Check MySQL is running
sudo systemctl status mysql

# Verify database exists
mysql -u root -p -e "SHOW DATABASES;"
```

### 3. Email Not Sending
```bash
# Check Gmail app password
# Verify SMTP settings in application.yml
# Check firewall/network restrictions
```

### 4. API 404 Errors
```bash
# Verify backend is running
curl http://localhost:8080/actuator/health

# Check controller mappings
curl http://localhost:8080/api/societies/public
```

### 5. Authentication Issues
```bash
# Clear browser storage
localStorage.clear();

# Check Google OAuth configuration
# Verify JWT token handling
```

## 🎯 Final Integration Steps

1. **Replace localStorage** with API calls in all components
2. **Add loading states** for better UX
3. **Implement error handling** for failed API calls
4. **Add authentication guards** for protected routes
5. **Test all workflows** end-to-end
6. **Configure production** environment variables

Your Society Management System is now fully integrated with the backend and ready for production use!

## 📞 Support

For backend-specific issues, refer to:
- Spring Boot documentation
- MySQL documentation
- Google OAuth2 documentation
- Your backend README.md file

The integration provides a complete, production-ready society management system with proper security, validation, and email notifications.