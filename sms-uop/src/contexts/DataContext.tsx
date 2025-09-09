import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Society, SocietyRegistration, SocietyRenewal, EventPermission, ActivityLog } from '../types';

interface DataContextType {
  societies: Society[];
  registrations: SocietyRegistration[];
  renewals: SocietyRenewal[];
  eventPermissions: EventPermission[];
  activityLogs: ActivityLog[];
  addRegistration: (registration: SocietyRegistration) => void;
  addRenewal: (renewal: SocietyRenewal) => void;
  addEventPermission: (permission: EventPermission) => void;
  updateRegistrationStatus: (id: string, status: SocietyRegistration['status'], rejectionReason?: string) => void;
  updateRenewalStatus: (id: string, status: SocietyRenewal['status'], rejectionReason?: string) => void;
  updateEventPermissionStatus: (id: string, status: EventPermission['status'], rejectionReason?: string) => void;
  addActivityLog: (action: string, target: string, userId: string, userName: string, userRole?: string) => void;
  approveSociety: (registration: SocietyRegistration) => void;
  approveRenewal: (renewal: SocietyRenewal) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [societies, setSocieties] = useState<Society[]>(() => {
    const saved = localStorage.getItem('sms_societies');
    return saved ? JSON.parse(saved) : [];
  });

  const [registrations, setRegistrations] = useState<SocietyRegistration[]>(() => {
    const saved = localStorage.getItem('sms_registrations');
    return saved ? JSON.parse(saved) : [];
  });

  const [renewals, setRenewals] = useState<SocietyRenewal[]>(() => {
    const saved = localStorage.getItem('sms_renewals');
    return saved ? JSON.parse(saved) : [];
  });

  const [eventPermissions, setEventPermissions] = useState<EventPermission[]>(() => {
    const saved = localStorage.getItem('sms_event_permissions');
    return saved ? JSON.parse(saved) : [];
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('sms_activity_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const addRegistration = (registration: SocietyRegistration) => {
    const updated = [...registrations, registration];
    setRegistrations(updated);
    saveToStorage('sms_registrations', updated);
  };

  const addRenewal = (renewal: SocietyRenewal) => {
    const updated = [...renewals, renewal];
    setRenewals(updated);
    saveToStorage('sms_renewals', updated);
  };

  const addEventPermission = (permission: EventPermission) => {
    const updated = [...eventPermissions, permission];
    setEventPermissions(updated);
    saveToStorage('sms_event_permissions', updated);
    
    // Send confirmation email to applicant
    console.log(`Email sent to ${permission.applicantName} (${permission.applicantEmail}): Event permission application received and is under review by Assistant Registrar`);
  };

  const updateRegistrationStatus = (id: string, status: SocietyRegistration['status'], rejectionReason?: string) => {
    const updated = registrations.map(reg => {
      if (reg.id === id) {
        const updatedReg = { ...reg, status, rejectionReason };
        if (status === 'pending_ar') updatedReg.isDeanApproved = true;
        if (status === 'pending_vc') updatedReg.isARApproved = true;
        if (status === 'approved') updatedReg.isVCApproved = true;
        return updatedReg;
      }
      return reg;
    });
    setRegistrations(updated);
    saveToStorage('sms_registrations', updated);
    
    // Send email notifications for registration status changes
    const registration = updated.find(r => r.id === id);
    if (registration) {
      if (status === 'pending_ar') {
        console.log(`Email sent to ${registration.applicantFullName} (${registration.applicantEmail}): Registration approved by Dean, now pending Assistant Registrar approval`);
      } else if (status === 'pending_vc') {
        console.log(`Email sent to ${registration.applicantFullName} (${registration.applicantEmail}): Registration approved by Assistant Registrar, now pending Vice Chancellor approval`);
      } else if (status === 'approved') {
        console.log(`Email sent to ${registration.applicantFullName} (${registration.applicantEmail}): Congratulations! Your society registration has been approved.`);
      } else if (status === 'rejected') {
        console.log(`Email sent to ${registration.applicantFullName} (${registration.applicantEmail}): Registration rejected. Reason: ${rejectionReason}`);
      }
    }
  };

  const updateRenewalStatus = (id: string, status: SocietyRenewal['status'], rejectionReason?: string) => {
    const updated = renewals.map(renewal => {
      if (renewal.id === id) {
        const updatedRenewal = { ...renewal, status, rejectionReason };
        if (status === 'pending_ar') updatedRenewal.isDeanApproved = true;
        if (status === 'pending_vc') updatedRenewal.isARApproved = true;
        if (status === 'approved') updatedRenewal.isVCApproved = true;
        return updatedRenewal;
      }
      return renewal;
    });
    setRenewals(updated);
    saveToStorage('sms_renewals', updated);
    
    // Send email notifications for renewal status changes
    const renewal = updated.find(r => r.id === id);
    if (renewal) {
      if (status === 'pending_ar') {
        console.log(`Email sent to ${renewal.applicantFullName} (${renewal.applicantEmail}): Renewal approved by Dean, now pending Assistant Registrar approval`);
      } else if (status === 'pending_vc') {
        console.log(`Email sent to ${renewal.applicantFullName} (${renewal.applicantEmail}): Renewal approved by Assistant Registrar, now pending Vice Chancellor approval`);
      } else if (status === 'approved') {
        console.log(`Email sent to ${renewal.applicantFullName} (${renewal.applicantEmail}): Congratulations! Your society renewal has been approved.`);
      } else if (status === 'rejected') {
        console.log(`Email sent to ${renewal.applicantFullName} (${renewal.applicantEmail}): Renewal rejected. Reason: ${rejectionReason}`);
      }
    }
  };

  const updateEventPermissionStatus = (id: string, status: EventPermission['status'], rejectionReason?: string) => {
    const updated = eventPermissions.map(permission => {
      if (permission.id === id) {
        const updatedPermission = { ...permission, status, rejectionReason };
        if (status === 'pending_vc') updatedPermission.isARApproved = true;
        if (status === 'approved') updatedPermission.isVCApproved = true;
        return updatedPermission;
      }
      return permission;
    });
    setEventPermissions(updated);
    saveToStorage('sms_event_permissions', updated);
    
    // Send email notifications for event permission status changes
    const permission = updated.find(p => p.id === id);
    if (permission) {
      if (status === 'pending_vc') {
        console.log(`Email sent to ${permission.applicantName} (${permission.applicantEmail}): Event permission approved by Assistant Registrar, now pending Vice Chancellor approval`);
      } else if (status === 'approved') {
        console.log(`Email sent to ${permission.applicantName} (${permission.applicantEmail}): Event permission approved! You can proceed with your event on ${permission.eventDate}.`);
      } else if (status === 'rejected') {
        console.log(`Email sent to ${permission.applicantName} (${permission.applicantEmail}): Event permission rejected. Reason: ${rejectionReason}`);
      }
    }
  };

  const addActivityLog = (action: string, target: string, userId: string, userName: string, userRole?: string) => {
    // Extract user role from userId if it contains role info, or default to 'user'
    let role = userRole || 'user';
    if (!userRole) {
      if (userId.includes('dean')) role = 'dean';
      else if (userId.includes('assistant_registrar')) role = 'assistant_registrar';
      else if (userId.includes('vice_chancellor')) role = 'vice_chancellor';
      else if (userId.includes('student_service')) role = 'student_service';
    }
    
    const log: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      userName,
      userRole: role,
      action,
      target,
      timestamp: new Date().toISOString()
    };
    const updated = [log, ...activityLogs];
    setActivityLogs(updated);
    saveToStorage('sms_activity_logs', updated);
  };

  const approveSociety = (registration: SocietyRegistration) => {
    const newSociety: Society = {
      id: registration.id,
      societyName: registration.societyName,
      registeredDate: new Date().toISOString().split('T')[0],
      status: 'active',
      seniorTreasurer: registration.seniorTreasurer,
      juniorTreasurer: registration.juniorTreasurer,
      president: registration.president,
      secretary: registration.secretary,
      editor: registration.editor,
      jointSecretary: registration.jointSecretary,
      vicePresident: registration.vicePresident,
      year: registration.year
    };
    const updatedSocieties = [...societies, newSociety];
    setSocieties(updatedSocieties);
    saveToStorage('sms_societies', updatedSocieties);
  };

  const approveRenewal = (renewal: SocietyRenewal) => {
    // Update the existing society with renewal information
    const updatedSocieties = societies.map(society => {
      if (society.societyName === renewal.societyName) {
        return {
          ...society,
          seniorTreasurer: renewal.seniorTreasurer,
          juniorTreasurer: renewal.juniorTreasurer,
          president: renewal.president,
          secretary: renewal.secretary,
          editor: renewal.editor,
          jointSecretary: renewal.jointSecretary,
          vicePresident: renewal.vicePresident,
          website: renewal.website,
          year: renewal.year
        };
      }
      return society;
    });
    setSocieties(updatedSocieties);
    saveToStorage('sms_societies', updatedSocieties);
  };

  return (
    <DataContext.Provider value={{
      societies,
      registrations,
      renewals,
      eventPermissions,
      activityLogs,
      addRegistration,
      addRenewal,
      addEventPermission,
      updateRegistrationStatus,
      updateRenewalStatus,
      updateEventPermissionStatus,
      addActivityLog,
      approveSociety,
      approveRenewal
    }}>
      {children}
    </DataContext.Provider>
  );
};