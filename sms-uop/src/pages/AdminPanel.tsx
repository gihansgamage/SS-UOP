import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, FileText, Calendar, Activity, UserPlus, BarChart3, Mail } from 'lucide-react';
import AdminDashboard from '../components/Admin/AdminDashboard';
import AdminSocieties from '../components/Admin/AdminSocieties';
import AdminApprovals from '../components/Admin/AdminApprovals';
import AdminEvents from '../components/Admin/AdminEvents';
import AdminCommunication from '../components/Admin/AdminCommunication';
import AdminLogs from '../components/Admin/AdminLogs';
import AdminUsers from '../components/Admin/AdminUsers';
import StudentServiceMonitoring from '../components/Admin/StudentServiceMonitoring';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // FIX: Add .toLowerCase() to ensure it matches backend data
  if (!user || !['dean', 'assistant_registrar', 'vice_chancellor', 'student_service', 'test_user'].includes(user.role.toLowerCase())) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access the admin panel.</p>
            <p className="text-xs text-gray-400 mt-2">Current Role: {user?.role}</p>
          </div>
        </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'approvals', label: 'Approvals', icon: FileText },
    { id: 'societies', label: 'Societies', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'communication', label: 'Communication', icon: Mail },
    { id: 'logs', label: 'Activity Logs', icon: Activity },
    ...(user.role === 'assistant_registrar' || 'ASSISTANT_REGISTRAR' ? [{ id: 'users', label: 'User Management', icon: UserPlus }] : []),
    ...(user.role === 'student_service' || 'STUDENT_SERVICE' ?  [{ id: 'monitoring', label: 'Application Monitoring', icon: Activity }] : [])
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'approvals':
        return <AdminApprovals />;
      case 'societies':
        return <AdminSocieties />;
      case 'events':
        return <AdminEvents />;
      case 'communication':
        return <AdminCommunication />;
      case 'logs':
        return <AdminLogs />;
      case 'users':
        return user.role === 'assistant_registrar' || 'ASSISTANT_REGISTRAR' ? <AdminUsers /> : <AdminDashboard />;
      case 'monitoring':
        return user.role === 'student_service' || 'STUDENT_SERVICE'  ? <StudentServiceMonitoring /> : <AdminDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">
            Welcome, {user.name} ({user.role.replace('_', ' ').toUpperCase()})
            {user.faculty && ` - ${user.faculty}`}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;