import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance with credentials enabled for Session-based OAuth
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // CRITICAL: This allows cookies (JSESSIONID) to be sent/received
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // If 401 Unauthorized, clear user state (handled in AuthContext usually)
        // But do NOT auto-redirect here to avoid loops on the login page itself
        console.warn('Unauthorized access - session may have expired');
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
    getCurrentUser: () => apiClient.get('/admin/user-info'), // Fetch logged-in user
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

    // User Management
    addUser: (data: any) => apiClient.post('/admin/ar/manage-admin/add', data),
    removeUser: (email: string) => apiClient.post(`/admin/ar/manage-admin/remove?email=${email}`),
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