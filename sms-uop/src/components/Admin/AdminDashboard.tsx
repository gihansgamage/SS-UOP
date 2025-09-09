import React from 'react';
import { Users, Clock, CheckCircle, AlertCircle, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { societies, registrations, renewals, eventPermissions } = useData();

  // Show all applications for student service division
  const allApplications = user?.role === 'student_service' ? 
    [...registrations, ...renewals, ...eventPermissions] : [];

  const pendingRegistrations = registrations.filter(reg => {
    if (user?.role === 'dean') return reg.status === 'pending_dean' && reg.applicantFaculty === user.faculty;
    if (user?.role === 'assistant_registrar') return reg.status === 'pending_ar';
    if (user?.role === 'vice_chancellor') return reg.status === 'pending_vc';
    if (user?.role === 'student_service') return ['pending_dean', 'pending_ar', 'pending_vc'].includes(reg.status);
    return false;
  });

  const pendingRenewals = renewals.filter(renewal => {
    if (user?.role === 'dean') return renewal.status === 'pending_dean' && renewal.applicantFaculty === user.faculty;
    if (user?.role === 'assistant_registrar') return renewal.status === 'pending_ar';
    if (user?.role === 'vice_chancellor') return renewal.status === 'pending_vc';
    if (user?.role === 'student_service') return ['pending_dean', 'pending_ar', 'pending_vc'].includes(renewal.status);
    return false;
  });

  const pendingEventPermissions = eventPermissions.filter(permission => {
    if (user?.role === 'assistant_registrar') return permission.status === 'pending_ar';
    if (user?.role === 'vice_chancellor') return permission.status === 'pending_vc';
    if (user?.role === 'student_service') return ['pending_ar', 'pending_vc'].includes(permission.status);
    return false;
  });

  const totalPending = pendingRegistrations.length + pendingRenewals.length + pendingEventPermissions.length;

  const upcomingEvents = eventPermissions.filter(event => 
    new Date(event.eventDate) > new Date() && event.status === 'approved'
  ).slice(0, 5);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h2>
        <p className="text-gray-600">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{societies.filter(s => s.status === 'active').length}</div>
              <div className="text-blue-100">Registered Societies</div>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{totalPending}</div>
              <div className="text-orange-100">Pending Approvals</div>
            </div>
            <Clock className="w-8 h-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{societies.length}</div>
              <div className="text-green-100">Total Societies</div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{upcomingEvents.length}</div>
              <div className="text-purple-100">Upcoming Events</div>
            </div>
            <Calendar className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Pending Approvals Alert */}
      {totalPending > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
            <span className="text-orange-800 font-medium">
              You have {totalPending} item(s) pending for your approval
            </span>
          </div>
        </div>
      )}

      {/* Recent Activity & Upcoming Events */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Quick Actions based on role */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            {user?.role === 'dean' && (
              <>
                <div className="text-sm">
                  <span className="text-gray-600">Registrations awaiting approval:</span>
                  <span className="font-medium ml-2">{pendingRegistrations.length}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Renewals awaiting approval:</span>
                  <span className="font-medium ml-2">{pendingRenewals.length}</span>
                </div>
              </>
            )}
            {user?.role === 'assistant_registrar' && (
              <>
                <div className="text-sm">
                  <span className="text-gray-600">Applications awaiting approval:</span>
                  <span className="font-medium ml-2">{pendingRegistrations.length + pendingRenewals.length}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Event permissions awaiting:</span>
                  <span className="font-medium ml-2">{pendingEventPermissions.length}</span>
                </div>
              </>
            )}
            {user?.role === 'vice_chancellor' && (
              <div className="text-sm">
                <span className="text-gray-600">Final approvals needed:</span>
                <span className="font-medium ml-2">{totalPending}</span>
              </div>
            )}
            {user?.role === 'student_service' && (
              <>
                <div className="text-sm">
                  <span className="text-gray-600">Total applications in system:</span>
                  <span className="font-medium ml-2">{allApplications.length}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Currently pending:</span>
                  <span className="font-medium ml-2">{totalPending}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Approved this year:</span>
                  <span className="font-medium ml-2">
                    {allApplications.filter(app => app.status === 'approved' && 
                      new Date(app.submittedDate).getFullYear() === new Date().getFullYear()).length}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-green-600" />
            Upcoming Events
          </h3>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <div className="font-medium text-gray-900">{event.eventName}</div>
                    <div className="text-sm text-gray-600">{event.societyName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{event.eventDate}</div>
                    <div className="text-xs text-gray-500">{event.timeFrom}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No upcoming events</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;